'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/app/actions/user-actions';
import { updateUserAdmin } from '@/app/actions/admin-actions';
import { User, Lightbulb } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const currentUser = await getCurrentUser();
    if (currentUser) {
      // Fetch full user details including email
      const response = await fetch('/api/debug-users');
      const data = await response.json();
      
      if (data.success) {
        const fullUser = data.users.find((u: any) => u.name === currentUser.name);
        if (fullUser) {
          setUser({
            id: currentUser.id,
            name: currentUser.name,
            email: fullUser.email !== 'No email' ? fullUser.email : undefined,
            phoneNumber: fullUser.phoneNumber,
            notificationsEnabled: fullUser.notificationsEnabled,
            createdAt: currentUser.createdAt,
          });
        }
      }
    }
    setLoading(false);
  }

  async function toggleNotifications() {
    if (!user) return;

    const result = await updateUserAdmin(user.id, {
      notificationsEnabled: !user.notificationsEnabled,
    });

    if (result.success) {
      setUser({ ...user, notificationsEnabled: !user.notificationsEnabled });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Not logged in</p>
          <a href="/login" className="btn-primary">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--charcoal)] flex items-center gap-2">
              <User className="w-6 h-6" />
              My Profile
            </h1>
            <div className="flex gap-3">
              <a href="/" className="btn-secondary">
                ← Back to Home
              </a>
              <form action={async () => {
                const { logoutUser } = await import('@/app/actions/user-actions');
                await logoutUser();
              }}>
                <button className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-[var(--charcoal)] mb-6">
            Account Information
          </h2>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="label">Name</label>
              <div className="input-field bg-[var(--beige)]/20 cursor-not-allowed">
                {user.name}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              {user.email ? (
                <div className="input-field bg-[var(--beige)]/20 cursor-not-allowed">
                  {user.email}
                </div>
              ) : (
                <div>
                  <div className="input-field bg-yellow-50 border-yellow-200 text-yellow-800">
                    No email set
                  </div>
                  <p className="text-xs text-muted mt-1">
                    To add an email, logout and login again with your email address
                  </p>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="label">Phone Number</label>
              {user.phoneNumber ? (
                <div className="input-field bg-[var(--beige)]/20 cursor-not-allowed">
                  {user.phoneNumber}
                </div>
              ) : (
                <div className="input-field bg-yellow-50 border-yellow-200 text-yellow-800">
                  No phone number set
                </div>
              )}
            </div>

            {/* Notifications */}
            {user.email && (
              <div>
                <label className="label">Email Notifications</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleNotifications}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      user.notificationsEnabled
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {user.notificationsEnabled ? '✓ Enabled' : '✗ Disabled'}
                  </button>
                  <span className="text-sm text-muted">
                    {user.notificationsEnabled
                      ? 'You will receive emails when new runs are posted'
                      : 'You will not receive email notifications'}
                  </span>
                </div>
              </div>
            )}

            {/* Member Since */}
            <div>
              <label className="label">Member Since</label>
              <div className="input-field bg-[var(--beige)]/20 cursor-not-allowed">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>• To update your email, logout and login again</li>
            <li>• Email notifications alert you when someone posts a new run</li>
            <li>• You can toggle notifications on/off anytime</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
