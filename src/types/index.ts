export type RoleTier = 'Junior' | 'Mid' | 'Senior' | 'Management' | 'Executive';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'MAD';

export type MeetingCategory = '1-on-1' | 'Status Update' | 'Brainstorm' | 'Decision' | 'Client' | 'Other';

export type PrivacyLevel = 'standard' | 'mask_costs' | 'ghost_mode';

export interface Person {
  id: string;
  display_name: string;
  role_tier: RoleTier;
  base_hourly_rate: number;
  is_opted_in: boolean; // privacy opt-in for personal stats
  created_at?: string;
}

export interface AppSettings {
  id: string;
  base_currency: CurrencyCode;
  display_currency: CurrencyCode;
  overhead_multiplier: number; // default 1.3
  sound_enabled: boolean;
  sound_volume: number; // 0 to 1
  focus_hour_rate: number; // cost per focus hour (e.g. 75)
  theme: string;
  branding: {
    company_name?: string;
    brand_color?: string;
    slogan?: string;
    logo_url?: string;
  };
  tier_rates: Record<RoleTier, number>;
  // Advanced Privacy Controls
  privacy_level: PrivacyLevel;
  auto_mask_on_blur: boolean; // Auto-mask when switching away from window
  incognito_mode: boolean; // Ephemeral RAM-only meeting (never saved to disk)
}

export interface Meeting {
  id: string;
  title: string;
  category: MeetingCategory;
  planned_minutes: number;
  started_at: string;
  ended_at: string | null;
  attendee_ids: string[]; // JSON array of person IDs
  purpose: string;
  wrapup_notes: {
    takeaways?: string[];
    action_owner?: string;
  } | null;
  roi_rating: number | null; // 1-5 stars
  total_cost: number;
  overtime_cost?: number;
  email_score?: number; // "Could have been an email" score 0-100%
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface MeetingAttendeeSnapshot {
  meeting_id: string;
  person_id: string;
  display_name: string;
  rate_snapshot: number;
  role_tier_snapshot: RoleTier;
}

export interface AuditFlag {
  id: string;
  meeting_id: string;
  flag_type: 'OVERTIME_EXCESS' | 'LOW_ROI' | 'EXPENSIVE_STATUS' | 'TOO_MANY_ATTENDEES';
  detail: string;
  created_at: string;
}

export type OpportunityMetric = 'money' | 'focus_hours' | 'support_hours' | 'coffees';

export type DisplayMode = 'full' | 'compact' | 'tray';
