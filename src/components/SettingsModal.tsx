import React, { useState } from 'react';
import { X, User, Lock, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const showMsg = (msg: string, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({ newFullName: fullName });
      showMsg('昵称已更新');
    } catch (e: any) {
      showMsg(e.message || '更新失败', true);
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return showMsg('请填写所有字段', true);
    if (newPassword.length < 6) return showMsg('新密码至少6位', true);
    if (newPassword !== confirmPassword) return showMsg('两次密码不一致', true);
    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      showMsg('密码已更新，下次登录时生效');
    } catch (e: any) {
      showMsg(e.message || '修改失败', true);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">账号设置</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-5">
          {[
            { id: 'profile', icon: <User className="w-4 h-4" />, label: '个人信息' },
            { id: 'password', icon: <Lock className="w-4 h-4" />, label: '修改密码' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                tab === t.id ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {tab === 'profile' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">邮箱</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">昵称</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none transition-all"
                />
              </div>
            </>
          )}

          {tab === 'password' && (
            <>
              {['当前密码', '新密码', '确认新密码'].map((label, i) => {
                const vals = [oldPassword, newPassword, confirmPassword];
                const setters = [setOldPassword, setNewPassword, setConfirmPassword];
                return (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
                    <input
                      type="password"
                      value={vals[i]}
                      onChange={e => setters[i](e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none transition-all"
                    />
                  </div>
                );
              })}
            </>
          )}

          {(success || error) && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm animate-fade-in',
              success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
            )}>
              {success ? <CheckCircle className="w-4 h-4" /> : null}
              {success || error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button
            onClick={tab === 'profile' ? handleSaveProfile : handleChangePassword}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
