'use client';

import { formatCurrency, calculateUserTotals, calculateTotal } from '@/lib/utils/currency';

interface ItemWithUser {
  id: string;
  userId: string;
  userName: string;
  name: string;
  quantity: number;
  price: number;
  isPaid: boolean;
}

interface PaymentSummaryProps {
  items: ItemWithUser[];
}

export default function PaymentSummary({ items }: PaymentSummaryProps) {
  const userTotals = calculateUserTotals(items);
  const grandTotal = calculateTotal(items);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-4">
        Payment Summary
      </h3>

      <div className="space-y-3 mb-4">
        {userTotals.map((user) => (
          <div key={user.name} className="flex items-center justify-between p-3 bg-[var(--beige)]/20 rounded-lg">
            <div>
              <p className="font-medium text-[var(--charcoal)]">{user.name}</p>
              <p className="text-sm text-muted">
                {user.items.length} item{user.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="font-semibold text-[var(--charcoal)]">
              {formatCurrency(user.total)}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--sand)]">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[var(--charcoal)]">
            Grand Total
          </span>
          <span className="text-2xl font-bold text-[var(--charcoal)]">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
