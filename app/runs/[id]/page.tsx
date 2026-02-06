import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getRunById, closeRun, completeRun } from '@/app/actions/run-actions';
import { getCurrentUser } from '@/app/actions/user-actions';
import Timer from '@/components/Timer';
import AddItemForm from '@/components/AddItemForm';
import ItemList from '@/components/ItemList';
import ChecklistView from '@/components/ChecklistView';
import PaymentSummary from '@/components/PaymentSummary';
import RunActions from '@/app/runs/[id]/RunActions';
import { Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RunDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const run = await getRunById(id);

  if (!run) {
    notFound();
  }

  const isRunner = user.id === run.runnerUserId;
  const canAddItems = run.status === 'open';

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-[var(--charcoal)] hover:text-[var(--soft-black)] flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to runs
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-1">
                {run.vendorName}
              </h1>
              <p className="text-muted">
                Runner: <span className="font-medium text-[var(--charcoal)]">{run.runnerName}</span>
                {isRunner && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>}
              </p>
            </div>
            <StatusBadge status={run.status} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Timer */}
        <div className="card">
          <Timer 
            departureTime={run.departureTime}
            createdAt={run.createdAt}
            runId={run.id}
            status={run.status}
          />
          {run.note && (
            <div className="mt-4 p-3 bg-[var(--beige)]/30 rounded-lg">
              <p className="text-sm text-[var(--charcoal)]">
                <span className="font-medium">Note:</span> {run.note}
              </p>
            </div>
          )}
        </div>

        {/* Runner View */}
        {isRunner ? (
          <>
            <ChecklistView items={run.items} />
            <PaymentSummary items={run.items} />
            <RunActions runId={run.id} status={run.status} />
          </>
        ) : (
          /* Regular User View */
          <>
            {canAddItems && (
              <AddItemForm runId={run.id} />
            )}
            
            {!canAddItems && run.status === 'closed' && (
              <div className="card bg-yellow-50 border-yellow-200">
                <p className="text-yellow-800 text-center flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  This run is closed. No more items can be added.
                </p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-[var(--charcoal)] mb-4">
                Current Items
              </h2>
              <ItemList 
                items={run.items}
                currentUserId={user.id}
                runStatus={run.status}
              />
            </div>

            <PaymentSummary items={run.items} />
          </>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: 'open' | 'closed' | 'completed' }) {
  const badges = {
    open: <span className="badge badge-open">Open</span>,
    closed: <span className="badge badge-closed">Closed</span>,
    completed: <span className="badge badge-completed">Completed</span>,
  };
  return badges[status];
}
