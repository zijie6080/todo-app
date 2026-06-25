import React, { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Task } from '../api/types';

interface Props {
  tasks: Task[];
  onTaskClick?: (t: Task) => void;
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};

export default function CalendarView({ tasks, onTaskClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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
  const selectedTasks = getTasksForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">日历</h1>
        <p className="text-sm text-gray-400 mt-0.5">{format(currentMonth, 'yyyy年 M月', { locale: zhCN })}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">{format(currentMonth, 'yyyy年 M月', { locale: zhCN })}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-50">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(d => (
            <div key={d} className="py-3 text-center text-sm font-medium text-gray-400">{d}</div>
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
                const todayDay = isToday(d);

                return (
                  <button
                    key={di}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      'relative min-h-[90px] p-2 text-left transition-all border-r border-gray-50 last:border-r-0',
                      'hover:bg-primary-50/40',
                      isSelected ? 'bg-primary-50' : '',
                      !isCurrentMonth ? 'opacity-35' : ''
                    )}
                  >
                    <span className={cn(
                      'inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full',
                      todayDay ? 'bg-primary-500 text-white' : 'text-gray-700',
                      isSelected && !todayDay ? 'ring-2 ring-primary-300 ring-offset-1' : ''
                    )}>
                      {format(d, 'd')}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {pending.slice(0, 2).map(t => (
                        <div key={t.id} className={cn(
                          'flex items-center gap-1 text-xs rounded px-1 py-0.5 truncate',
                          t.priority === 'high' ? 'bg-red-50 text-red-600' :
                          t.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_DOT[t.priority])} />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                      {pending.length > 2 && <div className="text-xs text-gray-400 px-1">+{pending.length - 2} 个</div>}
                      {completed.length > 0 && pending.length === 0 && <div className="text-xs text-emerald-500 px-1">✓ {completed.length} 完成</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected day tasks */}
      {selectedTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            {format(selectedDate, 'M月d日', { locale: zhCN })} 的任务
          </h3>
          <div className="space-y-2">
            {selectedTasks.map(t => (
              <div
                key={t.id}
                onClick={() => onTaskClick?.(t)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={cn('w-2.5 h-2.5 rounded-full', PRIORITY_DOT[t.priority])} />
                <span className={cn('text-sm font-medium flex-1', t.status === 'completed' && 'line-through text-gray-400')}>
                  {t.title}
                </span>
                {t.status === 'completed' && <span className="text-xs text-emerald-500">已完成</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
