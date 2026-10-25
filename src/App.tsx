import React, { useEffect, useState } from 'react';
import { useAppStore } from './lib/store';
import { Navbar } from './components/Navigation/Navbar';
import { MeetingSetup } from './components/Meeting/MeetingSetup';
import { LiveWidget } from './components/Widget/LiveWidget';
import { MeetingSummary } from './components/Meeting/MeetingSummary';
import { PeopleManager } from './components/Settings/PeopleManager';
import { ExecutiveDashboard } from './components/Dashboard/ExecutiveDashboard';
import { GeneralSettings } from './components/Settings/GeneralSettings';
import { Clock, X, AlertCircle } from 'lucide-react';

export default function App() {
  const { currentView, initApp, toasts, dismissToast } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initApp().then(() => {
      setIsReady(true);
    });
  }, [initApp]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
          <Clock className="w-4 h-4 text-zinc-300" />
        </div>
        <div className="text-center space-y-0.5">
          <div className="text-xs font-semibold text-zinc-200">MeetMeter</div>
          <div className="text-[11px] text-zinc-500">Initializing local storage...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-zinc-700 selection:text-zinc-100 relative font-sans">
      {/* Top Navigation */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 overflow-x-hidden pb-12">
        {currentView === 'setup' && <MeetingSetup />}
        {currentView === 'live' && <LiveWidget />}
        {currentView === 'summary' && <MeetingSummary />}
        {currentView === 'people' && <PeopleManager />}
        {currentView === 'dashboard' && <ExecutiveDashboard />}
        {currentView === 'settings' && <GeneralSettings />}
      </main>

      {/* RATIONAL REMINDERS & TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
        {toasts.map((toast) => {
          const isAlert = toast.type === 'alert';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3 rounded-lg border shadow-lg backdrop-blur-md flex items-start gap-2.5 transition-all text-xs ${
                isAlert
                  ? 'bg-zinc-900/95 border-rose-800/80 text-rose-200'
                  : isWarning
                  ? 'bg-zinc-900/95 border-amber-800/80 text-amber-200'
                  : 'bg-zinc-900/95 border-zinc-800 text-zinc-200'
              }`}
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="font-semibold text-zinc-100 text-[11px] truncate">{toast.title}</div>
                <div className="text-[11px] text-zinc-400 leading-normal">{toast.message}</div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
