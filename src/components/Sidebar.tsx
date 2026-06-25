import React, { useState } from 'react';
import {
  CheckSquare, Calendar, StickyNote, Tag, Plus, Trash2,
  Sun, Moon, User, LogOut, Settings, ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import type { Category, Task } from '../api/types';

interface SidebarProps {
  view: string;
  setView: (v: string) => void;
  categories: Category[];
  tasks: Task[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  onCreateCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  darkMode: boolean;
  toggleDark: () => void;
  onOpenSettings: () => void;
}

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

export default function Sidebar({
  view, setView, categories, tasks,
  selectedCategory, setSelectedCategory,
  onCreateCategory, onDeleteCategory,
  darkMode, toggleDark, onOpenSettings,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(CATEGORY_COLORS[0]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pending = tasks.filter(t => t.status === 'pending').length;
  const today = tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0] && t.status === 'pending').length;

  const handleAddCat = () => {
    if (!catName.trim()) return;
    onCreateCategory(catName.trim(), catColor);
    setCatName('');
    setShowAddCat(false);
  };

  const navItem = (id: string, icon: React.ReactNode, label: string, count?: number) => (
    <button
      onClick={() => { setView(id); setSelectedCategory(null); }}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150',
        view === id && !selectedCategory
          ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={cn(
          'text-xs font-bold px-2 py-0.5 rounded-full',
          view === id && !selectedCategory ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
        )}>{count}</span>
      )}
    </button>
  );

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-screen bg-white border-r border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-200">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Todo</span>
            <p className="text-xs text-gray-400 mt-0.5">个人任务管理</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">主菜单</p>
        {navItem('dashboard', <CheckSquare className="w-5 h-5" />, '所有任务', pending)}
        {navItem('today', <Sun className="w-5 h-5" />, '今天', today)}
        {navItem('calendar', <Calendar className="w-5 h-5" />, '日历')}
        {navItem('memo', <StickyNote className="w-5 h-5" />, '备忘录')}

        {/* Categories */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">分类</p>
            <button
              onClick={() => setShowAddCat(!showAddCat)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAddCat && (
            <div className="mx-2 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-slide-up">
              <input
                value={catName}
                onChange={e => setCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCat()}
                placeholder="分类名称..."
                autoFocus
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none"
              />
              <div className="flex gap-1.5 mb-2">
                {CATEGORY_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCatColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn('w-5 h-5 rounded-full transition-transform', catColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : '')}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddCat} className="flex-1 text-xs bg-primary-500 text-white py-1.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">添加</button>
                <button onClick={() => setShowAddCat(false)} className="flex-1 text-xs bg-gray-200 text-gray-600 py-1.5 rounded-lg font-medium hover:bg-gray-300 transition-colors">取消</button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {categories.map(cat => {
              const count = tasks.filter(t => t.category_id === cat.id && t.status === 'pending').length;
              return (
                <div
                  key={cat.id}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
                    selectedCategory === cat.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                  onClick={() => { setSelectedCategory(cat.id); setView('dashboard'); }}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm font-medium truncate">{cat.name}</span>
                  {count > 0 && <span className="text-xs text-gray-400">{count}</span>}
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteCategory(cat.id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom: Dark mode + User */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all text-sm font-medium"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
          {darkMode ? '切换浅色模式' : '切换深色模式'}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || '用户'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showUserMenu && 'rotate-180')} />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up z-50">
              <button
                onClick={() => { onOpenSettings(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" /> 账号设置
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> 退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
