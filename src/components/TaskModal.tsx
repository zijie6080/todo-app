import React, { useState, useEffect } from 'react';
import { X, Flag, Calendar, Tag, Plus, Trash2, CheckCircle2, Circle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn, PRIORITY_CONFIG } from '../lib/utils';
import type { Task, Category, Subtask } from '../api/types';

interface TaskModalProps {
  task?: Task | null;
  categories: Category[];
  subtasks?: Subtask[];
  onSave: (data: Partial<Task>) => Promise<void>;
  onClose: () => void;
  onDelete?: () => void;
  onCreateSubtask?: (title: string) => Promise<void>;
  onToggleSubtask?: (id: string) => Promise<void>;
  onDeleteSubtask?: (id: string) => Promise<void>;
}

export default function TaskModal({
  task, categories, subtasks = [],
  onSave, onClose, onDelete,
  onCreateSubtask, onToggleSubtask, onDeleteSubtask,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [categoryId, setCategoryId] = useState(task?.category_id || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        category_id: categoryId || undefined,
        status: task?.status || 'pending',
      });
      onClose();
    } finally { setSaving(false); }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !onCreateSubtask) return;
    await onCreateSubtask(newSubtask.trim());
    setNewSubtask('');
  };

  const isOverdue = dueDate && dueDate < new Date().toISOString().split('T')[0] && task?.status !== 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-gray-100 z-10">
          <h2 className="text-xl font-bold text-gray-900">{task ? '编辑任务' : '新建任务'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="任务标题..."
              className="w-full text-lg font-semibold text-gray-900 placeholder-gray-300 border-0 border-b-2 border-gray-100 focus:border-primary-400 outline-none pb-2 bg-transparent transition-colors"
            />
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="添加描述（可选）..."
            rows={2}
            className="w-full text-sm text-gray-600 placeholder-gray-300 border border-gray-200 rounded-xl p-3 focus:border-primary-300 focus:ring-2 focus:ring-primary-50 outline-none resize-none bg-gray-50/50 transition-all"
          />

          {/* Priority */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
              <Flag className="w-4 h-4" /> 优先级
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p} type="button" onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 text-sm py-2.5 px-3 rounded-xl border font-medium transition-all',
                    priority === p ? PRIORITY_CONFIG[p].color + ' shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  )}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
              <Calendar className="w-4 h-4" /> 截止日期
              {isOverdue && <span className="ml-1 text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />已逾期</span>}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={cn(
                'w-full text-sm border rounded-xl p-3 focus:ring-2 focus:ring-primary-50 outline-none bg-gray-50/50 text-gray-700 transition-all',
                isOverdue ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-primary-300'
              )}
            />
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
                <Tag className="w-4 h-4" /> 分类
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setCategoryId('')}
                  className={cn('text-sm px-3 py-1.5 rounded-full border font-medium transition-all',
                    !categoryId ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}>无</button>
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                    className={cn('text-sm px-3 py-1.5 rounded-full border font-medium transition-all',
                      categoryId === cat.id ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                    style={categoryId === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks (only for existing tasks) */}
          {task && onCreateSubtask && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">子任务 {subtasks.length > 0 && `(${subtasks.filter(s => s.status === 'completed').length}/${subtasks.length})`}</label>
              <div className="space-y-1.5 mb-2">
                {subtasks.map(s => (
                  <div key={s.id} className="flex items-center gap-2 group">
                    <button type="button" onClick={() => onToggleSubtask?.(s.id)} className="flex-shrink-0">
                      {s.status === 'completed'
                        ? <CheckCircle2 className="w-5 h-5 text-primary-500" />
                        : <Circle className="w-5 h-5 text-gray-300 group-hover:text-primary-300 transition-colors" />
                      }
                    </button>
                    <span className={cn('flex-1 text-sm', s.status === 'completed' && 'line-through text-gray-400')}>{s.title}</span>
                    <button type="button" onClick={() => onDeleteSubtask?.(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  placeholder="添加子任务..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-primary-300 outline-none transition-all"
                />
                <button type="button" onClick={handleAddSubtask}
                  className="w-9 h-9 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {task && onDelete && (
              showDeleteConfirm ? (
                <div className="flex gap-2 w-full">
                  <button type="button" onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium">取消</button>
                  <button type="button" onClick={onDelete}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">确认删除</button>
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium">取消</button>
                  <button type="submit" disabled={!title.trim() || saving}
                    className="flex-1 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}保存更改
                  </button>
                </>
              )
            )}
            {!task && (
              <>
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium">取消</button>
                <button type="submit" disabled={!title.trim() || saving}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}创建任务
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
