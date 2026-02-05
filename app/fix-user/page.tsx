'use client';

import { useState } from 'react';

export default function FixUserPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function fixVivian() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldName: 'vivian',
          newName: 'felicia eduah',
          newEmail: 'benjamin.mensah005@stu.ucc.edu.gh',
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to update user' });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-6">
          🔧 Fix User Email
        </h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Update Vivian to Felicia</h2>
          <p className="text-muted mb-4">
            This will update the user "vivian" to:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-6">
            <li>Name: <strong>felicia eduah</strong></li>
            <li>Email: <strong>benjamin.mensah005@stu.ucc.edu.gh</strong></li>
            <li>Notifications: <strong>Enabled</strong></li>
          </ul>

          <button
            onClick={fixVivian}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </div>

        {result && (
          <div className={`card ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className="font-semibold mb-2">
              {result.success ? '✅ Success!' : '❌ Error'}
            </h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <a href="/diagnostic" className="btn-secondary mr-3">
            View All Users
          </a>
          <a href="/" className="btn-secondary">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
