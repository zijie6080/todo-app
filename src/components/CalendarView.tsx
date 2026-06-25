import React from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Task } from '../api/types';

interface Props {
  currentMonth: Date;
  selectedDate: Date;
  tasks: Task[];
  onSelectDate: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};

export default function CalendarView({ currentMonth, selectedDate, tasks, onSelectDate, onMonthChange }: Props) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1); }
    weeks.push(week);
  }

  const getTasksForDate = (d: Date) => tasks.filter(t => t.due_date === format(d, 'yyyy-MM-dd'));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">
          {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-50">
        {['一', '二', '三', '四', '五', '六', '日'].map(d => (
          <div key={d} className="py-2.5 text-center text-xs font-medium text-gray-400">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-0">
            {week.map((d, di) => {
              const dayTasks = getTasksForDate(d);
              const pending = dayTasks.filter(t => t.status === 'pending');
              const completed = dayTasks.filter(t => t.status === 'completed');
              const isSelected = isSameDay(d, selectedDate);
              const isCurrentMonth = isSameMonth(d, currentMonth);
              const today = isToday(d);

              return (
                <button
                  key={di}
                  onClick={() => onSelectDate(d)}
                  className={cn(
                    'relative min-h-[90px] p-2 text-left transition-all border-r border-gray-50 last:border-r-0',
                    'hover:bg-primary-50/40',
                    isSelected ? 'bg-primary-50' : '',
                    !isCurrentMonth ? 'opacity-35' : ''
                  )}
                >
                  {/* Day number */}
                  <span className={cn(
                    'inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full',
                    today ? 'bg-primary-500 text-white' : 'text-gray-700',
                    isSelected && !today ? 'ring-2 ring-primary-300 ring-offset-1' : ''
                  )}>
                    {format(d, 'd')}
                  </span>

                  {/* Tasks preview */}
                  <div className="mt-1 space-y-0.5">
                    {pending.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className={cn(
                          'flex items-center gap-1 text-xs rounded px-1 py-0.5 truncate',
                          t.priority === 'high' ? 'bg-red-50 text-red-600' :
                          t.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_DOT[t.priority])} />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                    {pending.length > 2 && (
                      <div className="text-xs text-gray-400 px-1">+{pending.length - 2} 个</div>
                    )}
                    {completed.length > 0 && pending.length === 0 && (
                      <div className="text-xs text-emerald-500 px-1">✓ {completed.length} 完成</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
