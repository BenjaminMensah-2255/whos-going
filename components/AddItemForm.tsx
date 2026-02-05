'use client';

import { useState } from 'react';
import { addItem } from '@/app/actions/item-actions';
import { formatCurrency } from '@/lib/utils/currency';

interface AddItemFormProps {
  runId: string;
  onSuccess?: () => void;
}

export default function AddItemForm({ runId, onSuccess }: AddItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const result = await addItem(runId, {
      name: formData.get('name') as string,
      quantity: parseInt(formData.get('quantity') as string),
      price: parseFloat(formData.get('price') as string),
    });

    if (result.success) {
      // Page will reload, no need to reset form
      if (onSuccess) onSuccess();
      window.location.reload();
    } else {
      setError(result.error || 'Failed to add item');
    }
    
    setIsLoading(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary w-full"
      >
        + Add Item
      </button>
    );
  }

  return (
    <div className="card bg-[var(--beige)]/30">
      <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-4">
        Add Your Item
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name */}
        <div>
          <label htmlFor="name" className="label">
            What do you want? *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="input-field"
            placeholder="e.g., Burrito bowl with chicken"
            required
            minLength={1}
            maxLength={200}
            autoFocus
          />
        </div>

        {/* Quantity and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="label">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="input-field"
              min="1"
              max="999"
              defaultValue="1"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="label">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">GH₵</span>
              <input
                type="number"
                id="price"
                name="price"
                className="input-field pl-12"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError('');
            }}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
