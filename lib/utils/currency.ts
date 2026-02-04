/**
 * Format number as currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate total cost for items
 */
export function calculateTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculate per-user totals
 */
export function calculateUserTotals(items: Array<{ userId: string; userName: string; price: number; quantity: number }>) {
  const userMap = new Map<string, { name: string; total: number; items: typeof items }>();

  items.forEach(item => {
    const existing = userMap.get(item.userId);
    const itemTotal = item.price * item.quantity;

    if (existing) {
      existing.total += itemTotal;
      existing.items.push(item);
    } else {
      userMap.set(item.userId, {
        name: item.userName,
        total: itemTotal,
        items: [item],
      });
    }
  });

  return Array.from(userMap.values());
}
