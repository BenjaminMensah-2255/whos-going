'use client';

import { useState } from 'react';

export default function VercelTestEmailPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function sendTest() {
    if (!email) {
      alert('Please enter an email');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-6">
          🚀 Production Email Tester
        </h1>

        <div className="card mb-6">
          <p className="mb-4">
            Enter an email address to test if Vercel can actually send emails using your Gmail credentials.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email to test"
              className="input-field flex-1"
            />
            <button
              onClick={sendTest}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`card ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className="font-semibold mb-2">
              {result.success ? '✅ Success!' : '❌ Error Details:'}
            </h3>
            
            {!result.success && (
              <div className="text-red-700 bg-red-100 p-3 rounded mb-3 font-mono text-sm break-all">
                {typeof result.error === 'object' ? JSON.stringify(result.error) : result.error}
              </div>
            )}

            <pre className="text-xs text-muted overflow-auto max-h-40 bg-white p-2 rounded border border-gray-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-[var(--sand)]">
          <h2 className="text-lg font-bold mb-2">Debug Checklist:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Did you add <strong>GMAIL_USER</strong> to Vercel env vars?</li>
            <li>Did you add <strong>GMAIL_APP_PASSWORD</strong> to Vercel env vars?</li>
            <li>Did you <strong>Redeploy</strong> after adding them?</li>
            <li>Is 2FA enabled on the Gmail account?</li>
          </ul>
        </div>

        <div className="mt-6">
          <a href="/" className="btn-secondary">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
