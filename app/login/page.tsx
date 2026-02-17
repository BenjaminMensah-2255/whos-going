'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { requestMagicLink } from '@/app/actions/user-actions';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'invalid-link') {
        setError('Invalid or missing login link');
      } else if (errorParam === 'expired') {
        setError('This login link has expired or has already been used');
      } else {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await requestMagicLink(email);
    
    if (result.success) {
      setIsSent(true);
    } else {
      setError(result.error || 'Failed to send login link');
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--cream)]">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-semibold text-[var(--charcoal)] mb-2">
              Check your email
            </h2>
            <p className="text-muted mb-6">
              We sent a login link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted mb-6">
              Click the link in the email to sign in. You can close this tab.
            </p>
            <button 
              onClick={() => {
                setIsSent(false);
                setIsLoading(false);
                setEmail('');
              }}
              className="text-[var(--brown)] hover:scale-105 transition-transform text-sm font-medium"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--cream)]">
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
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your.email@example.com"
                required
                autoFocus
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="btn-primary w-full"
            >
              {isLoading ? 'Sending Link...' : 'Send Login Link'}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm text-muted mt-6">
          We'll send you a magic link to sign in password-free.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
        <p className="text-muted">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
