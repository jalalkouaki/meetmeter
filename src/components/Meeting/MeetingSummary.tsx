import React from 'react';
import { useAppStore } from '../../lib/store';
import { formatCurrency } from '../../lib/currency';
import { convertOpportunityCost } from '../../lib/metrics';
import { RoiPoll } from './RoiPoll';
import {
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  BarChart2,
  RotateCcw,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const MeetingSummary: React.FC = () => {
  const { recentCompletedMeeting, settings, hideCostNumbers, setCurrentView } = useAppStore();

  if (!recentCompletedMeeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-center p-8">
        <h3 className="text-sm font-semibold text-zinc-200">No Recent Session Record</h3>
        <button
          onClick={() => setCurrentView('setup')}
          className="px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200"
        >
          New Meeting
        </button>
      </div>
    );
  }

  const meeting = recentCompletedMeeting;
  const startedTime = new Date(meeting.started_at).getTime();
  const endedTime = meeting.ended_at ? new Date(meeting.ended_at).getTime() : startedTime;
  const durationSeconds = Math.max(1, Math.round((endedTime - startedTime) / 1000));
  const durationMinutes = Math.ceil(durationSeconds / 60);

  const costPerAttendee =
    meeting.attendee_ids.length > 0 ? meeting.total_cost / meeting.attendee_ids.length : 0;

  const emailScore = meeting.email_score || 45;
  const oppCost = convertOpportunityCost(meeting.total_cost, 'focus_hours', settings.focus_hour_rate);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 animate-fadeIn pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-750">
              {meeting.category}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Completed {new Date(meeting.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mt-1.5 tracking-tight">
            {meeting.title}
          </h2>
          {meeting.purpose && (
            <p className="text-xs text-zinc-400 mt-0.5">{meeting.purpose}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('setup')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Executive Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Total Labor Cost</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {formatCurrency(meeting.total_cost, settings.display_currency, undefined, hideCostNumbers)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            ≈ {oppCost.value} {oppCost.label}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Cost Per Attendee</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {formatCurrency(costPerAttendee, settings.display_currency, undefined, hideCostNumbers)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Across {meeting.attendee_ids.length} members
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Actual Duration</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {durationMinutes}m
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Planned for {meeting.planned_minutes}m ({durationMinutes > meeting.planned_minutes ? `+${durationMinutes - meeting.planned_minutes}m overtime` : 'On schedule'})
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Overtime Overrun</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {formatCurrency(meeting.overtime_cost || 0, settings.display_currency, undefined, hideCostNumbers)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            {(meeting.overtime_cost || 0) > 0 ? 'Unplanned budget excess' : 'Zero budget overrun'}
          </p>
        </div>
      </div>

      {/* Async Feasibility Index */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Asynchronous Feasibility Index
            </h3>
            <p className="text-[11px] text-zinc-400">
              Evaluated based on attendee scale, duration overrun, and agenda profile.
            </p>
          </div>

          <div className="text-xs font-mono font-semibold text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700">
            {emailScore}% Async Score
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              emailScore >= 70 ? 'bg-rose-500' : emailScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${emailScore}%` }}
          />
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed pt-1">
          {emailScore >= 70 ? (
            <span>
              <strong>Recommendation:</strong> High recurring cost profile for a status session. Consider transitioning similar regular updates to asynchronous memos or structured status digests.
            </span>
          ) : emailScore >= 40 ? (
            <span>
              <strong>Recommendation:</strong> Moderate efficiency. Streamlining the attendee roster to required decision-makers would yield higher ROI.
            </span>
          ) : (
            <span>
              <strong>Recommendation:</strong> High-leverage execution. Focused attendee group and strictly within scheduled budget.
            </span>
          )}
        </p>
      </div>

      {/* Recorded Takeaways & Action Items */}
      {meeting.wrapup_notes && (
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Recorded Outcomes & Next Steps
          </h3>

          {meeting.wrapup_notes.takeaways && meeting.wrapup_notes.takeaways.length > 0 && (
            <ul className="space-y-1 pl-1">
              {meeting.wrapup_notes.takeaways.map((t, idx) => (
                <li key={idx} className="text-xs text-zinc-200 flex items-start gap-2">
                  <span className="text-zinc-500">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}

          {meeting.wrapup_notes.action_owner && (
            <div className="pt-2 border-t border-zinc-800/80 text-xs flex items-center justify-between">
              <span className="text-zinc-400">Action Item Owner:</span>
              <span className="text-zinc-200 font-medium font-mono">
                {meeting.wrapup_notes.action_owner}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Session Value Assessment Poll */}
      <RoiPoll meetingId={meeting.id} totalCost={meeting.total_cost} />
    </div>
  );
};
