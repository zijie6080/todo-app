import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isYesterday, isPast, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueDate(dateStr?: string): { label: string; urgent: boolean; overdue: boolean } {
  if (!dateStr) return { label: '', urgent: false, overdue: false };
  const date = parseISO(dateStr);
  const overdue = isPast(date) && !isToday(date);
  const urgent = isToday(date) || isTomorrow(date);
  let label = '';
  if (isToday(date)) label = '今天';
  else if (isTomorrow(date)) label = '明天';
  else if (isYesterday(date)) label = '昨天';
  else label = format(date, 'M月d日', { locale: zhCN });
  return { label, urgent, overdue };
}

export const PRIORITY_CONFIG = {
  high: { label: '高优先级', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  medium: { label: '中优先级', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  low: { label: '低优先级', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

export const CATEGORY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#f97316',
  '#22c55e', '#14b8a6', '#f59e0b', '#ef4444',
];
