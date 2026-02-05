'use client';

import { useState, FormEvent } from 'react';
import { loginUser } from '@/app/actions/user-actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;

    const result = await loginUser(name, email || undefined);
    
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error || 'Failed to login');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">
            Who's Going?
          </h1>
          <p className="text-muted">
            Coordinate group orders and save on delivery
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)] mb-6">
            Welcome
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                What's your name?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={50}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-field"
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-muted mt-1">
                Get notified when someone posts a new run
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || name.trim().length < 2}
              className="btn-primary w-full"
            >
              {isLoading ? 'Logging in...' : 'Continue'}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm text-muted mt-6">
          Simple name-based authentication. No passwords required.
        </p>
      </div>
    </div>
  );
}
