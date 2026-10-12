import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Shield, LogIn, Tv } from 'lucide-react';
import type { UserAccount } from '../types';

interface LoginScreenProps {
  onSuccess: (user: UserAccount) => void;
  onOpenTvMode: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onOpenTvMode }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'รหัสผ่านไม่ถูกต้อง');
      }

      // Store auth session
      localStorage.setItem('jobcomm_logged_user', JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-950 to-blue-800 text-amber-300 mx-auto flex items-center justify-center shadow-lg border border-blue-400/30">
              <Shield className="w-9 h-9" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-1">
                ภารกิจผู้บังคับบัญชา
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                หน่วยบัญชาการอากาศโยธิน
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                JobCommand RTAF • เจ้าหน้าที่สำนักงาน / ผู้บังคับบัญชา
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                กรอกรหัสผ่านเพื่อเข้าใช้งานระบบ
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="กรอกรหัสผ่าน..."
                  autoFocus
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 text-center text-base font-semibold tracking-wider bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-800 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-1.5 mt-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 hover:from-blue-950 hover:to-blue-950 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span>
            </button>
          </form>

          {/* Quick TV Mode link (allowed without password) */}
          <div className="pt-2 border-t border-slate-200 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onOpenTvMode}
              className="w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Tv className="w-4 h-4 text-amber-700" />
              <span>เปิดดูโหมดจอทีวี (TV Display) โดยไม่ต้องเข้าสู่ระบบ</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              * จอทีวีแสดงผลเฉพาะรายการภารกิจประจำวันเพื่อติดตามงาน
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          พัฒนาโดย นทสส.อย. โทร.2-6366 • รองรับ คอมพิวเตอร์ / สมาร์ทโฟน / จอทีวี
        </p>
      </div>
    </div>
  );
};
