import React, { useState } from 'react';
import { CheckSquare, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!fullName.trim()) { setError('请输入姓名'); setLoading(false); return; }
        await register(email, password, fullName);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 bg-primary-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Decorative circles */}
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">Todo</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            专注于重要的事，<br />把其他的交给我
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            简洁、美观的任务管理工具。<br />
            支持分类、优先级、子任务和截止日期。
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3">
            {['任务分类与标签', '高中低优先级管理', '子任务拆分', '截止日期追踪'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-primary-100">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Todo</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {mode === 'login' ? '登录以继续管理你的任务' : '注册开始使用 Todo'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">姓名</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="你的名字"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">密码</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors shadow-sm shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'login' ? '登录' : '注册'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
              >
                {mode === 'login' ? '还没有账号？' : '已有账号？'}
                <span className="font-medium text-primary-500 ml-1">
                  {mode === 'login' ? '立即注册' : '立即登录'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
