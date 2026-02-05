'use client';

import { useState, FormEvent } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({ success: true, message: 'Test email sent successfully! Check your inbox.' });
      } else {
        setResult({ success: false, message: data.error || 'Failed to send test email' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error. Please try again.' });
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--sand)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--charcoal)]">
              📧 Test Email Configuration
            </h1>
            <a href="/admin/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-[var(--charcoal)] mb-4">
            Send Test Email
          </h2>
          <p className="text-muted mb-6">
            Enter an email address to test your Resend configuration. You should receive a test email within a few seconds.
          </p>

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

            {result && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                result.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {result.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="btn-primary"
            >
              {isLoading ? 'Sending...' : 'Send Test Email'}
            </button>
          </form>
        </div>

        {/* Configuration Info */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-3">
            Current Configuration
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--charcoal)]">API Key:</span>
              <span className="text-muted">
                {process.env.NEXT_PUBLIC_RESEND_CONFIGURED ? '✓ Configured' : '✗ Not configured'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--charcoal)]">From Address:</span>
              <span className="text-muted">onboarding@resend.dev</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
