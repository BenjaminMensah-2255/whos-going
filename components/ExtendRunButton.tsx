'use client';

import { useState } from 'react';
import { extendRun } from '@/app/actions/run-actions';
import { Clock } from 'lucide-react';

interface ExtendRunButtonProps {
  runId: string;
}

export default function ExtendRunButton({ runId }: ExtendRunButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExtend = async (minutes: number) => {
    try {
      setLoading(true);
      await extendRun(runId, minutes);
      setShowOptions(false);
    } catch (error) {
      console.error('Failed to extend run:', error);
      alert('Failed to extend run');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          disabled={loading}
          className="inline-flex justify-center items-center gap-2 w-full px-4 py-2 text-sm font-medium text-[var(--charcoal)] bg-white border border-[var(--sand)] rounded-md shadow-sm hover:bg-[var(--cream)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brown)]"
        >
          {loading ? 'Updating...' : (
            <>
              <Clock className="w-4 h-4" />
              Extend Time
            </>
          )}
        </button>
      </div>

      {showOptions && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              Add time & re-open
            </div>
            {[5, 10, 15, 30].map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleExtend(minutes)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[var(--beige)] hover:text-gray-900"
                role="menuitem"
              >
                + {minutes} minutes
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Click outside closer overlay (simple version) */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
