'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createRun } from '@/app/actions/run-actions';

export default function NewRunPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const result = await createRun({
      vendorName: formData.get('vendor') as string,
      departureMinutes: parseInt(formData.get('minutes') as string),
      note: formData.get('note') as string || undefined,
    });

    if (result.success) {
      router.push(`/runs/${result.runId}`);
    } else {
      setError(result.error || 'Failed to create run');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-[var(--charcoal)] hover:text-[var(--soft-black)] flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to runs
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-2">
            Post a New Run
          </h1>
          <p className="text-muted">
            Let others know where you're going and when you're leaving
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Name */}
            <div>
              <label htmlFor="vendor" className="label">
                Where are you going? *
              </label>
              <input
                type="text"
                id="vendor"
                name="vendor"
                className="input-field"
                placeholder="e.g., Chipotle, Starbucks, Target"
                required
                minLength={2}
                maxLength={100}
                autoFocus
              />
            </div>

            {/* Departure Time */}
            <div>
              <label htmlFor="minutes" className="label">
                Leaving in how many minutes? *
              </label>
              <select
                id="minutes"
                name="minutes"
                className="input-field"
                defaultValue="20"
                required
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
              <p className="text-xs text-muted mt-1">
                Others can add items until this time
              </p>
            </div>

            {/* Optional Note */}
            <div>
              <label htmlFor="note" className="label">
                Note (optional)
              </label>
              <textarea
                id="note"
                name="note"
                className="input-field resize-none"
                placeholder="Any special instructions or details..."
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/" className="btn-secondary flex-1 text-center">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? 'Creating...' : 'Post Run'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
