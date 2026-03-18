'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { getAllUsers, updateUserAdmin, deleteUserAdmin } from '@/app/actions/admin-actions';

interface UserData {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
  runCount: number;
  itemCount: number;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success && result.users) {
      setUsers(result.users);
    } else if (result.error === 'Unauthorized') {
      router.push('/admin');
    }
    setLoading(false);
  }

  async function handleToggleNotifications(userId: string, currentValue: boolean) {
    const result = await updateUserAdmin(userId, {
      notificationsEnabled: !currentValue,
    });
    
    if (result.success) {
      loadUsers();
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their runs and items.`)) {
      return;
    }

    const result = await deleteUserAdmin(userId);
    if (result.success) {
      loadUsers();
    } else {
      alert(result.error || 'Failed to delete user');
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <p className="text-muted">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--charcoal)]">
                User Management
              </h1>
            </div>
            <Link href="/admin/dashboard" className="btn-secondary h-9 px-4 text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--beige)]/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--charcoal)]">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--charcoal)]">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--charcoal)]">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--charcoal)]">Notifications</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--charcoal)]">Stats</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--charcoal)]">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--charcoal)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sand)]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--beige)]/10">
                    <td className="px-4 py-3">
                      <span className="font-medium text-[var(--charcoal)]">{user.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.email ? (
                        <span className="text-sm text-[var(--charcoal)]">{user.email}</span>
                      ) : (
                        <span className="text-sm text-muted italic">No email</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleNotifications(user.id, user.notificationsEnabled)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.notificationsEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.notificationsEnabled ? '✓ Enabled' : '✗ Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="text-muted">{user.runCount} runs</span>
                        <span className="mx-1">•</span>
                        <span className="text-muted">{user.itemCount} items</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted">No users found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
