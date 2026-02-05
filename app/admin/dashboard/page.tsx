import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated, getAdminStats } from '@/app/actions/admin-actions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const isAdmin = await isAdminAuthenticated();
  
  if (!isAdmin) {
    redirect('/admin');
  }

  const statsResult = await getAdminStats();
  const stats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--charcoal)]">
              🔐 Admin Dashboard
            </h1>
            <p className="text-sm text-muted">
              Manage users and view statistics
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="btn-secondary">
              ← Back to App
            </Link>
            <Link href="/admin" className="btn-secondary">
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-muted mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-[var(--charcoal)]">{stats.totalUsers}</p>
            </div>
            
            <div className="card">
              <h3 className="text-sm font-medium text-muted mb-2">Users with Email</h3>
              <p className="text-3xl font-bold text-green-600">{stats.usersWithEmail}</p>
              <p className="text-xs text-muted mt-1">
                {stats.usersWithoutEmail} without email
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-sm font-medium text-muted mb-2">Active Runs</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.activeRuns}</p>
              <p className="text-xs text-muted mt-1">
                {stats.completedRuns} completed
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-sm font-medium text-muted mb-2">Total Items</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalItems}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/users" className="card hover:border-[var(--charcoal)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-4xl">👥</div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-1">
                  Manage Users
                </h3>
                <p className="text-sm text-muted">
                  View, edit, and manage all users
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/test-email" className="card hover:border-[var(--charcoal)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📧</div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-1">
                  Test Email
                </h3>
                <p className="text-sm text-muted">
                  Send test email to verify configuration
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
