'use client';

import { useState } from 'react';
import { toggleItemPaid } from '@/app/actions/item-actions';

interface ItemWithUser {
  id: string;
  userId: string;
  userName: string;
  name: string;
  quantity: number;
  price: number;
  isPaid: boolean;
}

interface ChecklistViewProps {
  items: ItemWithUser[];
  onUpdate?: () => void;
}

export default function ChecklistView({ items, onUpdate }: ChecklistViewProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Group items by name for shopping list
  const groupedByName = items.reduce((acc, item) => {
    const key = item.name.toLowerCase();
    if (!acc[key]) {
      acc[key] = {
        name: item.name,
        totalQuantity: 0,
        items: [],
      };
    }
    acc[key].totalQuantity += item.quantity;
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; totalQuantity: number; items: ItemWithUser[] }>);

  async function handleTogglePaid(itemId: string) {
    setTogglingId(itemId);
    const result = await toggleItemPaid(itemId);
    if (result.success) {
      if (onUpdate) onUpdate();
      window.location.reload();
    }
    setTogglingId(null);
  }

  const totalItems = items.length;
  const paidItems = items.filter(i => i.isPaid).length;

  if (items.length === 0) {
    return (
      <div className="card">
        <p className="text-center text-muted py-8">
          No items to pick up yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="card bg-[var(--beige)]/30">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-[var(--charcoal)]">
            Shopping Progress
          </span>
          <span className="text-sm text-muted">
            {paidItems} of {totalItems} items
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(paidItems / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* Shopping List (grouped by item name) */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-4">
          Shopping List
        </h3>
        <div className="space-y-2">
          {Object.values(groupedByName).map((group) => (
            <div key={group.name} className="p-3 bg-[var(--beige)]/20 rounded-lg">
              <p className="font-medium text-[var(--charcoal)]">
                {group.name}
              </p>
              <p className="text-sm text-muted">
                Total quantity: {group.totalQuantity}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Items (for payment tracking) */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-4">
          Payment Tracking
        </h3>
        <div className="space-y-2">
          {items.map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                item.isPaid ? 'bg-green-50' : 'bg-[var(--beige)]/20 hover:bg-[var(--beige)]/40'
              }`}
            >
              <input
                type="checkbox"
                checked={item.isPaid}
                onChange={() => handleTogglePaid(item.id)}
                disabled={togglingId === item.id}
                className="mt-1 w-5 h-5 rounded border-[var(--sand)] text-green-600 focus:ring-2 focus:ring-green-500"
              />
              <div className="flex-1">
                <p className={`font-medium ${item.isPaid ? 'line-through text-muted' : 'text-[var(--charcoal)]'}`}>
                  {item.userName}: {item.name}
                </p>
                <p className="text-sm text-muted">
                  {item.quantity} × GHS {item.price.toFixed(2)} = GHS {(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
              {item.isPaid && (
                <span className="text-green-600 text-sm font-medium">Paid</span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
