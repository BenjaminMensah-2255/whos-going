import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserRunHistory } from '@/app/actions/run-actions';
import { getCurrentUser } from '@/app/actions/user-actions';
import RunCard from '@/components/RunCard';
import { History, ArrowLeft, TrendingUp, ShoppingCart, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const history = await getUserRunHistory();

  const totalRuns = history.length;
  const totalItems = history.reduce((sum, run) => sum + run.itemCount, 0);
  const completedRuns = history.filter(run => run.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[var(--cream)]/30 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)] sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-[var(--charcoal)]"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[var(--charcoal)]">
                My Run History
              </h1>
              <p className="text-xs text-muted">
                You've created {totalRuns} run{totalRuns !== 1 ? 's' : ''} in total
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
              <TrendingUp className="w-3.5 h-3.5" />
              TOP RUNNER
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card bg-white p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">Total Runs</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">{totalRuns}</p>
            </div>
          </div>
          
          <div className="card bg-white p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">Total Items</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">{totalItems}</p>
            </div>
          </div>

          <div className="card bg-white p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-black text-[var(--charcoal)]">{completedRuns}</p>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[var(--sand)]">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-[var(--beige)]/50 flex items-center justify-center text-[var(--brown)]">
                <History className="w-10 h-10" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--charcoal)] mb-2">
              No history yet
            </h2>
            <p className="text-muted mb-8 max-w-sm mx-auto">
              Runs you create will appear here so you can keep track of everything you've embarked on.
            </p>
            <Link href="/runs/new" className="btn-primary inline-flex px-8 py-3">
              Start Your First Run
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((run) => (
              <div key={run.id} className="relative group">
                <RunCard run={run} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <div className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur shadow-sm text-[10px] font-bold text-muted border border-gray-100 uppercase">
                     View Details
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
