import React, { useState, useEffect } from 'react';
import { format, isSameDay, isToday, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle,
  Trash2, StickyNote, Settings, LogOut,
  User, Sun, Moon, ChevronDown, Loader2, X, Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import TaskModal from '../components/TaskModal';
import SettingsModal from '../components/SettingsModal';
import MemoPanel from '../components/MemoPanel';
import type { Task } from '../api/types';

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};
const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' };
const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-green-100 text-green-600',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const {
    tasks, categories, loading,
    createTask, updateTask, deleteTask, toggleTask,
    createCategory, deleteCategory,
    createSubtask, toggleSubtask, deleteSubtask,
    getSubtasksForTask,
  } = useData();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Calendar grid
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

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.due_date === selectedDateStr);
  const pendingDay = dayTasks.filter(t => t.status === 'pending');
  const completedDay = dayTasks.filter(t => t.status === 'completed');

  const overdueCount = tasks.filter(t =>
    t.status === 'pending' && t.due_date && t.due_date < format(new Date(), 'yyyy-MM-dd')
  ).length;

  const handleQuickAdd = async () => {
    if (!newTaskTitle.trim()) return;
    setQuickAdding(true);
    try {
      await createTask({ title: newTaskTitle.trim(), status: 'pending', priority: 'medium', due_date: selectedDateStr } as any);
      setNewTaskTitle('');
    } finally { setQuickAdding(false); }
  };

  const handleSaveTask = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask({ ...data, status: 'pending', due_date: selectedDateStr } as any);
    }
    setShowModal(false);
    setEditingTask(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ===== LEFT SIDEBAR ===== */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Todo</span>
              <p className="text-xs text-gray-400">日历任务管理</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-4 space-y-2">
          <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 rounded-xl">
            <span className="text-sm font-medium text-blue-700">今日任务</span>
            <span className="text-sm font-bold text-blue-600">{getTasksForDate(new Date()).filter(t => t.status === 'pending').length}</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-red-50 rounded-xl">
              <span className="text-sm font-medium text-red-600">已逾期</span>
              <span className="text-sm font-bold text-red-500">{overdueCount}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-600">全部待办</span>
            <span className="text-sm font-bold text-gray-500">{tasks.filter(t => t.status === 'pending').length}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">分类</p>
          <div className="space-y-1">
            {categories.map(cat => {
              const cnt = tasks.filter(t => t.category_id === cat.id && t.status === 'pending').length;
              return (
                <div key={cat.id} className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm font-medium truncate">{cat.name}</span>
                  {cnt > 0 && <span className="text-xs text-gray-400">{cnt}</span>}
                  <button onClick={() => deleteCategory(cat.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => {
                const name = prompt('分类名称');
                if (name) {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                  createCategory(name, colors[Math.floor(Math.random() * colors.length)]);
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> 添加分类
            </button>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setShowMemo(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            <StickyNote className="w-4 h-4" /> 备忘录
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
            {darkMode ? '浅色模式' : '深色模式'}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all"
            >
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.full_name || '用户'}</p>
              </div>
              <ChevronDown className={cn('w-3.5 h-3.5 text-gray-400 transition-transform', showUserMenu && 'rotate-180')} />
            </button>
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
                <button
                  onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 text-gray-400" /> 账号设置
                </button>
                <div className="border-t border-gray-100" />
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> 退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT (calendar always visible) ===== */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* === CALENDAR PANEL === */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-100">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">点击日期查看当天任务</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
                className="px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors"
              >今天</button>
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="flex-1 overflow-auto bg-white">
            <div className="grid grid-cols-7 border-b border-gray-100 sticky top-0 bg-white z-10">
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(d => (
                <div key={d} className="py-3 text-center text-sm font-semibold text-gray-400">{d}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7" style={{ minHeight: '100px' }}>
                {week.map((d, di) => {
                  const dayTaskList = getTasksForDate(d);
                  const pending = dayTaskList.filter(t => t.status === 'pending');
                  const completed = dayTaskList.filter(t => t.status === 'completed');
                  const isSelected = isSameDay(d, selectedDate);
                  const isCurrentMonth = isSameMonth(d, currentMonth);
                  const todayFlag = isToday(d);
                  const isWeekend = di >= 5;

                  return (
                    <button
                      key={di}
                      onClick={() => setSelectedDate(d)}
                      className={cn(
                        'relative p-2 text-left border-b border-r border-gray-50 transition-all duration-150 hover:bg-blue-50/60',
                        isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-300' : '',
                        !isCurrentMonth ? 'opacity-30' : '',
                        isWeekend && isCurrentMonth ? 'bg-gray-50/50' : '',
                      )}
                    >
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full mb-1',
                        todayFlag ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'text-gray-700',
                        isSelected && !todayFlag ? 'bg-blue-100 text-blue-700' : '',
                        isWeekend && !todayFlag && !isSelected ? 'text-gray-400' : '',
                      )}>
                        {format(d, 'd')}
                      </span>
                      <div className="space-y-0.5">
                        {pending.slice(0, 3).map(t => (
                          <div key={t.id} className={cn(
                            'flex items-center gap-1 text-xs rounded-md px-1.5 py-0.5 truncate font-medium',
                            t.priority === 'high' ? 'bg-red-50 text-red-600' :
                            t.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_DOT[t.priority])} />
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}
                        {pending.length > 3 && <div className="text-xs text-gray-400 px-1">+{pending.length - 3} 个</div>}
                        {pending.length === 0 && completed.length > 0 && (
                          <div className="text-xs text-emerald-500 px-1">✓ {completed.length}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* === DAY PANEL === */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white overflow-hidden">
          {/* Day header */}
          <div className="px-5 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isToday(selectedDate) ? '今天' : format(selectedDate, 'M月d日', { locale: zhCN })}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {format(selectedDate, 'EEEE', { locale: zhCN })} · {pendingDay.length} 待办
                  {completedDay.length > 0 ? ` · ${completedDay.length} 完成` : ''}
                </p>
              </div>
              <button
                onClick={() => { setEditingTask(null); setShowModal(true); }}
                className="w-9 h-9 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-200 flex items-center justify-center active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {/* Quick add */}
            <div className="mt-3 flex gap-2">
              <input
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
                placeholder="快速添加任务..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50"
              />
              <button
                onClick={handleQuickAdd}
                disabled={!newTaskTitle.trim() || quickAdding}
                className="w-10 h-10 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-40 flex items-center justify-center flex-shrink-0"
              >
                {quickAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : dayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">这天还没有任务</p>
                <p className="text-xs text-gray-300 mt-1">输入上方快速添加，或点 + 详细设置</p>
              </div>
            ) : (
              <div className="space-y-2 animate-fade-in">
                {pendingDay.map(task => {
                  const cat = categories.find(c => c.id === task.category_id);
                  const subs = getSubtasksForTask(task.id);
                  const completedSubs = subs.filter(s => s.status === 'completed').length;
                  return (
                    <div
                      key={task.id}
                      onClick={() => { setEditingTask(task); setShowModal(true); }}
                      className="group p-3.5 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-150"
                    >
                      <div className="flex items-start gap-3">
                        <button onClick={e => { e.stopPropagation(); toggleTask(task.id); }}
                          className="mt-0.5 flex-shrink-0 active:scale-90 transition-transform">
                          <Circle className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800 leading-snug flex-1 truncate">{task.title}</p>
                            <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', PRIORITY_COLOR[task.priority])}>
                              {PRIORITY_LABEL[task.priority]}
                            </span>
                          </div>
                          {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>}
                          <div className="flex items-center gap-2 mt-1.5">
                            {cat && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                              </span>
                            )}
                            {subs.length > 0 && <span className="text-xs text-gray-400">{completedSubs}/{subs.length} 子任务</span>}
                          </div>
                          {subs.length > 0 && (
                            <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full transition-all duration-500"
                                style={{ width: `${(completedSubs / subs.length) * 100}%` }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {completedDay.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">已完成</p>
                    <div className="space-y-1.5">
                      {completedDay.map(task => (
                        <div key={task.id}
                          onClick={() => { setEditingTask(task); setShowModal(true); }}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors opacity-60">
                          <button onClick={e => { e.stopPropagation(); toggleTask(task.id); }}
                            className="flex-shrink-0 active:scale-90 transition-transform">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                          </button>
                          <span className="text-sm text-gray-500 line-through truncate flex-1">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* === MEMO DRAWER (fixed overlay over entire page) === */}
      {showMemo && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
            onClick={() => setShowMemo(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col"
            style={{ animation: 'slideInRight 0.25s ease-out' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                <span className="text-base font-bold text-gray-900">备忘录</span>
              </div>
              <button
                onClick={() => setShowMemo(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <MemoPanel userId={user!.id} />
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showModal && (
        <TaskModal
          task={editingTask}
          categories={categories}
          subtasks={editingTask ? getSubtasksForTask(editingTask.id) : []}
          onSave={handleSaveTask}
          onDelete={editingTask ? () => { deleteTask(editingTask.id); setShowModal(false); } : undefined}
          onCreateSubtask={editingTask ? (title) => createSubtask(editingTask.id, title) : undefined}
          onToggleSubtask={toggleSubtask}
          onDeleteSubtask={deleteSubtask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
