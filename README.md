# MeetMeter

> **Privacy-First Real-Time Meeting Cost Clock & Executive Labor Audit Tool**

MeetMeter tracks the actual financial and opportunity cost of organizational meetings in real time, converting meeting waste into an ambient, visible, and actionable metric.

---

## Key Capabilities

### 1. Privacy-First Compensation Engine
* **Zero Salary Exposure**: Exact individual compensation is never stored, tracked, or displayed.
* **Seniority Role Brackets**: Attendees map to standardized role tiers (`Junior`, `Mid`, `Senior`, `Management`, `Executive`) with customizable base rates.
* **Loaded Overhead Multiplier**: Configurable multiplier (default `1.3x`) automatically accounts for healthcare, payroll taxes, benefits, and equipment overhead.

### 2. Live Meeting Instrument
* **Tabular Monospace Counter**: Real-time labor expenditure updated continuously per second with sub-cent precision.
* **Budget Progress Meter**: Color states marking budget health:
  * 🟢 **Green**: Under 50% of planned budget
  * 🟡 **Amber**: 50% to 100% of planned budget
  * 🔴 **Red**: Over 100% (Overtime active)
* **Overtime Warning**: Live overrun readout indicating exact cost-per-minute during overtime.
* **Opportunity Metric Toggle**: Instant conversion from monetary cost into *Engineering Focus Capacity* or *Operations Capacity*.
* **Compact Pill & Instrument Modes**: Toggle between a minimalist draggable floating pill and the full workspace instrument.

### 3. Screen-Share Protection Suite
* **Level 1 (Standard)**: Role-tier masking.
* **Level 2 (Confidential Cost Mask)**: Replaces all financial figures with `•••` via hotkey (`Ctrl+Shift+H` / `Cmd+Shift+H`).
* **Level 3 (Stealth Mode)**: Anonymizes attendee rosters and masks meeting titles (`Ctrl+Shift+G` / `Cmd+Shift+G`).
* **Auto-Mask on Window Unfocus**: Automatically engages the privacy mask whenever the window loses focus.
* **RAM-Only Incognito Sessions**: Ephemeral mode where sessions and audit logs are never committed to disk.

### 4. Rational Milestone Reminders
Non-intrusive dual-channel alerts (Native OS Notifications + In-App Toasts) at key meeting checkpoints:
* **Halfway Checkpoint**: Prompt when 50% of scheduled time has elapsed.
* **10 Minutes Remaining**: Transition notice to begin decision-making.
* **5 Minutes Remaining**: Reminder to establish next steps and assign ownership.
* **2 Minutes Remaining**: Wrap-up checkpoint to record action items.
* **1 Minute Remaining**: Closing notice before schedule expiry.
* **Overtime Alert**: Active notification indicating budget overrun and per-minute burn rate.

### 5. Wrap-Up & Post-Meeting Audit
* **Outcomes & Action Items**: Capture key takeaways and assign the primary action owner before stopping the clock.
* **Asynchronous Feasibility Index**: Dynamic algorithm (0–100%) diagnosing whether the meeting could have been handled asynchronously via memo or digest.
* **5-Second Value Assessment**: 1–5 star rating to audit session leverage.

### 6. Executive Dashboard & Reporting
* **Spend Analytics**: Cumulative meeting expenditure, average cost per session, and overtime overrun metrics.
* **Format Distribution**: Breakdown across meeting types (*Status Update*, *Decision*, *Brainstorm*, *1-on-1*, *Client*).
* **Audit & Optimization Flags**: Automated detection for chronic overtime or expensive status meetings.
* **One-Click CSV Export**: Download complete session history for finance and ops reporting.

---

## Performance & Scalability Benchmarks

| Benchmark Suite | Volume | Throughput | Avg Latency | Precision Drift |
| :--- | :--- | :--- | :--- | :--- |
| **Real-Time Cost Tick Engine** | 1,000,000 ticks | **36.37M ops/sec** | 0.027 µs | 0.00% (Bit-exact) |
| **10,000-Attendee All-Hands** | 50,000 passes | **3.71M ops/sec** | 0.269 µs | 0.00% |
| **Database Aggregation** | 10,000 records | **60.9K ops/sec** | 16.41 µs | 0.00% |
| **Multi-Currency & Mask Engine**| 500,000 ops | **33.0K ops/sec** | 30.28 µs | 0.00% (Zero Leaks) |
| **Milestone Alert Integrity** | 21,000,000 ticks | **112.0M ops/sec** | 0.009 µs | 0.00% Duplicates |

---

## Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Python**: v3.8+ (optional, for desktop launcher GUI — Python 3.14+ fully supported)

---

### Option 1: Desktop Launcher GUI (Recommended)

Launch the desktop control panel:

```bash
python launcher.py
```

* Click **Start Server** to boot the local runtime:
  * **Auto-Dependency Management**: Detects if `node_modules` is missing and automatically runs `npm install`.
  * **Live Readiness Detection**: Actively probes local HTTP endpoints and parses dev logs rather than relying on arbitrary startup delays.
  * **Dynamic Port Allocation**: Automatically tracks and connects to the active Vite port if 5173 is occupied.
  * **Thread-Safe Architecture**: Fully compatible with Python 3.8 through 3.14+ via decoupled UI event queues.
* Click **Open in Browser** to navigate directly to the active server endpoint.
* Click **Stop Server** to cleanly terminate the runtime process tree.

---

### Option 2: Command Line (NPM)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build optimized production bundle
npm run build
```

Then open `http://localhost:5173` in your browser.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Shift + H` / `Cmd + Shift + H` | Toggle Confidential Cost Mask (`•••`) |
| `Ctrl + Shift + G` / `Cmd + Shift + G` | Toggle Full Stealth Mode (Anonymize names/titles) |
| `Escape` | Quick Emergency Privacy Hide |

---

## Data Architecture & Privacy Guarantee
* **Local-Only**: 100% offline local SQLite storage.
* **No Telemetry**: Zero external tracking, zero analytics beacons, zero cloud dependencies.
* **Cryptographic Data Shredder**: Instant zero-trace purge available in System Preferences.

---

## Author

* **Jalal Kouaki** — [jalalkouaki@outlook.com](mailto:jalalkouaki@outlook.com)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Jalal Kouaki.
