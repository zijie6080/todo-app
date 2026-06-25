import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, StickyNote, Search } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { callApi } from '../api/client';

interface Memo {
  id: string;
  title: string;
  content: string;
  color: string;
  created_date: string;
  updated_date: string;
  user_id: string;
}

const MEMO_COLORS = [
  { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400' },
  { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-400' },
  { bg: 'bg-pink-50', border: 'border-pink-200', dot: 'bg-pink-400' },
  { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-400' },
  { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-400' },
];

export default function MemoPanel({ userId }: { userId: string }) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selected, setSelected] = useState<Memo | null>(null);
  const [search, setSearch] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState('0');
  const [loadingMemos, setLoadingMemos] = useState(true);

  useEffect(() => {
    callApi('memos', { action: 'getMemos', userId })
      .then(({ memos }) => {
        const sorted = (memos as Memo[]).sort(
          (a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime()
        );
        setMemos(sorted);
        if (sorted.length > 0) selectMemo(sorted[0]);
      })
      .finally(() => setLoadingMemos(false));
  }, [userId]);

  const selectMemo = (m: Memo) => {
    setSelected(m);
    setEditTitle(m.title);
    setEditContent(m.content);
    setEditColor(m.color);
  };

  // Auto-save
  useEffect(() => {
    if (!selected) return;
    const timer = setTimeout(async () => {
      try {
        const { memo } = await callApi('memos', {
          action: 'updateMemo',
          userId,
          id: selected.id,
          data: { title: editTitle, content: editContent, color: editColor },
        });
        setMemos(prev => prev.map(m => m.id === selected.id ? memo : m).sort(
          (a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime()
        ));
        setSelected(memo);
      } catch { /* ignore */ }
    }, 800);
    return () => clearTimeout(timer);
  }, [editTitle, editContent, editColor]);

  const createMemo = async () => {
    const { memo } = await callApi('memos', {
      action: 'createMemo',
      userId,
      data: { title: '新备忘录', content: '', color: '0' },
    });
    setMemos(prev => [memo, ...prev]);
    selectMemo(memo);
  };

  const deleteMemo = async (id: string) => {
    await callApi('memos', { action: 'deleteMemo', userId, id });
    const updated = memos.filter(m => m.id !== id);
    setMemos(updated);
    if (selected?.id === id) {
      if (updated.length > 0) selectMemo(updated[0]);
      else { setSelected(null); setEditTitle(''); setEditContent(''); }
    }
  };

  const filtered = memos.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  const colorConfig = MEMO_COLORS[parseInt(editColor)] || MEMO_COLORS[0];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">备忘录</h1>
        <p className="text-sm text-gray-400 mt-0.5">{memos.length} 条备忘 · 云端同步</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Sidebar list */}
        <div className="w-64 xl:w-72 flex-shrink-0 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索备忘..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-primary-300 outline-none text-gray-700"
              />
            </div>
            <button
              onClick={createMemo}
              className="w-9 h-9 flex items-center justify-center bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex-shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {loadingMemos ? (
              <div className="flex items-center justify-center h-20 text-gray-400 text-sm">加载中...</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <StickyNote className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">{search ? '没有匹配的备忘' : '还没有备忘录'}</p>
                {!search && (
                  <button onClick={createMemo} className="mt-2 text-xs text-primary-500 hover:text-primary-700">点击创建</button>
                )}
              </div>
            ) : filtered.map(m => {
              const cfg = MEMO_COLORS[parseInt(m.color)] || MEMO_COLORS[0];
              return (
                <div
                  key={m.id}
                  onClick={() => selectMemo(m)}
                  className={cn(
                    'group relative p-3 rounded-xl border cursor-pointer transition-all',
                    cfg.bg, cfg.border,
                    selected?.id === m.id ? 'ring-2 ring-primary-300 ring-offset-1' : 'hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.title || '无标题'}</p>
                    <button
                      onClick={e => { e.stopPropagation(); deleteMemo(m.id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 flex-shrink-0 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{m.content || '暂无内容'}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {format(new Date(m.updated_date), 'M月d日 HH:mm', { locale: zhCN })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className={cn('px-6 py-4 border-b border-gray-100 flex items-center gap-3', colorConfig.bg)}>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="备忘录标题..."
                  className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-0 outline-none placeholder-gray-300"
                />
                <div className="flex gap-1.5">
                  {MEMO_COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setEditColor(String(i))}
                      className={cn('w-5 h-5 rounded-full transition-transform', c.dot, editColor === String(i) ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : '')}
                    />
                  ))}
                </div>
              </div>
              <div className="px-6 py-1.5 text-xs text-gray-400 border-b border-gray-50">
                最后编辑 · {format(new Date(selected.updated_date), 'yyyy年M月d日 HH:mm', { locale: zhCN })} · 自动保存到云端
              </div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="开始写点什么..."
                className="flex-1 px-6 py-4 text-sm text-gray-700 bg-transparent border-0 outline-none resize-none leading-relaxed placeholder-gray-300"
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <StickyNote className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-400 font-medium">选择一条备忘开始编辑</p>
              <p className="text-gray-300 text-sm mt-1">或者点击「+」创建新备忘</p>
              <button
                onClick={createMemo}
                className="mt-4 flex items-center gap-1.5 text-sm bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> 新建备忘
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
