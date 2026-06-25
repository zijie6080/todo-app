import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Calendar as CalIcon, StickyNote, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import Sidebar from '../components/Sidebar';
import CalendarView from '../components/CalendarView';
import MemoPanel from '../components/MemoPanel';
import TaskModal from '../components/TaskModal';
import SettingsModal from '../components/SettingsModal';
import type { Task } from '../api/types';

type SortOption = 'created' | 'due' | 'priority';
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function Dashboard() {
  const { user } = useAuth();
  const {
    tasks, categories, subtasks, loading,
    createTask, updateTask, deleteTask, toggleTask,
    createCategory, deleteCategory,
    createSubtask, toggleSubtask, deleteSubtask,
    getSubtasksForTask,
  } = useData();

  const [view, setView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const filtered = tasks
    .filter(t => {
      if (selectedCategory && t.category_id !== selectedCategory) return false;
      if (view === 'today' && t.due_date !== new Date().toISOString().split('T')[0]) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortBy === 'due') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
    });

  const pendingCount = filtered.filter(t => t.status === 'pending').length;
  const completedCount = filtered.filter(t => t.status === 'completed').length;

  const handleCreateOrUpdate = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask({
        title: data.title || '新任务',
        description: data.description,
        status: 'pending',
        priority: data.priority || 'medium',
        due_date: data.due_date,
        category_id: data.category_id || selectedCategory || undefined,
      } as any);
    }
    setShowModal(false);
    setEditingTask(null);
  };

  const viewTitle = view === 'today' ? '今天' : selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name || '分类'
    : '所有任务';

  if (view === 'calendar') return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        view={view} setView={setView}
        categories={categories} tasks={tasks}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        onCreateCategory={createCategory} onDeleteCategory={deleteCategory}
        darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setShowSettings(true)}
      />
      <main className="flex-1 overflow-auto p-8">
        <CalendarView tasks={tasks} onTaskClick={t => { setEditingTask(t); setShowModal(true); }} />
      </main>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );

  if (view === 'memo') return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        view={view} setView={setView}
        categories={categories} tasks={tasks}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        onCreateCategory={createCategory} onDeleteCategory={deleteCategory}
        darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setShowSettings(true)}
      />
      <main className="flex-1 overflow-auto p-8">
        <MemoPanel userId={user!.id} />
      </main>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        view={view} setView={setView}
        categories={categories} tasks={tasks}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        onCreateCategory={createCategory} onDeleteCategory={deleteCategory}
        darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{viewTitle}</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {pendingCount} 待完成 · {completedCount} 已完成
              </p>
            </div>
            {/* Big create button */}
            <button
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-3 bg-primary-500 text-white rounded-xl font-semibold text-base hover:bg-primary-600 transition-all shadow-lg shadow-primary-200 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              新建任务
            </button>
          </div>

          {/* Search + filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索任务..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none transition-all"
              />
            </div>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:border-primary-400 outline-none"
            >
              <option value="all">全部</option>
              <option value="pending">待完成</option>
              <option value="completed">已完成</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:border-primary-400 outline-none"
            >
              <option value="created">最新创建</option>
              <option value="due">截止日期</option>
              <option value="priority">优先级</option>
            </select>
          </div>
        </div>

        {/* Task list */}
        <div className="px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin-slow mb-4" />
              <p className="text-gray-400 text-sm">加载中...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-400">
                {search ? '没有找到匹配的任务' : '还没有任务'}
              </p>
              <p className="text-sm text-gray-300 mt-1">点击右上角「新建任务」开始</p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              {filtered.map(task => {
                const cat = categories.find(c => c.id === task.category_id);
                const subs = getSubtasksForTask(task.id);
                const completedSubs = subs.filter(s => s.status === 'completed').length;
                const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0] && task.status === 'pending';

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'group flex items-start gap-4 p-5 bg-white rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5',
                      task.status === 'completed' ? 'border-gray-100 opacity-60' : 'border-gray-100',
                      isOverdue && 'border-red-100 bg-red-50/30'
                    )}
                    onClick={() => { setEditingTask(task); setShowModal(true); }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleTask(task.id); }}
                      className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                    >
                      {task.status === 'completed'
                        ? <CheckCircle2 className="w-6 h-6 text-primary-500" />
                        : <Circle className="w-6 h-6 text-gray-300 group-hover:text-primary-400 transition-colors" />
                      }
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-base font-semibold text-gray-900 leading-snug',
                          task.status === 'completed' && 'line-through text-gray-400'
                        )}>
                          {task.title}
                        </p>
                        <span className={cn(
                          'flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full',
                          task.priority === 'high' ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-green-100 text-green-600'
                        )}>
                          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        {cat && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className={cn(
                            'flex items-center gap-1 text-xs',
                            isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'
                          )}>
                            <CalIcon className="w-3.5 h-3.5" />
                            {isOverdue ? '已逾期 · ' : ''}{task.due_date}
                          </span>
                        )}
                        {subs.length > 0 && (
                          <span className="text-xs text-gray-400">
                            子任务 {completedSubs}/{subs.length}
                          </span>
                        )}
                      </div>

                      {/* Subtask progress bar */}
                      {subs.length > 0 && (
                        <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-400 rounded-full transition-all duration-500"
                            style={{ width: `${(completedSubs / subs.length) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <TaskModal
          task={editingTask}
          categories={categories}
          subtasks={editingTask ? getSubtasksForTask(editingTask.id) : []}
          onSave={handleCreateOrUpdate}
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
