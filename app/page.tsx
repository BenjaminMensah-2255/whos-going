import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getActiveRuns } from './actions/run-actions';
import { getCurrentUser } from './actions/user-actions';
import RunCard from '@/components/RunCard';
import { User, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const runs = await getActiveRuns();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[var(--charcoal)]">
              Who's Going?
            </h1>
            <p className="text-sm text-muted">
              Welcome, {user.name}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <Link href="/profile" className="btn-secondary flex items-center gap-2 text-sm px-3 py-2">
              <User className="w-4 h-4" />
              Profile
            </Link>
            <form action={async () => {
              'use server';
              const { logoutUser } = await import('@/app/actions/user-actions');
              await logoutUser();
            }}>
              <button className="btn-secondary text-sm px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                Logout
              </button>
            </form>
            <Link href="/runs/new" className="btn-primary text-sm px-3 py-2">
              + New Run
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {runs.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="w-16 h-16 text-[var(--brown)]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--charcoal)] mb-2">
              No active runs
            </h2>
            <p className="text-muted mb-6">
              Be the first to post a run and let others join!
            </p>
            <Link href="/runs/new" className="btn-primary inline-block">
              Create First Run
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--charcoal)]">
                Active Runs
              </h2>
              <p className="text-sm text-muted">
                {runs.length} run{runs.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runs.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
