import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'warning' ? AlertTriangle : Info;
        const colorClass =
          toast.type === 'success'
            ? 'text-emerald-400 border-emerald-500/30'
            : toast.type === 'warning'
              ? 'text-orange-400 border-orange-500/30'
              : 'text-sky-400 border-sky-500/30';
        return (
          <div
            key={toast.id}
            className={`glass-panel border ${colorClass} px-4 py-3 rounded-xl flex items-start gap-3 shadow-2xl animate-slide-in-right`}
          >
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
