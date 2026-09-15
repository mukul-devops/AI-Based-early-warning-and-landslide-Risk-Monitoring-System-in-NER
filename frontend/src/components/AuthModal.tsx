import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, User, Shield, Phone, BadgeCheck, Loader2, ChevronRight } from 'lucide-react';
import type { UserRole } from '@/types';

export default function AuthModal() {
  const { t, authModalOpen, setAuthModalOpen, login, showToast } = useApp();
  const [role, setRole] = useState<UserRole>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authModalOpen) {
      setRole(null);
      setPhone('');
      setOtp('');
      setOfficerId('');
      setOtpSent(false);
      setLoading(false);
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const handleLogin = (r: UserRole, name: string, district?: string) => {
    setLoading(true);
    setTimeout(() => {
      login(r, name, district);
      setLoading(false);
      showToast(`Welcome, ${name}`, 'success');
    }, 600);
  };

  const handleCitizenLogin = () => {
    if (!phone.trim()) return;
    if (!otpSent) {
      setOtpSent(true);
      showToast('OTP sent to your phone', 'info');
      return;
    }
    handleLogin('citizen', `Citizen ${phone.slice(-4)}`, 'East Khasi Hills');
  };

  const handleOfficerLogin = () => {
    if (!officerId.trim()) return;
    handleLogin('officer', `Officer ${officerId}`, 'NDRF Command');
  };

  const demoLogin = (r: UserRole) => {
    handleLogin(r, r === 'citizen' ? 'Demo Citizen' : 'Demo Officer', r === 'citizen' ? 'East Khasi Hills' : 'NDRF Command');
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setAuthModalOpen(false)} />
      <div className="relative glass-panel rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-700/50">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">{t('login')}</h2>
          <p className="text-xs text-slate-500 mt-1">Select your portal to continue</p>
        </div>

        {!role && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setRole('citizen')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
              >
                <User className="w-7 h-7 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">{t('citizenPortal')}</span>
                <span className="text-[10px] text-slate-500 text-center">Report hazards, view alerts, find shelters</span>
              </button>
              <button
                onClick={() => setRole('officer')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all"
              >
                <Shield className="w-7 h-7 text-sky-400" />
                <span className="text-sm font-semibold text-slate-200">{t('officerPortal')}</span>
                <span className="text-[10px] text-slate-500 text-center">Dispatch matrix, broadcast override</span>
              </button>
            </div>

            <div className="border-t border-slate-700/40 pt-4">
              <p className="text-[10px] text-slate-500 text-center mb-3 uppercase tracking-wider">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => demoLogin('citizen')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  {t('demoAsCitizen')}
                </button>
                <button
                  onClick={() => demoLogin('officer')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs font-medium text-sky-400 hover:bg-sky-500/20 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  {t('demoAsOfficer')}
                </button>
              </div>
            </div>
          </>
        )}

        {role === 'citizen' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-2">
              <User className="w-4 h-4" />
              {t('citizenPortal')} — {t('phoneOtp')}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t('phoneNumber')}</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button
                  onClick={() => setRole(null)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
            {otpSent && (
              <div className="animate-fade-in">
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t('enterOtp')}</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors tracking-widest text-center"
                />
              </div>
            )}
            <button
              onClick={handleCitizenLogin}
              disabled={loading || !phone.trim()}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              {otpSent ? t('login') : 'Send OTP'}
            </button>
          </div>
        )}

        {role === 'officer' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-400 mb-2">
              <Shield className="w-4 h-4" />
              {t('officerPortal')} — {t('officerId')}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t('officerIdLabel')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="NDRF-XXXX-2024"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors"
                />
                <button
                  onClick={() => setRole(null)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
            <button
              onClick={handleOfficerLogin}
              disabled={loading || !officerId.trim()}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold hover:from-sky-400 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
              {t('login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
