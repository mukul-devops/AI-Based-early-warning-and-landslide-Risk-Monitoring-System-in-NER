import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import LiveMap from '@/components/LiveMap';
import RightPanel from '@/components/RightPanel';
import FieldReports from '@/components/FieldReports';
import AlertDispatch from '@/components/AlertDispatch';
import AIAnalytics from '@/components/AIAnalytics';
import ToastContainer from '@/components/ToastContainer';
import type { SimResult } from '@/types';

function MainContent() {
  const { currentView } = useApp();
  const [simResult, setSimResult] = useState<SimResult | null>(null);

  if (currentView === 'map') {
    return (
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-h-[400px] lg:min-h-0 relative">
          <LiveMap simResult={simResult} />
        </div>
        <RightPanel onSimulate={setSimResult} />
      </div>
    );
  }

  if (currentView === 'analytics') return <AIAnalytics />;
  if (currentView === 'reports') return <FieldReports />;
  if (currentView === 'dispatch') return <AlertDispatch />;
  return null;
}

function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      <TopNav />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <MainContent />
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
