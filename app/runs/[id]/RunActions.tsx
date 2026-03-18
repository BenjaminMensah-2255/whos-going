'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { closeRun, completeRun, deleteRun } from '@/app/actions/run-actions';
import { Lock, CheckCircle2, Trash2 } from 'lucide-react';

import ExtendRunButton from '@/components/ExtendRunButton';
import ConfirmationModal from '@/components/ConfirmationModal';

interface RunActionsProps {
  runId: string;
  status: 'open' | 'closed' | 'completed';
}

export default function RunActions({ runId, status }: RunActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    const result = await deleteRun(runId);
    if (result.success) {
      router.push('/');
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  }

  async function handleClose() {
    setIsLoading(true);
    const result = await closeRun(runId);
    if (result.success) {
      setShowCloseModal(false);
      router.refresh();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  }

  async function handleComplete() {
    setIsLoading(true);
    const result = await completeRun(runId);
    if (result.success) {
      setShowCompleteModal(false);
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
            onClick={() => setShowCloseModal(true)}
            disabled={isLoading}
            className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Closing...' : (
              <>
                <Lock className="w-4 h-4" />
                Close Run (Stop Accepting Items)
              </>
            )}
          </button>
        )}

        {(status === 'open' || status === 'closed') && (
          <button
            onClick={() => setShowCompleteModal(true)}
            disabled={isLoading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Completing...' : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Mark as Completed
              </>
            )}
          </button>
        )}

        {status === 'completed' && (
          <p className="text-center text-muted py-4">
            This run is completed and archived.
          </p>
        )}

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isLoading}
          className="w-full py-3 text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-colors mt-4"
        >
          <Trash2 className="w-4 h-4" />
          Delete Run
        </button>
      </div>

      <ConfirmationModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleClose}
        isLoading={isLoading}
        title="Close Run?"
        message="This will stop accepting new items for this run. You can still see who's going, but the order will be locked."
        confirmText="Close Run"
        variant="warning"
      />

      <ConfirmationModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleComplete}
        isLoading={isLoading}
        title="Mark as Completed?"
        message="This will archive the run and return you to the dashboard. The items list will still be visible to attendees."
        confirmText="Complete Run"
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title="Delete Run?"
        message="This will permanently delete this run and all associated items. This action cannot be undone."
        confirmText="Delete Run"
        variant="danger"
      />
    </div>
  );
}
