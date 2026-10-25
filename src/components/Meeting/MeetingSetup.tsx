import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { MeetingCategory } from '../../types';
import { calculateBurnRates, calculatePlannedBudget } from '../../lib/costEngine';
import { formatCurrency } from '../../lib/currency';
import {
  Play,
  Clock,
  Users,
  Check,
  Search,
  DollarSign,
  AlertCircle,
  UserPlus,
  Layers,
  MessageSquare,
  Zap,
  Lightbulb,
  UserCheck,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES: { label: MeetingCategory; desc: string; icon: any }[] = [
  { label: 'Status Update', desc: 'Team synchronization & progress review', icon: Layers },
  { label: 'Decision', desc: 'Architecture, product, or operational sign-off', icon: Zap },
  { label: 'Brainstorm', desc: 'Problem solving & collaborative ideation', icon: Lightbulb },
  { label: '1-on-1', desc: 'Direct report alignment & coaching', icon: UserCheck },
  { label: 'Client', desc: 'External customer or partner meeting', icon: Briefcase },
  { label: 'Other', desc: 'Ad-hoc or general discussion', icon: HelpCircle },
];

const DURATION_PRESETS = [15, 30, 45, 60];

export const MeetingSetup: React.FC = () => {
  const { people, settings, startMeeting, hideCostNumbers, setCurrentView } = useAppStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MeetingCategory>('Status Update');
  const [plannedMinutes, setPlannedMinutes] = useState(30);
  const [customMinutes, setCustomMinutes] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>(
    people.map((p) => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAttendees = useMemo(() => {
    return people.filter((p) => selectedAttendeeIds.includes(p.id));
  }, [people, selectedAttendeeIds]);

  const activeBurnRate = useMemo(() => {
    return calculateBurnRates(selectedAttendees, settings.overhead_multiplier);
  }, [selectedAttendees, settings.overhead_multiplier]);

  const activePlannedBudget = useMemo(() => {
    return calculatePlannedBudget(selectedAttendees, plannedMinutes, settings.overhead_multiplier);
  }, [selectedAttendees, plannedMinutes, settings.overhead_multiplier]);

  const toggleAttendee = (id: string) => {
    setSelectedAttendeeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAttendeeIds.length === people.length) {
      setSelectedAttendeeIds([]);
    } else {
      setSelectedAttendeeIds(people.map((p) => p.id));
    }
  };

  const filteredPeople = people.filter((p) =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role_tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAttendeeIds.length === 0) return;

    startMeeting(
      title.trim() || `${category} (${plannedMinutes}m)`,
      category,
      plannedMinutes,
      selectedAttendeeIds,
      purpose.trim()
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">New Meeting Session</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure attendees and planned duration to track actual labor expenditure in real-time.
          </p>
        </div>

        {/* Live Budget KPI summary */}
        <div className="flex items-center gap-6 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-lg">
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Estimated Budget</div>
            <div className="text-lg font-mono font-semibold text-zinc-100 tabular-nums">
              {formatCurrency(activePlannedBudget, settings.display_currency, undefined, hideCostNumbers)}
            </div>
          </div>
          <div className="h-7 w-px bg-zinc-800" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Burn Rate</div>
            <div className="text-xs font-mono text-zinc-400 tabular-nums">
              {formatCurrency(activeBurnRate.perMinute, settings.display_currency, undefined, hideCostNumbers)}/min
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleStart} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title and Purpose */}
          <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Meeting Subject</label>
              <input
                type="text"
                placeholder="e.g. Q4 Release Readiness & Blocker Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-zinc-950 border border-zinc-750 text-zinc-100 text-sm focus:border-zinc-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Objective / Deliverable (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Finalize go-to-market timeline and unblock backend migration"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-zinc-950 border border-zinc-750 text-zinc-100 text-xs focus:border-zinc-500 outline-none transition"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <label className="block text-xs font-medium text-zinc-300">Meeting Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.label;
                const IconComponent = cat.icon;
                return (
                  <button
                    type="button"
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className={`p-3 rounded-md border text-left flex flex-col gap-1 transition ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 leading-tight">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planned Duration */}
          <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">Planned Duration</label>
              <span className="text-xs text-zinc-400 font-mono font-medium">{plannedMinutes} minutes</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {DURATION_PRESETS.map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => {
                    setPlannedMinutes(mins);
                    setCustomMinutes('');
                  }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition ${
                    plannedMinutes === mins && !customMinutes
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  {mins} min
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  type="number"
                  min="5"
                  max="480"
                  placeholder="Custom"
                  value={customMinutes}
                  onChange={(e) => {
                    setCustomMinutes(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) setPlannedMinutes(val);
                  }}
                  className="w-20 px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono focus:border-zinc-500 outline-none"
                />
                <span className="text-xs text-zinc-500">mins</span>
              </div>
            </div>
          </div>

          {/* Attendee Selection */}
          <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  Attendee Roster ({selectedAttendeeIds.length} of {people.length} selected)
                </label>
                <p className="text-[11px] text-zinc-500">Compensation is calculated using standard role tier rates.</p>
              </div>

              {people.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-zinc-400 hover:text-zinc-200 font-medium transition"
                  >
                    {selectedAttendeeIds.length === people.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('people')}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    + Add Member
                  </button>
                </div>
              )}
            </div>

            {people.length === 0 ? (
              <div className="p-6 rounded-md bg-zinc-950/70 border border-dashed border-zinc-800 text-center space-y-2.5">
                <div className="text-xs text-zinc-300 font-medium">No team members registered</div>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  Add team members in Roster & Rates to calculate accurate labor costs.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('people')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-zinc-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Team Member</span>
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name or role tier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:border-zinc-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredPeople.map((person) => {
                    const isSelected = selectedAttendeeIds.includes(person.id);
                    const loaded = person.base_hourly_rate * settings.overhead_multiplier;
                    return (
                      <div
                        key={person.id}
                        onClick={() => toggleAttendee(person.id)}
                        className={`p-2.5 rounded-md border flex items-center justify-between cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-zinc-850 border-zinc-700 text-zinc-100'
                            : 'bg-zinc-950/60 border-zinc-850 text-zinc-500 hover:text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                                : 'border-zinc-700 bg-zinc-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-medium">{person.display_name}</div>
                            <div className="text-[10px] text-zinc-500">{person.role_tier}</div>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-zinc-400">
                          {hideCostNumbers ? '•••' : `$${loaded.toFixed(0)}/h`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-5 sticky top-20">
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Session Economics
            </div>

            <div className="space-y-3 text-xs divide-y divide-zinc-800/60">
              <div className="flex justify-between pt-1">
                <span className="text-zinc-500">Attendee Count</span>
                <span className="font-mono text-zinc-200">{selectedAttendees.length} members</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Target Duration</span>
                <span className="font-mono text-zinc-200">{plannedMinutes} minutes</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Aggregate Loaded Rate</span>
                <span className="font-mono text-zinc-200">
                  {formatCurrency(activeBurnRate.perHour, settings.display_currency, undefined, hideCostNumbers)}/hr
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Minute Burn Rate</span>
                <span className="font-mono text-zinc-200">
                  {formatCurrency(activeBurnRate.perMinute, settings.display_currency, undefined, hideCostNumbers)}/min
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="font-medium text-zinc-200">Planned Cost</span>
                <span className="font-mono font-semibold text-zinc-100 text-base">
                  {formatCurrency(activePlannedBudget, settings.display_currency, undefined, hideCostNumbers)}
                </span>
              </div>
            </div>

            {selectedAttendeeIds.length === 0 ? (
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-zinc-500" />
                <span>
                  {people.length === 0
                    ? 'Add team members first to track session.'
                    : 'Select at least 1 attendee to begin.'}
                </span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Meeting Clock</span>
              </button>
            )}

            <p className="text-[11px] text-zinc-500 text-center leading-normal">
              Launches ambient tracking widget. Rational time notifications will notify checkpoints automatically.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
