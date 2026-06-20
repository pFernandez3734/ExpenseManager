import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function availabilityColor(pct: number): string {
  if (pct > 30) return 'text-green-600';
  if (pct > 10) return 'text-yellow-600';
  return 'text-red-600';
}

export function budgetStatusColor(pct: number): string {
  if (pct < 80) return 'bg-green-500';
  if (pct < 100) return 'bg-yellow-500';
  return 'bg-red-500';
}
