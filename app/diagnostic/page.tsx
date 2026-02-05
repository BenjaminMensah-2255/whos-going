import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DiagnosticPage() {
  await dbConnect();
  
  const users = await User.find({}).select('name email notificationsEnabled emailVerified').lean();

  return (
    <div className="min-h-screen bg-[var(--cream)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-6">
          📊 User Email Diagnostic
        </h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">All Users in Database</h2>
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={index} className="border border-[var(--sand)] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {user.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>{' '}
                    {user.email || <span className="text-red-600">❌ NO EMAIL</span>}
                  </div>
                  <div>
                    <span className="font-medium">Notifications:</span>{' '}
                    {user.notificationsEnabled ? (
                      <span className="text-green-600">✅ Enabled</span>
                    ) : (
                      <span className="text-red-600">❌ Disabled</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Email Verified:</span>{' '}
                    {user.emailVerified ? '✅ Yes' : '⚠️ No'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-[var(--charcoal)] mb-2">
            🔍 What to Check:
          </h3>
          <ul className="text-sm space-y-1 text-[var(--charcoal)]">
            <li>• Does "felicia eduah" appear in the list above?</li>
            <li>• Is her email "benjamin.mensah005@stu.ucc.edu.gh"?</li>
            <li>• Are notifications enabled for her?</li>
            <li>• If any of these are wrong, she needs to logout and login again with her email</li>
          </ul>
        </div>

        <div className="mt-6">
          <a href="/" className="btn-primary">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
