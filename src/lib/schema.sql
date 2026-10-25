-- MeetMeter SQLite Schema & Initial Migrations
-- Privacy-first meeting cost tracking

CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    role_tier TEXT NOT NULL CHECK(role_tier IN ('Junior', 'Mid', 'Senior', 'Management', 'Executive')),
    base_hourly_rate REAL NOT NULL,
    is_opted_in INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    base_currency TEXT NOT NULL DEFAULT 'USD',
    display_currency TEXT NOT NULL DEFAULT 'USD',
    overhead_multiplier REAL NOT NULL DEFAULT 1.3,
    sound_enabled INTEGER NOT NULL DEFAULT 0,
    sound_volume REAL NOT NULL DEFAULT 0.5,
    focus_hour_rate REAL NOT NULL DEFAULT 75.0,
    theme TEXT NOT NULL DEFAULT 'dark',
    branding TEXT NOT NULL DEFAULT '{}',
    tier_rates TEXT NOT NULL DEFAULT '{"Junior":35,"Mid":55,"Senior":85,"Management":115,"Executive":165}'
);

CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Status Update',
    planned_minutes INTEGER NOT NULL DEFAULT 30,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    attendee_ids TEXT NOT NULL, -- JSON array of Person IDs
    purpose TEXT DEFAULT '',
    wrapup_notes TEXT,          -- JSON object { takeaways: [], action_owner: "" }
    roi_rating INTEGER,         -- 1-5
    total_cost REAL NOT NULL DEFAULT 0.0,
    overtime_cost REAL NOT NULL DEFAULT 0.0,
    email_score REAL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS meeting_attendees (
    meeting_id TEXT NOT NULL,
    person_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    rate_snapshot REAL NOT NULL,
    role_tier_snapshot TEXT NOT NULL,
    PRIMARY KEY (meeting_id, person_id),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_flags (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    flag_type TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Indexes for lightning fast analytics aggregation
CREATE INDEX IF NOT EXISTS idx_meetings_started_at ON meetings(started_at);
CREATE INDEX IF NOT EXISTS idx_meetings_category ON meetings(category);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_audit_flags_meeting ON audit_flags(meeting_id);
