'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { closeRun, completeRun } from '@/app/actions/run-actions';

import ExtendRunButton from '@/components/ExtendRunButton';

interface RunActionsProps {
  runId: string;
  status: 'open' | 'closed' | 'completed';
}

export default function RunActions({ runId, status }: RunActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClose() {
    if (!confirm('Close this run? No more items can be added.')) return;
    
    setIsLoading(true);
    const result = await closeRun(runId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  }

  async function handleComplete() {
    if (!confirm('Mark this run as completed? It will be archived.')) return;
    
    setIsLoading(true);
    const result = await completeRun(runId);
    if (result.success) {
      router.push('/');
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  }

  return (
    <div className="card bg-[var(--beige)]/30">
      <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-4">
        Run Management
      </h3>

      <div className="space-y-3">
        {(status === 'open' || status === 'closed') && (
            <ExtendRunButton runId={runId} />
        )}

        {status === 'open' && (
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="btn-secondary w-full"
          >
            {isLoading ? 'Closing...' : 'Close Run (Stop Accepting Items)'}
          </button>
        )}

        {(status === 'open' || status === 'closed') && (
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Completing...' : 'Mark as Completed'}
          </button>
        )}

        {status === 'completed' && (
          <p className="text-center text-muted py-4">
            This run is completed and archived.
          </p>
        )}
      </div>
    </div>
  );
}
