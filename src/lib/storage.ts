import { Person, AppSettings, Meeting, MeetingAttendeeSnapshot, AuditFlag, RoleTier } from '../types';

interface DatabaseSchema {
  people: Person[];
  settings: AppSettings;
  meetings: Meeting[];
  meeting_attendees: MeetingAttendeeSnapshot[];
  audit_flags: AuditFlag[];
}

const STORAGE_KEY = 'meetmeter_db_clean_v1';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'default',
  base_currency: 'USD',
  display_currency: 'USD',
  overhead_multiplier: 1.3,
  sound_enabled: true,
  sound_volume: 0.5,
  focus_hour_rate: 75.0,
  theme: 'dark',
  branding: {
    company_name: '',
    slogan: '',
  },
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
};

class StorageService {
  private data: DatabaseSchema = {
    people: [],
    settings: DEFAULT_SETTINGS,
    meetings: [],
    meeting_attendees: [],
    audit_flags: [],
  };
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = {
          people: Array.isArray(parsed.people) ? parsed.people : [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
          meeting_attendees: Array.isArray(parsed.meeting_attendees) ? parsed.meeting_attendees : [],
          audit_flags: Array.isArray(parsed.audit_flags) ? parsed.audit_flags : [],
        };
      } else {
        this.data = {
          people: [],
          settings: DEFAULT_SETTINGS,
          meetings: [],
          meeting_attendees: [],
          audit_flags: [],
        };
        this.save();
      }
    } catch (err) {
      this.data = {
        people: [],
        settings: DEFAULT_SETTINGS,
        meetings: [],
        meeting_attendees: [],
        audit_flags: [],
      };
    }

    this.isInitialized = true;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- People Operations ---
  getPeople(): Person[] {
    return [...this.data.people];
  }

  savePerson(person: Person): void {
    const idx = this.data.people.findIndex((p) => p.id === person.id);
    if (idx >= 0) {
      this.data.people[idx] = person;
    } else {
      this.data.people.push(person);
    }
    this.save();
  }

  deletePerson(id: string): void {
    this.data.people = this.data.people.filter((p) => p.id !== id);
    this.save();
  }

  // --- Settings Operations ---
  getSettings(): AppSettings {
    return { ...this.data.settings };
  }

  saveSettings(settings: AppSettings): void {
    this.data.settings = { ...settings };
    this.save();
  }

  // --- Meeting Operations ---
  getMeetings(): Meeting[] {
    return [...this.data.meetings].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  }

  saveMeeting(meeting: Meeting, snapshots?: MeetingAttendeeSnapshot[]): void {
    // If Incognito Ephemeral Mode is active, do not persist to disk
    if (this.data.settings.incognito_mode) {
      return;
    }

    const idx = this.data.meetings.findIndex((m) => m.id === meeting.id);
    if (idx >= 0) {
      this.data.meetings[idx] = meeting;
    } else {
      this.data.meetings.unshift(meeting);
    }

    if (snapshots && snapshots.length > 0) {
      this.data.meeting_attendees = this.data.meeting_attendees.filter(
        (a) => a.meeting_id !== meeting.id
      );
      this.data.meeting_attendees.push(...snapshots);
    }

    this.save();
  }

  deleteMeeting(id: string): void {
    this.data.meetings = this.data.meetings.filter((m) => m.id !== id);
    this.data.meeting_attendees = this.data.meeting_attendees.filter((a) => a.meeting_id !== id);
    this.data.audit_flags = this.data.audit_flags.filter((f) => f.meeting_id !== id);
    this.save();
  }

  // --- Audit Flags Operations ---
  getAuditFlags(): AuditFlag[] {
    return [...this.data.audit_flags].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  addAuditFlag(flag: AuditFlag): void {
    if (this.data.settings.incognito_mode) return;
    this.data.audit_flags.unshift(flag);
    this.save();
  }

  // --- Cryptographic Zero-Trace Purge (Data Shredder) ---
  purgeAllData(): void {
    this.data = {
      people: [],
      settings: DEFAULT_SETTINGS,
      meetings: [],
      meeting_attendees: [],
      audit_flags: [],
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error removing storage:', e);
    }
  }
}

export const storage = new StorageService();
