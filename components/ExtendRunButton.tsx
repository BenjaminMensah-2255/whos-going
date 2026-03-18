'use client';

import { useState } from 'react';
import { extendRun } from '@/app/actions/run-actions';
import { Clock, Plus } from 'lucide-react';

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
    <div className="relative block text-left">
      <div>
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          disabled={loading}
          className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
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
        <div className="absolute right-0 bottom-full mb-2 w-full sm:w-64 rounded-2xl shadow-2xl bg-white ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-wider bg-gray-50/50 border-b border-gray-100 mb-1">
              Add time & re-open
            </div>
            {[5, 10, 15, 30].map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleExtend(minutes)}
                className="group flex w-full items-center gap-3 px-5 py-3 text-sm text-[var(--charcoal)] hover:bg-[var(--beige)] transition-colors"
                role="menuitem"
              >
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Plus className="w-3.5 h-3.5 text-muted group-hover:text-[var(--charcoal)]" />
                </div>
                <span className="font-medium">+ {minutes} minutes</span>
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
