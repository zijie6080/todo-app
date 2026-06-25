import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, Clock, Tag, Plus, Trash2, LogOut, User } from 'lucide-react';
import { cn, CATEGORY_COLORS } from '../lib/utils';
import type { Category, Task } from '../api/types';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  categories: Category[];
  tasks: Task[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onCreateCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function Sidebar({
  categories, tasks, activeFilter, onFilterChange, onCreateCategory, onDeleteCategory
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [addingCat, setAddingCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(CATEGORY_COLORS[0]);

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const todayCount = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return t.due_date.startsWith(new Date().toISOString().split('T')[0]);
  }).length;

  const navItems = [
    { id: 'all', label: '全部任务', icon: LayoutDashboard, count: pendingCount },
    { id: 'today', label: '今天', icon: Clock, count: todayCount },
    { id: 'completed', label: '已完成', icon: CheckSquare, count: completedCount },
  ];

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onCreateCategory(catName.trim(), catColor);
    setCatName('');
    setCatColor(CATEGORY_COLORS[0]);
    setAddingCat(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
            <CheckSquare className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
          </div>
          <span className="font-bold text-gray-900 text-lg">Todo</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeFilter === item.id
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-2.5">
              <item.icon className={cn('w-4 h-4', activeFilter === item.id ? 'text-primary-500' : 'text-gray-400')} />
              {item.label}
            </div>
            {item.count > 0 && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-semibold',
                activeFilter === item.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
              )}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Categories */}
      <div className="px-3 mt-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">分类</span>
          <button
            onClick={() => setAddingCat(true)}
            className="text-gray-400 hover:text-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-0.5">
          {categories.map(cat => {
            const count = tasks.filter(t => t.category_id === cat.id && t.status === 'pending').length;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange(`cat:${cat.id}`)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group/cat',
                  activeFilter === `cat:${cat.id}` ? 'bg-gray-50' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-700 truncate max-w-[100px]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {count > 0 && <span className="text-xs text-gray-400">{count}</span>}
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteCategory(cat.id); }}
                    className="opacity-0 group-hover/cat:opacity-100 text-gray-300 hover:text-red-400 transition-all ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add category form */}
        {addingCat && (
          <form onSubmit={handleAddCat} className="mt-2 p-3 bg-gray-50 rounded-xl space-y-2 animate-fade-in">
            <input
              autoFocus
              value={catName}
              onChange={e => setCatName(e.target.value)}
              placeholder="分类名称..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-primary-300 outline-none bg-white"
            />
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORY_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatColor(c)}
                  className={cn('w-5 h-5 rounded-full transition-transform', catColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : '')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 text-xs bg-primary-500 text-white py-1.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">添加</button>
              <button type="button" onClick={() => setAddingCat(false)} className="flex-1 text-xs border border-gray-200 text-gray-500 py-1.5 rounded-lg hover:bg-white transition-colors">取消</button>
            </div>
          </form>
        )}
      </div>

      {/* User */}
      <div className="px-3 pb-4 mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0" title="退出登录">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
