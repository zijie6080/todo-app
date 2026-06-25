import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Plus, CheckCircle2, Circle, Trash2, ChevronDown, ChevronRight,
  Flag, Tag, X
} from 'lucide-react';
import { cn, PRIORITY_CONFIG, CATEGORY_COLORS } from '../lib/utils';
import type { Task, Category, Subtask } from '../api/types';

interface Props {
  date: Date;
  tasks: Task[];
  categories: Category[];
  subtasks: Subtask[];
  onCreateTask: (data: Omit<Task, 'id' | 'user_id' | 'created_date' | 'updated_date'>) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onCreateSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (id: string) => void;
  onDeleteSubtask: (id: string) => void;
  getSubtasksForTask: (taskId: string) => Subtask[];
  onCreateCategory: (name: string, color: string) => void;
}

type AddStep = 'idle' | 'title' | 'detail';

export default function DayPanel({
  date, tasks, categories,
  onCreateTask, onDeleteTask, onToggleTask,
  onCreateSubtask, onToggleSubtask, onDeleteSubtask,
  getSubtasksForTask, onCreateCategory,
}: Props) {
  const [step, setStep] = useState<AddStep>('idle');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [categoryId, setCategoryId] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(CATEGORY_COLORS[0]);

  const dateStr = format(date, 'yyyy-MM-dd');
  const pending = tasks.filter(t => t.status === 'pending');
  const done = tasks.filter(t => t.status === 'completed');

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreateTask({
      title: title.trim(),
      status: 'pending',
      priority,
      due_date: dateStr,
      category_id: categoryId || undefined,
    });
    setTitle('');
    setPriority('medium');
    setCategoryId('');
    setStep('idle');
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtask.trim()) return;
    onCreateSubtask(taskId, newSubtask.trim());
    setNewSubtask('');
    setAddingSubtaskFor(null);
  };

  const handleAddCategory = () => {
    if (!catName.trim()) return;
    onCreateCategory(catName.trim(), catColor);
    setCatName('');
    setCatColor(CATEGORY_COLORS[0]);
    setShowCatForm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'text-2xl font-bold',
            isToday(date) ? 'text-primary-600' : 'text-gray-900'
          )}>
            {format(date, 'd日', { locale: zhCN })}
          </span>
          <span className="text-sm text-gray-400">
            {format(date, 'M月 EEEE', { locale: zhCN })}
          </span>
          {isToday(date) && (
            <span className="ml-1 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">今天</span>
          )}
        </div>
        <div className="mt-1 text-xs text-gray-400">
          {pending.length > 0 ? `${pending.length} 个待完成` : done.length > 0 ? '全部完成 🎉' : '暂无任务'}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {/* Pending */}
        {pending.map(task => {
          const subs = getSubtasksForTask(task.id);
          const doneSubs = subs.filter(s => s.status === 'completed').length;
          const cat = categories.find(c => c.id === task.category_id);
          const p = PRIORITY_CONFIG[task.priority];
          const exp = expandedId === task.id;

          return (
            <div key={task.id} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden group">
              <div className="flex items-start gap-2.5 p-3">
                <button onClick={() => onToggleTask(task.id)} className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform">
                  <Circle className="w-4.5 h-4.5 text-gray-300 group-hover:text-primary-300" style={{ width: '18px', height: '18px' }} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-md font-medium border', p.color)}>
                      {p.label.replace('优先级', '')}
                    </span>
                    {cat && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md font-medium bg-white border border-gray-200 text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                    )}
                    {subs.length > 0 && (
                      <button
                        onClick={() => setExpandedId(exp ? null : task.id)}
                        className="text-xs px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-400 hover:text-primary-500 flex items-center gap-0.5"
                      >
                        {exp ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {doneSubs}/{subs.length}
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtasks expanded */}
              {exp && (
                <div className="px-3 pb-3 ml-7 space-y-1 animate-fade-in">
                  {subs.map(s => (
                    <div key={s.id} className="flex items-center gap-2 group/sub">
                      <button onClick={() => onToggleSubtask(s.id)} className="flex-shrink-0">
                        {s.status === 'completed'
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-primary-400" />
                          : <Circle className="w-3.5 h-3.5 text-gray-300" />
                        }
                      </button>
                      <span className={cn('text-xs flex-1', s.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-600')}>
                        {s.title}
                      </span>
                      <button onClick={() => onDeleteSubtask(s.id)} className="opacity-0 group-hover/sub:opacity-100 text-gray-200 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {addingSubtaskFor === task.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        autoFocus
                        value={newSubtask}
                        onChange={e => setNewSubtask(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddSubtask(task.id);
                          if (e.key === 'Escape') { setAddingSubtaskFor(null); setNewSubtask(''); }
                        }}
                        placeholder="子任务..."
                        className="flex-1 text-xs border-b border-gray-200 focus:border-primary-400 outline-none py-0.5 bg-transparent text-gray-700"
                      />
                      <button onClick={() => handleAddSubtask(task.id)} className="text-xs text-primary-500 hover:text-primary-700">确定</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSubtaskFor(task.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 mt-1"
                    >
                      <Plus className="w-3 h-3" /> 添加子任务
                    </button>
                  )}
                  {/* Progress */}
                  {subs.length > 0 && (
                    <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary-400 rounded-full transition-all" style={{ width: `${(doneSubs / subs.length) * 100}%` }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Completed */}
        {done.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 font-medium mb-1.5 px-1">已完成 {done.length}</p>
            {done.map(task => (
              <div key={task.id} className="flex items-center gap-2.5 p-3 rounded-xl group opacity-60 hover:opacity-80 transition-opacity">
                <button onClick={() => onToggleTask(task.id)}>
                  <CheckCircle2 className="w-4.5 h-4.5 text-primary-400" style={{ width: '18px', height: '18px' }} />
                </button>
                <span className="text-sm text-gray-500 line-through flex-1">{task.title}</span>
                <button onClick={() => onDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add task area */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        {step === 'idle' && (
          <button
            onClick={() => setStep('title')}
            className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-primary-500 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> 添加任务
          </button>
        )}

        {step === 'title' && (
          <div className="animate-fade-in">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && title.trim()) setStep('detail');
                if (e.key === 'Escape') { setStep('idle'); setTitle(''); }
              }}
              placeholder="输入任务名称，回车继续..."
              className="w-full text-sm text-gray-800 border-b border-primary-300 outline-none pb-1.5 bg-transparent"
            />
            <div className="flex gap-2 mt-2">
              <button
                disabled={!title.trim()}
                onClick={() => setStep('detail')}
                className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-primary-600 transition-colors"
              >
                继续设置
              </button>
              <button
                disabled={!title.trim()}
                onClick={handleCreate}
                className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                快速添加
              </button>
              <button onClick={() => { setStep('idle'); setTitle(''); }} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">取消</button>
            </div>
          </div>
        )}

        {step === 'detail' && (
          <div className="animate-fade-in space-y-3">
            <p className="text-sm font-medium text-gray-800 truncate">{title}</p>

            {/* Priority */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><Flag className="w-3 h-3" /> 优先级</p>
              <div className="flex gap-1.5">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 text-xs py-1.5 rounded-lg border font-medium transition-all',
                      priority === p ? PRIORITY_CONFIG[p].color : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    )}
                  >
                    {PRIORITY_CONFIG[p].label.replace('优先级', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Tag className="w-3 h-3" /> 分类</p>
                <button onClick={() => setShowCatForm(!showCatForm)} className="text-xs text-primary-400 hover:text-primary-600">+ 新分类</button>
              </div>
              {showCatForm && (
                <div className="mb-2 p-2.5 bg-gray-50 rounded-lg space-y-2 animate-fade-in">
                  <input
                    autoFocus
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    placeholder="分类名称..."
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-300 bg-white"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORY_COLORS.map(c => (
                      <button key={c} onClick={() => setCatColor(c)}
                        className={cn('w-5 h-5 rounded-full transition-transform', catColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : '')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={handleAddCategory} className="flex-1 text-xs bg-primary-500 text-white py-1.5 rounded-lg hover:bg-primary-600">创建</button>
                    <button onClick={() => setShowCatForm(false)} className="flex-1 text-xs border border-gray-200 text-gray-400 py-1.5 rounded-lg">取消</button>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategoryId('')}
                  className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', !categoryId ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-500')}
                >无</button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={cn('text-xs px-2.5 py-1 rounded-full border font-medium transition-all flex items-center gap-1',
                      categoryId === cat.id ? 'text-white border-transparent' : 'border-gray-200 text-gray-500'
                    )}
                    style={categoryId === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} className="flex-1 text-xs bg-primary-500 text-white py-2 rounded-xl hover:bg-primary-600 font-medium transition-colors">
                添加任务
              </button>
              <button onClick={() => { setStep('idle'); setTitle(''); setPriority('medium'); setCategoryId(''); }} className="text-xs border border-gray-200 text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-50">
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
