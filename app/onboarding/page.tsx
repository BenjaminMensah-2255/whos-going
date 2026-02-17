'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/user-actions';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') as string,
    };

    const result = await updateProfile(data);

    if (result.success) {
      // Use window.location for hard redirect to avoid caching issues
      window.location.href = '/';
    } else {
      setError(result.error || 'Failed to update profile');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--cream)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-2">
            Almost there!
          </h1>
          <p className="text-muted">
            Please complete your profile to continue
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                What's your name?
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input-field"
                placeholder="e.g. John Doe"
                required
                minLength={2}
                maxLength={50}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className="input-field"
                placeholder="024 123 4567"
                required
              />
              <p className="text-xs text-muted mt-1">
                Used for coordinating deliveries
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
