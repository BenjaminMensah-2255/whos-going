import Link from 'next/link';
import Timer from './Timer';
import type { RunWithDetails } from '@/app/actions/run-actions';

interface RunCardProps {
  run: RunWithDetails;
}

export default function RunCard({ run }: RunCardProps) {
  const getStatusBadge = () => {
    switch (run.status) {
      case 'open':
        return <span className="badge badge-open">Open</span>;
      case 'closed':
        return <span className="badge badge-closed">Closed</span>;
      case 'completed':
        return <span className="badge badge-completed">Completed</span>;
    }
  };

  return (
    <Link href={`/runs/${run.id}`} className="block">
      <div className="card hover:border-[var(--charcoal)] transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-1">
              {run.vendorName}
            </h3>
            <p className="text-sm text-muted">
              Runner: <span className="font-medium text-[var(--charcoal)]">{run.runnerName}</span>
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Timer */}
        <div className="mb-4">
          <Timer 
            departureTime={run.departureTime} 
            createdAt={run.createdAt}
            runId={run.id}
            status={run.status}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {run.itemCount === 0 ? 'No items yet' : `${run.itemCount} item${run.itemCount !== 1 ? 's' : ''}`}
          </span>
          {run.note && (
            <span className="text-muted italic truncate max-w-[200px]">
              "{run.note}"
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
