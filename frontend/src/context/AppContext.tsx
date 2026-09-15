import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Language, ViewKey, RiskZone, FieldReport, Alert, AppUser, UserRole } from '@/types';
import { mockRiskZones, mockFieldReports, mockAlerts } from '@/data/mockData';
import { translations } from '@/data/translations';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  online: boolean;
  toggleNetwork: () => void;
  currentView: ViewKey;
  setCurrentView: (view: ViewKey) => void;
  riskZones: RiskZone[];
  setRiskZones: (zones: RiskZone[]) => void;
  updateRoadStatus: (zoneId: string, status: string) => void;
  reports: FieldReport[];
  addReport: (report: FieldReport) => void;
  approveReport: (id: string) => void;
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  dismissToast: (id: string) => void;
  user: AppUser | null;
  login: (role: UserRole, name: string, district?: string) => void;
  logout: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [online, setOnline] = useState(true);
  const [currentView, setCurrentView] = useState<ViewKey>('map');
  const [riskZones, setRiskZones] = useState<RiskZone[]>(mockRiskZones);
  const [reports, setReports] = useState<FieldReport[]>(mockFieldReports);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const t = useCallback((key: string) => translations[language][key] ?? key, [language]);

  const toggleNetwork = useCallback(() => setOnline((prev) => !prev), []);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addReport = useCallback((report: FieldReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const approveReport = useCallback((id: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)));
  }, []);

  const updateRoadStatus = useCallback((zoneId: string, status: string) => {
    setRiskZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, roadStatus: status } : z)));
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => [alert, ...prev]);
  }, []);

  const login = useCallback((role: UserRole, name: string, district?: string) => {
    setUser({ role, name, id: Math.random().toString(36).slice(2), district });
    setAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        online,
        toggleNetwork,
        currentView,
        setCurrentView,
        riskZones,
        setRiskZones,
        updateRoadStatus,
        reports,
        addReport,
        approveReport,
        alerts,
        addAlert,
        toasts,
        showToast,
        dismissToast,
        user,
        login,
        logout,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
