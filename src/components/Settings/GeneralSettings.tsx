import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { CurrencyCode } from '../../types';
import { soundEngine } from '../../lib/soundEngine';
import {
  Sliders,
  DollarSign,
  Volume2,
  Shield,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const { settings, updateSettings, purgeAllData, setPrivacyLevel } = useAppStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeText, setPurgeText] = useState('');

  const handleSoundTest = (type: 'warning-15m' | 'warning-1m' | 'overtime') => {
    soundEngine.playChime(type, settings.sound_volume);
  };

  const handlePurge = () => {
    if (purgeText.toLowerCase() === 'delete') {
      purgeAllData();
      setShowPurgeConfirm(false);
      setPurgeText('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">System Preferences</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure currency presentation, privacy shields, audio cues, and local database settings.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preferences Updated</span>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Privacy & Screen-Share Safeguards */}
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Screen-Share Privacy Controls
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Protect compensation confidentiality during screen shares and live presentations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setPrivacyLevel('standard')}
              className={`p-3 rounded-md border text-left space-y-0.5 transition ${
                settings.privacy_level === 'standard'
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                  : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:bg-zinc-850'
              }`}
            >
              <div className="text-xs font-medium">Standard Protection</div>
              <p className="text-[10px] text-zinc-500">Salaries masked behind role brackets.</p>
            </button>

            <button
              onClick={() => setPrivacyLevel('mask_costs')}
              className={`p-3 rounded-md border text-left space-y-0.5 transition ${
                settings.privacy_level === 'mask_costs'
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                  : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:bg-zinc-850'
              }`}
            >
              <div className="text-xs font-medium flex items-center justify-between">
                <span>Cost Mask</span>
                <span className="text-[9px] font-mono text-zinc-500">Ctrl+Shift+H</span>
              </div>
              <p className="text-[10px] text-zinc-500">All cost numbers become •••.</p>
            </button>

            <button
              onClick={() => setPrivacyLevel('ghost_mode')}
              className={`p-3 rounded-md border text-left space-y-0.5 transition ${
                settings.privacy_level === 'ghost_mode'
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                  : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:bg-zinc-850'
              }`}
            >
              <div className="text-xs font-medium flex items-center justify-between">
                <span>Stealth Mode</span>
                <span className="text-[9px] font-mono text-zinc-500">Ctrl+Shift+G</span>
              </div>
              <p className="text-[10px] text-zinc-500">Anonymizes attendee names and titles.</p>
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 space-y-2.5 text-xs">
            <label className="flex items-center justify-between p-3 rounded-md bg-zinc-950 border border-zinc-800 cursor-pointer">
              <div>
                <div className="font-medium text-zinc-200">Auto-Mask on Window Unfocus</div>
                <p className="text-[11px] text-zinc-500">
                  Automatically replaces numbers with ••• whenever MeetMeter window loses focus.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_mask_on_blur}
                onChange={(e) => updateSettings({ auto_mask_on_blur: e.target.checked })}
                className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 ml-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-md bg-zinc-950 border border-zinc-800 cursor-pointer">
              <div>
                <div className="font-medium text-zinc-200">RAM-Only Incognito Session</div>
                <p className="text-[11px] text-zinc-500">
                  When enabled, meeting records and audit notes live in RAM and never write to disk.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.incognito_mode}
                onChange={(e) => updateSettings({ incognito_mode: e.target.checked })}
                className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 ml-4"
              />
            </label>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Currency & Opportunity Conversion
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Display Currency
              </label>
              <select
                value={settings.display_currency}
                onChange={(e) => updateSettings({ display_currency: e.target.value as CurrencyCode })}
                className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono focus:border-zinc-500 outline-none"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="MAD">MAD (MAD) — Moroccan Dirham</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Engineering Focus Capacity Base Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={settings.focus_hour_rate}
                  onChange={(e) => updateSettings({ focus_hour_rate: parseFloat(e.target.value) || 75 })}
                  className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono focus:border-zinc-500 outline-none"
                />
                <span className="text-xs text-zinc-400">$/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Cues */}
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Audible Time Cues
              </h3>
              <p className="text-[11px] text-zinc-500">Non-startling harmonic notifications at session milestones.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.sound_enabled}
              onChange={(e) => updateSettings({ sound_enabled: e.target.checked })}
              className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0"
            />
          </div>

          {settings.sound_enabled && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Chime Volume</span>
                <span className="font-mono text-zinc-400">{Math.round(settings.sound_volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={settings.sound_volume}
                onChange={(e) => updateSettings({ sound_volume: parseFloat(e.target.value) })}
                className="w-full accent-zinc-200 cursor-pointer"
              />

              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-zinc-500">Preview:</span>
                <button
                  type="button"
                  onClick={() => handleSoundTest('warning-15m')}
                  className="px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px]"
                >
                  15m Tone
                </button>
                <button
                  type="button"
                  onClick={() => handleSoundTest('warning-1m')}
                  className="px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px]"
                >
                  1m Tone
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Local Storage & Wipe Data */}
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Local Data Management
              </h3>
              <p className="text-[11px] text-zinc-500">MeetMeter operates 100% locally with zero cloud telemetry.</p>
            </div>
            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="px-3 py-1.5 rounded-md bg-zinc-950 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs font-medium transition"
            >
              Clear Local Database
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-semibold text-zinc-100">Clear All Local Records?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will erase all registered members and meeting logs from local storage. Type <strong className="font-mono text-zinc-200">delete</strong> to confirm.
            </p>

            <input
              type="text"
              placeholder="Type 'delete' to confirm"
              value={purgeText}
              onChange={(e) => setPurgeText(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPurgeConfirm(false);
                  setPurgeText('');
                }}
                className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purgeText.toLowerCase() !== 'delete'}
                onClick={handlePurge}
                className="px-3.5 py-1.5 rounded-md bg-rose-600 text-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-500"
              >
                Clear Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
