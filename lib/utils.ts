export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercent(num: number): string {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function getColorClass(value: number, positive: string = 'text-nexus-green', negative: string = 'text-nexus-red', neutral: string = 'text-gray-400'): string {
  if (value > 0) return positive;
  if (value < 0) return negative;
  return neutral;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}