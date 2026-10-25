import { create } from 'zustand';
import { Person, AppSettings, Meeting, OpportunityMetric, DisplayMode, RoleTier, MeetingAttendeeSnapshot, AuditFlag, PrivacyLevel } from '../types';
import { storage } from './storage';
import { evaluateCostState, calculateBurnRates, calculatePlannedBudget, calculateEmailScore } from './costEngine';
import { soundEngine } from './soundEngine';
import { notificationEngine, ActiveToast } from './notificationEngine';

export interface ActiveMeetingState {
  id: string;
  title: string;
  category: any;
  purpose: string;
  plannedMinutes: number;
  attendees: Person[];
  startedAt: string;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  statusColor: 'green' | 'amber' | 'red';
  liveCost: number;
  costPerMinute: number;
  costPerSecond: number;
  plannedBudget: number;
  isOvertime: boolean;
  overtimeSeconds: number;
  overtimeCost: number;
  budgetPercentage: number;
  triggeredReminders: string[]; // ['halfway', '10m', '5m', '2m', '1m', 'overtime']
  wrapupNotes?: {
    takeaways?: string[];
    action_owner?: string;
  };
}

interface AppStore {
  // Navigation & View State
  currentView: 'setup' | 'live' | 'summary' | 'dashboard' | 'people' | 'settings';
  displayMode: DisplayMode;
  hideCostNumbers: boolean;
  privacyLevel: PrivacyLevel;
  opportunityMetric: OpportunityMetric;
  toasts: ActiveToast[];

  // Core Data
  people: Person[];
  settings: AppSettings;
  meetings: Meeting[];
  auditFlags: AuditFlag[];
  recentCompletedMeeting: Meeting | null;

  // Active Live Meeting
  activeMeeting: ActiveMeetingState | null;

  // Actions
  initApp: () => Promise<void>;
  setCurrentView: (view: 'setup' | 'live' | 'summary' | 'dashboard' | 'people' | 'settings') => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setPrivacyLevel: (level: PrivacyLevel) => void;
  toggleHideCostNumbers: () => void;
  toggleGhostMode: () => void;
  toggleIncognitoMode: () => void;
  cycleOpportunityMetric: () => void;
  setOpportunityMetric: (m: OpportunityMetric) => void;
  dismissToast: (id: string) => void;

  // People & Settings Actions
  savePerson: (person: Person) => void;
  deletePerson: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateTierRates: (rates: Record<RoleTier, number>) => void;
  purgeAllData: () => void;

  // Meeting Lifecycle
  startMeeting: (title: string, category: any, plannedMinutes: number, attendeeIds: string[], purpose: string) => void;
  tickMeeting: () => void;
  pauseMeeting: () => void;
  resumeMeeting: () => void;
  stopMeeting: () => void;
  submitRoiRating: (rating: number) => void;
  saveWrapUpNotes: (takeaways: string[], action_owner: string) => void;
  deleteMeeting: (id: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentView: 'setup',
  displayMode: 'full',
  hideCostNumbers: false,
  privacyLevel: 'standard',
  opportunityMetric: 'money',
  toasts: [],
  people: [],
  settings: {
    id: 'default',
    base_currency: 'USD',
    display_currency: 'USD',
    overhead_multiplier: 1.3,
    sound_enabled: true,
    sound_volume: 0.5,
    focus_hour_rate: 75,
    theme: 'dark',
    branding: { company_name: '', slogan: '' },
    tier_rates: {
      Junior: 35,
      Mid: 55,
      Senior: 85,
      Management: 115,
      Executive: 165,
    },
    privacy_level: 'standard',
    auto_mask_on_blur: true,
    incognito_mode: false,
  },
  meetings: [],
  auditFlags: [],
  recentCompletedMeeting: null,
  activeMeeting: null,

  initApp: async () => {
    await storage.init();
    const people = storage.getPeople();
    const settings = storage.getSettings();
    const meetings = storage.getMeetings();
    const auditFlags = storage.getAuditFlags();

    // Hook up toast handler from notification engine
    notificationEngine.setToastHandler((toast) => {
      set((state) => ({
        toasts: [...state.toasts.slice(-3), toast], // Keep max 4 toasts
      }));

      setTimeout(() => {
        get().dismissToast(toast.id);
      }, 5500);
    });

    set({
      people,
      settings,
      meetings,
      auditFlags,
      privacyLevel: settings.privacy_level || 'standard',
      hideCostNumbers: settings.privacy_level === 'mask_costs' || settings.privacy_level === 'ghost_mode',
    });
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setCurrentView: (view) => set({ currentView: view }),
  setDisplayMode: (mode) => set({ displayMode: mode }),

  setPrivacyLevel: (level) => {
    const isMasked = level === 'mask_costs' || level === 'ghost_mode';
    get().updateSettings({ privacy_level: level });
    set({ privacyLevel: level, hideCostNumbers: isMasked });
  },

  toggleHideCostNumbers: () => {
    const current = get().hideCostNumbers;
    const nextLevel: PrivacyLevel = current ? 'standard' : 'mask_costs';
    get().updateSettings({ privacy_level: nextLevel });
    set({ hideCostNumbers: !current, privacyLevel: nextLevel });
  },

  toggleGhostMode: () => {
    const currentLevel = get().privacyLevel;
    const nextLevel: PrivacyLevel = currentLevel === 'ghost_mode' ? 'standard' : 'ghost_mode';
    get().updateSettings({ privacy_level: nextLevel });
    set({
      privacyLevel: nextLevel,
      hideCostNumbers: nextLevel === 'ghost_mode',
    });
  },

  toggleIncognitoMode: () => {
    const current = get().settings.incognito_mode;
    get().updateSettings({ incognito_mode: !current });
  },

  cycleOpportunityMetric: () => {
    const metrics: OpportunityMetric[] = ['money', 'focus_hours', 'support_hours', 'coffees'];
    const currentIdx = metrics.indexOf(get().opportunityMetric);
    const nextIdx = (currentIdx + 1) % metrics.length;
    set({ opportunityMetric: metrics[nextIdx] });
  },
  setOpportunityMetric: (m) => set({ opportunityMetric: m }),

  savePerson: (person) => {
    storage.savePerson(person);
    set({ people: storage.getPeople() });
  },

  deletePerson: (id) => {
    storage.deletePerson(id);
    set({ people: storage.getPeople() });
  },

  updateSettings: (newSettings) => {
    const current = get().settings;
    const merged = { ...current, ...newSettings };
    storage.saveSettings(merged);
    set({ settings: merged });
  },

  updateTierRates: (rates) => {
    const current = get().settings;
    const merged: AppSettings = { ...current, tier_rates: rates };
    storage.saveSettings(merged);
    set({ settings: merged });
  },

  purgeAllData: () => {
    storage.purgeAllData();
    set({
      people: [],
      meetings: [],
      auditFlags: [],
      recentCompletedMeeting: null,
      activeMeeting: null,
      currentView: 'setup',
    });
  },

  startMeeting: (title, category, plannedMinutes, attendeeIds, purpose) => {
    const { people, settings } = get();
    const attendees = people.filter((p) => attendeeIds.includes(p.id));
    const burnRates = calculateBurnRates(attendees, settings.overhead_multiplier);
    const plannedBudget = calculatePlannedBudget(attendees, plannedMinutes, settings.overhead_multiplier);
    const meetingId = `mtg_${Date.now()}`;
    const startedAt = new Date().toISOString();

    // Request browser notifications permission
    notificationEngine.requestPermission();

    const activeState: ActiveMeetingState = {
      id: meetingId,
      title: title || 'Quick Meeting',
      category: category || 'Status Update',
      purpose: purpose || '',
      plannedMinutes,
      attendees,
      startedAt,
      elapsedSeconds: 0,
      isRunning: true,
      isPaused: false,
      statusColor: 'green',
      liveCost: 0,
      costPerMinute: burnRates.perMinute,
      costPerSecond: burnRates.perSecond,
      plannedBudget,
      isOvertime: false,
      overtimeSeconds: 0,
      overtimeCost: 0,
      budgetPercentage: 0,
      triggeredReminders: [],
    };

    if (settings.sound_enabled) {
      soundEngine.playChime('start', settings.sound_volume);
    }

    notificationEngine.sendReminder(
      '⏱️ Meeting Clock Started',
      `Tracking "${activeState.title}" (${plannedMinutes}m planned, budget $${plannedBudget.toFixed(2)})`,
      'info'
    );

    set({
      activeMeeting: activeState,
      currentView: 'live',
    });
  },

  tickMeeting: () => {
    const { activeMeeting, settings } = get();
    if (!activeMeeting || !activeMeeting.isRunning || activeMeeting.isPaused) return;

    const nextSeconds = activeMeeting.elapsedSeconds + 1;
    const burnRates = {
      perHour: activeMeeting.costPerMinute * 60,
      perMinute: activeMeeting.costPerMinute,
      perSecond: activeMeeting.costPerSecond,
    };

    const costState = evaluateCostState(nextSeconds, activeMeeting.plannedMinutes, burnRates);
    const totalPlannedSeconds = activeMeeting.plannedMinutes * 60;
    const remainingSeconds = totalPlannedSeconds - nextSeconds;
    const triggered = [...activeMeeting.triggeredReminders];

    // --- RATIONAL REMINDER DISPATCH ENGINE ---
    // 1. Halfway Mark (for meetings >= 10 minutes)
    const halfwaySeconds = Math.floor(totalPlannedSeconds / 2);
    if (nextSeconds === halfwaySeconds && totalPlannedSeconds >= 600 && !triggered.includes('halfway')) {
      triggered.push('halfway');
      const minsLeft = Math.round(remainingSeconds / 60);
      notificationEngine.sendReminder(
        '⏳ Halfway Checkpoint',
        `${minsLeft} minutes remaining in "${activeMeeting.title}" (Spent: $${costState.liveCost.toFixed(2)})`,
        'info'
      );
      if (settings.sound_enabled) soundEngine.playChime('warning-15m', settings.sound_volume);
    }

    // 2. 10 Minutes Left (for meetings > 20 minutes)
    if (remainingSeconds === 600 && totalPlannedSeconds > 1200 && !triggered.includes('10m')) {
      triggered.push('10m');
      notificationEngine.sendReminder(
        '⏱️ 10 Minutes Remaining',
        `Start wrapping up discussions and transitioning to action items.`,
        'info'
      );
      if (settings.sound_enabled) soundEngine.playChime('warning-15m', settings.sound_volume);
    }

    // 3. 5 Minutes Left (for meetings >= 15 minutes)
    if (remainingSeconds === 300 && totalPlannedSeconds >= 900 && !triggered.includes('5m')) {
      triggered.push('5m');
      notificationEngine.sendReminder(
        '⚠️ 5 Minutes Remaining',
        `Time to lock in next steps and assign action owners.`,
        'warning'
      );
      if (settings.sound_enabled) soundEngine.playChime('warning-15m', settings.sound_volume);
    }

    // 4. 2 Minutes Left (Wrap-up checkpoint)
    if (remainingSeconds === 120 && totalPlannedSeconds >= 300 && !triggered.includes('2m')) {
      triggered.push('2m');
      notificationEngine.sendReminder(
        '🎯 2 Minutes Remaining',
        `Final wrap-up. Tap "Wrap-Up" to record takeaways.`,
        'warning'
      );
      if (settings.sound_enabled) soundEngine.playChime('warning-1m', settings.sound_volume);
    }

    // 5. 1 Minute Left
    if (remainingSeconds === 60 && !triggered.includes('1m')) {
      triggered.push('1m');
      notificationEngine.sendReminder(
        '🔔 1 Minute Left',
        `Scheduled meeting time is almost up.`,
        'alert'
      );
      if (settings.sound_enabled) soundEngine.playChime('warning-1m', settings.sound_volume);
    }

    // 6. Overtime Active
    if (costState.isOvertime && !triggered.includes('overtime')) {
      triggered.push('overtime');
      notificationEngine.sendReminder(
        '🚨 Planned Time Reached — Overtime Active',
        `Overtime is currently burning $${activeMeeting.costPerMinute.toFixed(2)} per minute.`,
        'alert'
      );
      if (settings.sound_enabled) soundEngine.playChime('overtime', settings.sound_volume);
    }

    set({
      activeMeeting: {
        ...activeMeeting,
        elapsedSeconds: nextSeconds,
        liveCost: costState.liveCost,
        budgetPercentage: costState.budgetPercentage,
        statusColor: costState.statusColor,
        isOvertime: costState.isOvertime,
        overtimeSeconds: costState.overtimeSeconds,
        overtimeCost: costState.overtimeCost,
        triggeredReminders: triggered,
      },
    });
  },

  pauseMeeting: () => {
    const { activeMeeting } = get();
    if (!activeMeeting) return;
    set({ activeMeeting: { ...activeMeeting, isPaused: true } });
  },

  resumeMeeting: () => {
    const { activeMeeting } = get();
    if (!activeMeeting) return;
    set({ activeMeeting: { ...activeMeeting, isPaused: false } });
  },

  saveWrapUpNotes: (takeaways, action_owner) => {
    const { activeMeeting } = get();
    if (!activeMeeting) return;
    set({
      activeMeeting: {
        ...activeMeeting,
        wrapupNotes: { takeaways, action_owner },
      },
    });
  },

  stopMeeting: () => {
    const { activeMeeting, settings } = get();
    if (!activeMeeting) return;

    if (settings.sound_enabled) {
      soundEngine.playChime('stop', settings.sound_volume);
    }

    const durationMinutes = Math.ceil(activeMeeting.elapsedSeconds / 60);
    const emailScore = calculateEmailScore(
      durationMinutes,
      activeMeeting.plannedMinutes,
      activeMeeting.attendees.length,
      activeMeeting.category,
      null
    );

    const endedAt = new Date().toISOString();

    const meetingRecord: Meeting = {
      id: activeMeeting.id,
      title: activeMeeting.title,
      category: activeMeeting.category,
      planned_minutes: activeMeeting.plannedMinutes,
      started_at: activeMeeting.startedAt,
      ended_at: endedAt,
      attendee_ids: activeMeeting.attendees.map((a) => a.id),
      purpose: activeMeeting.purpose,
      wrapup_notes: activeMeeting.wrapupNotes || null,
      roi_rating: null,
      total_cost: activeMeeting.liveCost,
      overtime_cost: activeMeeting.overtimeCost,
      email_score: emailScore,
      status: 'completed',
    };

    const snapshots: MeetingAttendeeSnapshot[] = activeMeeting.attendees.map((person) => ({
      meeting_id: activeMeeting.id,
      person_id: person.id,
      display_name: person.display_name,
      rate_snapshot: person.base_hourly_rate * settings.overhead_multiplier,
      role_tier_snapshot: person.role_tier,
    }));

    storage.saveMeeting(meetingRecord, snapshots);

    if (!settings.incognito_mode) {
      if (activeMeeting.overtimeCost > 100 || activeMeeting.elapsedSeconds > activeMeeting.plannedMinutes * 60 * 1.3) {
        const flag: AuditFlag = {
          id: `flag_${Date.now()}`,
          meeting_id: activeMeeting.id,
          flag_type: 'OVERTIME_EXCESS',
          detail: `Exceeded planned time by ${Math.round(activeMeeting.overtimeSeconds / 60)}m, burning an extra $${activeMeeting.overtimeCost.toFixed(2)}.`,
          created_at: endedAt,
        };
        storage.addAuditFlag(flag);
      } else if (activeMeeting.category === 'Status Update' && activeMeeting.liveCost > 250) {
        const flag: AuditFlag = {
          id: `flag_${Date.now()}`,
          meeting_id: activeMeeting.id,
          flag_type: 'EXPENSIVE_STATUS',
          detail: `Status update cost $${activeMeeting.liveCost.toFixed(2)}. Consider switching to asynchronous Slack/email updates.`,
          created_at: endedAt,
        };
        storage.addAuditFlag(flag);
      }
    }

    notificationEngine.sendReminder(
      '🏁 Meeting Completed',
      `Total Cost: $${activeMeeting.liveCost.toFixed(2)} (${durationMinutes}m duration).`,
      'success'
    );

    set({
      activeMeeting: null,
      recentCompletedMeeting: meetingRecord,
      meetings: storage.getMeetings(),
      auditFlags: storage.getAuditFlags(),
      currentView: 'summary',
    });
  },

  submitRoiRating: (rating: number) => {
    const { recentCompletedMeeting, settings } = get();
    if (!recentCompletedMeeting) return;

    const updated: Meeting = {
      ...recentCompletedMeeting,
      roi_rating: rating,
    };

    const durationMinutes = Math.ceil(
      (new Date(updated.ended_at!).getTime() - new Date(updated.started_at).getTime()) / 60000
    );
    updated.email_score = calculateEmailScore(
      durationMinutes,
      updated.planned_minutes,
      updated.attendee_ids.length,
      updated.category,
      rating
    );

    storage.saveMeeting(updated);

    if (!settings.incognito_mode && rating <= 2) {
      const flag: AuditFlag = {
        id: `flag_${Date.now()}`,
        meeting_id: updated.id,
        flag_type: 'LOW_ROI',
        detail: `Rated ${rating}/5 stars despite costing $${updated.total_cost.toFixed(2)}. High priority candidate for cancellation or format revamp.`,
        created_at: new Date().toISOString(),
      };
      storage.addAuditFlag(flag);
    }

    set({
      recentCompletedMeeting: updated,
      meetings: storage.getMeetings(),
      auditFlags: storage.getAuditFlags(),
    });
  },

  deleteMeeting: (id: string) => {
    storage.deleteMeeting(id);
    set({
      meetings: storage.getMeetings(),
      auditFlags: storage.getAuditFlags(),
    });
  },
}));
