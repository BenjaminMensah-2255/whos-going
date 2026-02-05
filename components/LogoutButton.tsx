'use client';

import { useRouter } from 'next/navigation';
import { adminLogout } from '@/app/actions/admin-actions';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await adminLogout();
    router.push('/admin');
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="btn-secondary">
      Logout
    </button>
  );
}
