import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Calendar, Trash2, Plus, Tag } from 'lucide-react';
import { cn, formatDueDate, PRIORITY_CONFIG } from '../lib/utils';
import type { Task, Category, Subtask } from '../api/types';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  subtasks: Subtask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (id: string) => void;
  onDeleteSubtask: (id: string) => void;
}

export default function TaskCard({
  task, categories, subtasks,
  onToggle, onDelete, onEdit,
  onAddSubtask, onToggleSubtask, onDeleteSubtask,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  const category = categories.find(c => c.id === task.category_id);
  const due = formatDueDate(task.due_date);
  const priority = PRIORITY_CONFIG[task.priority];
  const completedSubs = subtasks.filter(s => s.status === 'completed').length;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
    setAddingSubtask(false);
  };

  return (
    <div className={cn(
      'group bg-white rounded-2xl border transition-all duration-200',
      'hover:shadow-md hover:border-primary-200',
      task.status === 'completed' ? 'border-gray-100 opacity-70' : 'border-gray-100 shadow-sm'
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
          >
            {task.status === 'completed'
              ? <CheckCircle2 className="w-5 h-5 text-primary-500" />
              : <Circle className="w-5 h-5 text-gray-300 group-hover:text-primary-300" />
            }
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onEdit(task)}
                className={cn(
                  'text-left font-medium text-sm leading-snug',
                  task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800 hover:text-primary-600'
                )}
              >
                {task.title}
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-300 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {task.description && (
              <p className="mt-1 text-xs text-gray-400 line-clamp-1">{task.description}</p>
            )}

            {/* Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium', priority.color)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
                {priority.label}
              </span>

              {due.label && (
                <span className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                  due.overdue ? 'bg-red-50 text-red-600' : due.urgent ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                )}>
                  <Calendar className="w-3 h-3" />
                  {due.label}
                </span>
              )}

              {category && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.name}
                </span>
              )}

              {subtasks.length > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {completedSubs}/{subtasks.length} 子任务
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtasks */}
        {(expanded || subtasks.length === 0) && (
          <div className="mt-3 ml-8">
            {expanded && subtasks.map(sub => (
              <div key={sub.id} className="flex items-center gap-2 py-1 group/sub">
                <button onClick={() => onToggleSubtask(sub.id)} className="flex-shrink-0">
                  {sub.status === 'completed'
                    ? <CheckCircle2 className="w-4 h-4 text-primary-400" />
                    : <Circle className="w-4 h-4 text-gray-300" />
                  }
                </button>
                <span className={cn('text-xs flex-1', sub.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-600')}>
                  {sub.title}
                </span>
                <button
                  onClick={() => onDeleteSubtask(sub.id)}
                  className="opacity-0 group-hover/sub:opacity-100 text-gray-300 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add subtask */}
            {addingSubtask ? (
              <form onSubmit={handleAddSubtask} className="mt-1 flex gap-2">
                <input
                  autoFocus
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  placeholder="输入子任务..."
                  className="flex-1 text-xs border-b border-gray-200 focus:border-primary-400 outline-none py-1 bg-transparent text-gray-700"
                  onKeyDown={e => e.key === 'Escape' && setAddingSubtask(false)}
                />
                <button type="submit" className="text-xs text-primary-500 hover:text-primary-700 font-medium">添加</button>
                <button type="button" onClick={() => setAddingSubtask(false)} className="text-xs text-gray-400">取消</button>
              </form>
            ) : (
              <button
                onClick={() => { setAddingSubtask(true); setExpanded(true); }}
                className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Plus className="w-3 h-3" /> 添加子任务
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="px-4 pb-3 ml-8">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedSubs / subtasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
