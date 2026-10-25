import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../lib/store';
import { formatCurrency } from '../../lib/currency';
import { convertOpportunityCost } from '../../lib/metrics';
import { WrapUpModal } from '../Meeting/WrapUpModal';
import {
  Pause,
  Play,
  Square,
  Clock,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export const LiveWidget: React.FC = () => {
  const {
    activeMeeting,
    tickMeeting,
    pauseMeeting,
    resumeMeeting,
    stopMeeting,
    settings,
    hideCostNumbers,
    toggleHideCostNumbers,
    privacyLevel,
    opportunityMetric,
    cycleOpportunityMetric,
    displayMode,
    setDisplayMode,
    setCurrentView,
  } = useAppStore();

  const [isWrapUpOpen, setIsWrapUpOpen] = useState(false);

  // Position state for drag
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  // Real-time 1-second interval ticker
  useEffect(() => {
    if (!activeMeeting || !activeMeeting.isRunning || activeMeeting.isPaused) return;

    const timer = setInterval(() => {
      tickMeeting();
    }, 1000);

    return () => clearInterval(timer);
  }, [activeMeeting, tickMeeting]);

  if (!activeMeeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-center p-8">
        <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">No Active Meeting</h3>
          <p className="text-xs text-zinc-500 max-w-xs mt-0.5">
            Configure attendees and duration to start tracking.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('setup')}
          className="px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition"
        >
          New Meeting
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isGhost = privacyLevel === 'ghost_mode';

  const oppCost = convertOpportunityCost(
    activeMeeting.liveCost,
    opportunityMetric,
    settings.focus_hour_rate
  );

  const isRed = activeMeeting.statusColor === 'red' || activeMeeting.isOvertime;
  const isAmber = activeMeeting.statusColor === 'amber';

  const meterBarClass = isRed
    ? 'bg-rose-500'
    : isAmber
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.posX + dx,
      y: dragRef.current.posY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative select-none"
    >
      {/* COMPACT PILL MODE */}
      {displayMode === 'compact' ? (
        <div
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          onMouseDown={handleMouseDown}
          className="cursor-grab active:cursor-grabbing z-30 p-2.5 px-4 rounded-lg bg-zinc-900/95 backdrop-blur-md border border-zinc-800 flex items-center gap-3.5 shadow-xl transition-all"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeMeeting.isPaused
                  ? 'bg-amber-400'
                  : isRed
                  ? 'bg-rose-500'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-mono text-xs text-zinc-300 tabular-nums">
              {formatTime(activeMeeting.elapsedSeconds)}
            </span>
          </div>

          <div className="h-3.5 w-px bg-zinc-800" />

          <div className="flex items-center gap-1.5 cursor-pointer" onClick={cycleOpportunityMetric}>
            <span className="text-sm font-semibold font-mono text-zinc-100 tabular-nums">
              {hideCostNumbers ? (
                '•••'
              ) : opportunityMetric === 'money' ? (
                formatCurrency(activeMeeting.liveCost, settings.display_currency, undefined, false)
              ) : (
                `${oppCost.value} ${oppCost.unit}`
              )}
            </span>
          </div>

          <div className="h-3.5 w-px bg-zinc-800" />

          <div className="flex items-center gap-1">
            <button
              onClick={activeMeeting.isPaused ? resumeMeeting : pauseMeeting}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
              title={activeMeeting.isPaused ? 'Resume' : 'Pause'}
            >
              {activeMeeting.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setDisplayMode('full')}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
              title="Expand"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsWrapUpOpen(true)}
              className="p-1 rounded text-rose-400 hover:bg-rose-950/50 transition"
              title="Wrap Up / Stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      ) : (
        /* FULL INSTRUMENT WIDGET */
        <div
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          onMouseDown={handleMouseDown}
          className="cursor-grab active:cursor-grabbing z-30 w-full max-w-[360px] rounded-xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-5 shadow-2xl space-y-4 transition-all relative"
        >
          {/* Top Bar: Title & Controls */}
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-750">
                  {isGhost ? 'Private Session' : activeMeeting.category}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {activeMeeting.attendees.length} attendees
                </span>
              </div>
              <h3 className="text-xs font-semibold text-zinc-100 truncate mt-1">
                {isGhost ? '••••••••••••••••••••' : activeMeeting.title}
              </h3>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleHideCostNumbers}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                title="Screen-Share Mask (Ctrl+Shift+H)"
              >
                {hideCostNumbers ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setDisplayMode('compact')}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                title="Compact Pill"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* HERO ELEMENT: Live Cost & Elapsed Time */}
          <div className="text-center py-2 space-y-2">
            <div
              onClick={cycleOpportunityMetric}
              title="Click to switch unit ($ vs Focus Capacity)"
              className="cursor-pointer group flex flex-col items-center justify-center transition"
            >
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5 group-hover:text-zinc-200">
                <span>{opportunityMetric === 'money' ? 'Accumulated Labor Cost' : oppCost.label}</span>
                <RefreshCw className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
              </span>

              {/* Monospace Cost Counter */}
              <div className="text-4xl font-mono font-semibold text-zinc-100 tracking-tight tabular-nums py-0.5">
                {hideCostNumbers ? (
                  <span className="tracking-widest text-zinc-600">••••••</span>
                ) : opportunityMetric === 'money' ? (
                  formatCurrency(activeMeeting.liveCost, settings.display_currency, undefined, false)
                ) : (
                  <span>
                    {oppCost.value} <span className="text-xl text-zinc-400 font-sans">{oppCost.unit}</span>
                  </span>
                )}
              </div>

              {opportunityMetric !== 'money' && !hideCostNumbers && (
                <div className="text-[11px] font-mono text-zinc-500">
                  Equivalent to {formatCurrency(activeMeeting.liveCost, settings.display_currency, undefined, false)}
                </div>
              )}
            </div>

            {/* Time & Burn Rate */}
            <div className="flex items-center justify-center gap-3 text-xs font-mono text-zinc-400 pt-0.5 tabular-nums">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span className="text-zinc-200 font-medium">{formatTime(activeMeeting.elapsedSeconds)}</span>
                <span className="text-zinc-600">/ {activeMeeting.plannedMinutes}m</span>
              </div>
              <div className="text-zinc-700">•</div>
              <div>
                <span className="text-zinc-300">
                  {formatCurrency(activeMeeting.costPerMinute, settings.display_currency, undefined, hideCostNumbers)}
                </span>
                <span className="text-zinc-500">/min</span>
              </div>
            </div>
          </div>

          {/* Budget Progress Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Budget Progress</span>
              <span className="font-mono text-zinc-400 tabular-nums">
                {hideCostNumbers ? '•••' : `${Math.min(999, Math.round(activeMeeting.budgetPercentage))}%`} of{' '}
                {formatCurrency(activeMeeting.plannedBudget, settings.display_currency, undefined, hideCostNumbers)}
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${meterBarClass}`}
                style={{ width: `${Math.min(100, activeMeeting.budgetPercentage)}%` }}
              />
            </div>
          </div>

          {/* Overtime Alert */}
          {activeMeeting.isOvertime && (
            <div className="p-2.5 rounded-md bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Overtime (+{formatTime(activeMeeting.overtimeSeconds)})</span>
              </div>
              <span className="text-[11px] text-rose-300">
                +{formatCurrency(activeMeeting.overtimeCost, settings.display_currency, undefined, hideCostNumbers)}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
            <button
              onClick={activeMeeting.isPaused ? resumeMeeting : pauseMeeting}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                activeMeeting.isPaused
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-200'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-750'
              }`}
            >
              {activeMeeting.isPaused ? (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsWrapUpOpen(true)}
              className="py-1.5 px-3 rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wrap-Up</span>
            </button>

            <button
              onClick={stopMeeting}
              className="py-1.5 px-3.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* Wrap-Up Modal */}
      <WrapUpModal
        isOpen={isWrapUpOpen}
        onClose={() => setIsWrapUpOpen(false)}
        onConfirmStop={stopMeeting}
      />
    </div>
  );
};
