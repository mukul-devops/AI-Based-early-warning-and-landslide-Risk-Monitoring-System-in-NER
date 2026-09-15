import { useApp } from '@/context/AppContext';
import { Map, BarChart3, FileText, Siren } from 'lucide-react';
import type { ViewKey } from '@/types';

const navItems: { key: ViewKey; icon: typeof Map; labelKey: string }[] = [
  { key: 'map', icon: Map, labelKey: 'liveMap' },
  { key: 'analytics', icon: BarChart3, labelKey: 'analytics' },
  { key: 'reports', icon: FileText, labelKey: 'fieldReports' },
  { key: 'dispatch', icon: Siren, labelKey: 'alertDispatch' },
];

export default function Sidebar() {
  const { currentView, setCurrentView, t } = useApp();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-20 lg:w-56 bg-slate-900/60 backdrop-blur-xl border-r border-slate-700/50 flex-col py-6 shrink-0 z-[900]">
        <nav className="flex flex-col gap-1 px-2 lg:px-3 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-emerald-500" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'scale-110' : 'group-hover:scale-105'} transition-transform`} />
                <span className="hidden lg:inline text-sm font-medium">{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-3 mt-auto hidden lg:block">
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-400">SYSTEM ACTIVE</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">XGBoost v2.1 · ROC-AUC 0.858</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 flex items-center justify-around px-2 z-[2000]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                active ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[9px] font-medium">{t(item.labelKey).split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
