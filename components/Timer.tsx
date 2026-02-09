'use client';

import { useEffect, useState } from 'react';
import { closeRun } from '@/app/actions/run-actions';
import { formatTimeRemaining, getTimeColor, getRemainingMs, getTimePercentage } from '@/lib/utils/time';

interface TimerProps {
  departureTime: string;
  createdAt: string;
  runId: string;
  status: 'open' | 'closed' | 'completed';
}

export default function Timer({ departureTime, createdAt, runId, status }: TimerProps) {
  const [remaining, setRemaining] = useState(getRemainingMs(departureTime));
  const [hasAutoClosed, setHasAutoClosed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemaining = getRemainingMs(departureTime);
      setRemaining(newRemaining);

      // Auto-close when timer hits 0
      if (newRemaining <= 0 && status === 'open' && !hasAutoClosed) {
        setHasAutoClosed(true);
        closeRun(runId).then(() => {
          console.log('Run auto-closed');
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [departureTime, runId, status, hasAutoClosed]);

  const percentage = getTimePercentage(departureTime, createdAt);
  const colorClass = getTimeColor(remaining);

  return (
    <div className="space-y-2">
      {/* Countdown Display */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-[var(--warm-gray)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-base sm:text-lg font-semibold ${colorClass}`} suppressHydrationWarning>
          {remaining > 0 ? `Leaving in ${formatTimeRemaining(remaining)}` : 'Departed'}
        </span>
      </div>

      {/* Progress Bar */}
      {status === 'open' && (
        <div className="w-full bg-[var(--beige)] rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              remaining > 600000 ? 'bg-green-500' :
              remaining > 300000 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
