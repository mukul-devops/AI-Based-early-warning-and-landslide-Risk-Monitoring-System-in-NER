import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Mountain, Wifi, WifiOff, Globe, ChevronDown, Check, User, Shield, LogOut, LogIn } from 'lucide-react';
import type { Language } from '@/types';

const languageOptions: { value: Language; label: string; nativeLabel: string }[] = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া' },
  { value: 'kha', label: 'Khasi', nativeLabel: 'Khasi' },
];

export default function TopNav() {
  const { t, language, setLanguage, online, toggleNetwork, user, logout, setAuthModalOpen } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languageOptions.find((l) => l.value === language);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-4 md:px-6 z-[1000] relative shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Mountain className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-bold text-slate-100 tracking-tight leading-none">
            {t('appTitle')}
          </h1>
          <span className="text-[10px] md:text-xs text-slate-500 mt-0.5">SIH Prototype · NER India</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleNetwork}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
              online
                ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
            }`}
          >
            {online ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-400 hidden sm:inline">{t('online')}</span>
                <Wifi className="w-3.5 h-3.5 text-emerald-400 sm:hidden" />
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-orange-400 hidden sm:inline">{t('offline')}</span>
              </>
            )}
          </button>
          {!online && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-[10px] font-semibold text-orange-400 animate-pulse">
              {t('syncPending')}
            </span>
          )}
        </div>

        {/* Language Toggle */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">{currentLang?.nativeLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl py-1.5 z-[2000] animate-fade-in">
              {languageOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setLanguage(opt.value);
                    setLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    language === opt.value ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{opt.nativeLabel}</span>
                    <span className="text-[10px] text-slate-500">{opt.label}</span>
                  </div>
                  {language === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User / Auth */}
        {user ? (
          <div ref={userRef} className="relative">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                user.role === 'citizen'
                  ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20'
              }`}
            >
              {user.role === 'citizen' ? (
                <User className="w-4 h-4 text-emerald-400" />
              ) : (
                <Shield className="w-4 h-4 text-sky-400" />
              )}
              <span className="text-xs font-medium hidden sm:inline text-slate-300">{user.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl py-1.5 z-[2000] animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-700/40">
                  <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {user.role === 'citizen' ? t('citizenPortal') : t('officerPortal')}
                  </p>
                  {user.district && <p className="text-[10px] text-slate-600 mt-0.5">{user.district}</p>}
                </div>
                <button
                  onClick={() => { logout(); setUserOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">{t('login')}</span>
          </button>
        )}
      </div>
    </header>
  );
}
