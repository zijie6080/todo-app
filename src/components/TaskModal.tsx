import React, { useState, useEffect } from 'react';
import { X, Flag, Calendar, Tag } from 'lucide-react';
import { cn, PRIORITY_CONFIG, CATEGORY_COLORS } from '../lib/utils';
import type { Task, Category } from '../api/types';

interface TaskModalProps {
  task?: Task | null;
  categories: Category[];
  onSave: (data: Partial<Task>) => void;
  onClose: () => void;
}

export default function TaskModal({ task, categories, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [categoryId, setCategoryId] = useState(task?.category_id || '');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
      category_id: categoryId || undefined,
      status: task?.status || 'pending',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? '编辑任务' : '新建任务'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Title */}
          <div>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="任务标题..."
              className="w-full text-gray-900 font-medium placeholder-gray-300 border-0 border-b-2 border-gray-100 focus:border-primary-400 outline-none pb-2 bg-transparent text-base transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="添加描述（可选）..."
              rows={2}
              className="w-full text-sm text-gray-600 placeholder-gray-300 border border-gray-100 rounded-xl p-3 focus:border-primary-300 focus:ring-2 focus:ring-primary-50 outline-none resize-none bg-gray-50/50 transition-all"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
              <Flag className="w-3.5 h-3.5" /> 优先级
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 text-xs py-2 px-3 rounded-xl border font-medium transition-all',
                    priority === p ? PRIORITY_CONFIG[p].color + ' shadow-sm' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  )}
                >
                  {PRIORITY_CONFIG[p].label.replace('优先级', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
              <Calendar className="w-3.5 h-3.5" /> 截止日期
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full text-sm border border-gray-100 rounded-xl p-3 focus:border-primary-300 focus:ring-2 focus:ring-primary-50 outline-none bg-gray-50/50 text-gray-700 transition-all"
            />
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <Tag className="w-3.5 h-3.5" /> 分类
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryId('')}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                    !categoryId ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  无
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                      categoryId === cat.id ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                    style={categoryId === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {task ? '保存更改' : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
