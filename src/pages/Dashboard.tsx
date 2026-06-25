import React, { useState, useMemo } from 'react';
import CalendarView from '../components/CalendarView';
import DayPanel from '../components/DayPanel';
import MemoPanel from '../components/MemoPanel';
import { useData } from '../hooks/useData';
import { LogOut, User, CalendarDays, StickyNote } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '../lib/utils';

type Tab = 'calendar' | 'memo';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const data = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tab, setTab] = useState<Tab>('calendar');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const tasksForDay = useMemo(() =>
    data.tasks.filter(t => t.due_date === format(selectedDate, 'yyyy-MM-dd')),
    [data.tasks, selectedDate]
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Todo</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('calendar')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" /> 日历
          </button>
          <button
            onClick={() => setTab('memo')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === 'memo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <StickyNote className="w-3.5 h-3.5" /> 备忘录
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <span className="text-sm text-gray-600 hidden sm:inline">{user?.full_name || user?.email}</span>
          <button onClick={logout} className="text-gray-300 hover:text-red-400 transition-colors ml-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Body */}
      {tab === 'calendar' ? (
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-57px)]">
          {/* Calendar side */}
          <div className="flex-1 overflow-y-auto p-6">
            <CalendarView
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              tasks={data.tasks}
              onSelectDate={setSelectedDate}
              onMonthChange={setCurrentMonth}
            />
          </div>

          {/* Day panel */}
          <div className="w-80 xl:w-96 border-l border-gray-100 bg-white overflow-y-auto flex-shrink-0">
            <DayPanel
              date={selectedDate}
              tasks={tasksForDay}
              categories={data.categories}
              subtasks={data.subtasks}
              onCreateTask={data.createTask}
              onUpdateTask={data.updateTask}
              onDeleteTask={data.deleteTask}
              onToggleTask={data.toggleTask}
              onCreateSubtask={data.createSubtask}
              onToggleSubtask={data.toggleSubtask}
              onDeleteSubtask={data.deleteSubtask}
              getSubtasksForTask={data.getSubtasksForTask}
              onCreateCategory={data.createCategory}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <MemoPanel userId={user?.id || ''} />
        </div>
      )}
    </div>
  );
}
