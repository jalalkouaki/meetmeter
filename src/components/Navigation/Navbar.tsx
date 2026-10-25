import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../lib/store';
import { CurrencyCode, PrivacyLevel } from '../../types';
import { formatCurrency } from '../../lib/currency';
import {
  Clock,
  Users,
  BarChart2,
  Sliders,
  Shield,
  Eye,
  EyeOff,
  Play,
  Maximize2,
  Minimize2,
  ChevronDown,
  Lock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeMeeting,
    hideCostNumbers,
    toggleHideCostNumbers,
    privacyLevel,
    setPrivacyLevel,
    toggleGhostMode,
    toggleIncognitoMode,
    settings,
    updateSettings,
  } = useAppStore();

  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const privacyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleHideCostNumbers();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        toggleGhostMode();
      }
      if (e.key === 'Escape' && privacyLevel === 'standard') {
        toggleHideCostNumbers();
      }
    };

    const handleWindowBlur = () => {
      if (settings.auto_mask_on_blur && privacyLevel === 'standard') {
        setPrivacyLevel('mask_costs');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [toggleHideCostNumbers, toggleGhostMode, privacyLevel, settings.auto_mask_on_blur, setPrivacyLevel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (privacyMenuRef.current && !privacyMenuRef.current.contains(e.target as Node)) {
        setShowPrivacyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Active Status */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => setCurrentView(activeMeeting ? 'live' : 'setup')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs shadow-sm">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">MeetMeter</span>
            <span className="text-[11px] text-zinc-400 font-normal">Internal Audit</span>
          </div>
        </button>

        {/* Live Meeting Ticker in Header */}
        {activeMeeting && currentView !== 'live' && (
          <button
            onClick={() => setCurrentView('live')}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono border transition ${
              activeMeeting.isOvertime
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeMeeting.isOvertime ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            <span>Active:</span>
            <span className="font-medium">
              {formatCurrency(activeMeeting.liveCost, settings.display_currency, undefined, hideCostNumbers)}
            </span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-1">
        <button
          onClick={() => setCurrentView(activeMeeting ? 'live' : 'setup')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            currentView === 'setup' || currentView === 'live'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current opacity-70" />
          <span>{activeMeeting ? 'Live Clock' : 'New Meeting'}</span>
        </button>

        <button
          onClick={() => setCurrentView('people')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            currentView === 'people'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 opacity-70" />
          <span>Roster & Rates</span>
        </button>

        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            currentView === 'dashboard'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 opacity-70" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            currentView === 'settings'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 opacity-70" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Right Controls: Currency & Privacy Level */}
      <div className="flex items-center gap-2.5">
        {/* Currency Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-xs">
          {(['USD', 'EUR', 'GBP', 'MAD'] as CurrencyCode[]).map((curr) => (
            <button
              key={curr}
              onClick={() => updateSettings({ display_currency: curr })}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                settings.display_currency === curr
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Privacy Shield Dropdown */}
        <div className="relative" ref={privacyMenuRef}>
          <button
            onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition ${
              privacyLevel === 'ghost_mode'
                ? 'bg-purple-950/40 text-purple-300 border-purple-800'
                : privacyLevel === 'mask_costs'
                ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
            }`}
          >
            {privacyLevel === 'ghost_mode' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Stealth Mode</span>
              </>
            ) : privacyLevel === 'mask_costs' ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Masked (•••)</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Privacy Safe</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {showPrivacyMenu && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl p-2 space-y-1 z-50 text-xs animate-scaleUp">
              <div className="px-2 py-1 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Screen-Share Protection
              </div>

              <button
                onClick={() => {
                  setPrivacyLevel('standard');
                  setShowPrivacyMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-md flex flex-col gap-0.5 transition ${
                  privacyLevel === 'standard' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-medium text-zinc-200">Standard Tier Masking</div>
                <div className="text-[10px] text-zinc-500">Exact salaries hidden behind role tiers</div>
              </button>

              <button
                onClick={() => {
                  setPrivacyLevel('mask_costs');
                  setShowPrivacyMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-md flex flex-col gap-0.5 transition ${
                  privacyLevel === 'mask_costs' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-medium text-zinc-200 flex items-center justify-between">
                  <span>Confidential Cost Mask</span>
                  <span className="text-[9px] font-mono text-zinc-500">Ctrl+Shift+H</span>
                </div>
                <div className="text-[10px] text-zinc-500">Replaces all financial figures with •••</div>
              </button>

              <button
                onClick={() => {
                  setPrivacyLevel('ghost_mode');
                  setShowPrivacyMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-md flex flex-col gap-0.5 transition ${
                  privacyLevel === 'ghost_mode' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-medium text-zinc-200 flex items-center justify-between">
                  <span>Full Stealth Mode</span>
                  <span className="text-[9px] font-mono text-zinc-500">Ctrl+Shift+G</span>
                </div>
                <div className="text-[10px] text-zinc-500">Anonymizes attendee names and titles</div>
              </button>

              <div className="pt-1.5 border-t border-zinc-800 px-2 py-1 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">RAM-only Incognito</span>
                <input
                  type="checkbox"
                  checked={settings.incognito_mode}
                  onChange={toggleIncognitoMode}
                  className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
