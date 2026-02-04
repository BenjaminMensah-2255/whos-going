/**
 * Format milliseconds to human-readable time
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Time\'s up!';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Get color class based on time remaining
 */
export function getTimeColor(ms: number): string {
  if (ms > 600000) return 'text-green-600'; // >10 mins
  if (ms > 300000) return 'text-yellow-600'; // >5 mins
  return 'text-red-600'; // <5 mins
}

/**
 * Calculate percentage for progress bar
 */
export function getTimePercentage(departureTime: string, createdAt: string): number {
  const now = Date.now();
  const departure = new Date(departureTime).getTime();
  const created = new Date(createdAt).getTime();
  
  const total = departure - created;
  const elapsed = now - created;
  const remaining = Math.max(0, 100 - (elapsed / total) * 100);
  
  return Math.min(100, Math.max(0, remaining));
}

/**
 * Calculate remaining milliseconds
 */
export function getRemainingMs(departureTime: string): number {
  const now = Date.now();
  const departure = new Date(departureTime).getTime();
  return Math.max(0, departure - now);
}
