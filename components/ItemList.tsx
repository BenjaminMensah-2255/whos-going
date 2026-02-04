'use client';

import { useState } from 'react';
import { deleteItem, updateItem } from '@/app/actions/item-actions';
import { formatCurrency } from '@/lib/utils/currency';

interface ItemWithUser {
  id: string;
  userId: string;
  userName: string;
  name: string;
  quantity: number;
  price: number;
  isPaid: boolean;
}

interface ItemListProps {
  items: ItemWithUser[];
  currentUserId: string;
  runStatus: 'open' | 'closed' | 'completed';
  onUpdate?: () => void;
}

export default function ItemList({ items, currentUserId, runStatus, onUpdate }: ItemListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const canEdit = runStatus === 'open';

  // Group items by user
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.userId]) {
      acc[item.userId] = {
        userName: item.userName,
        items: [],
        total: 0,
      };
    }
    acc[item.userId].items.push(item);
    acc[item.userId].total += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { userName: string; items: ItemWithUser[]; total: number }>);

  async function handleDelete(itemId: string) {
    if (!confirm('Delete this item?')) return;
    
    setIsDeleting(itemId);
    const result = await deleteItem(itemId);
    if (result.success) {
      if (onUpdate) onUpdate();
      window.location.reload();
    }
    setIsDeleting(null);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        No items added yet. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([userId, group]) => (
        <div key={userId} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--charcoal)]">
              {group.userName}
            </h3>
            <span className="text-sm font-medium text-[var(--charcoal)]">
              {formatCurrency(group.total)}
            </span>
          </div>

          <div className="space-y-3">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 p-3 bg-[var(--beige)]/20 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--charcoal)]">
                    {item.name}
                  </p>
                  <p className="text-sm text-muted">
                    Qty: {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                {/* Actions (only for item owner and if run is open) */}
                {canEdit && item.userId === currentUserId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
