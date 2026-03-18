import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated, getAdminStats, adminLogout } from '@/app/actions/admin-actions';
import { ArrowLeft, LogOut, ShieldCheck, Users, Mail, Activity, Package, MailCheck } from 'lucide-react';

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--charcoal)]">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted">
                Manage users and view statistics
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="btn-secondary h-9 px-4 text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
            
            <form action={async () => {
              'use server';
              const { adminLogout } = await import('@/app/actions/admin-actions');
              await adminLogout();
              redirect('/admin');
            }}>
              <button 
                type="submit" 
                className="btn-secondary h-9 px-4 text-sm flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-[var(--charcoal)]">{stats.totalUsers}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            
            <div className="card flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Users with Email</h3>
                <p className="text-3xl font-bold text-green-600">{stats.usersWithEmail}</p>
                <p className="text-xs text-muted mt-1">
                  {stats.usersWithoutEmail} without email
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <MailCheck className="w-5 h-5" />
              </div>
            </div>
            
            <div className="card flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Active Runs</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.activeRuns}</p>
                <p className="text-xs text-muted mt-1">
                  {stats.completedRuns} completed
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            
            <div className="card flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Total Items</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalItems}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/users" className="card hover:border-[var(--charcoal)] transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-8 h-8" />
              </div>
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

          <Link href="/admin/test-email" className="card hover:border-[var(--charcoal)] transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Mail className="w-8 h-8" />
              </div>
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
