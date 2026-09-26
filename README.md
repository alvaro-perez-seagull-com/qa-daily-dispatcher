# Seagull QA Daily Dispatcher

A client-side web application designed for Seagull Software QA teams to automate the generation and copying of rigid, Microsoft Outlook / Word-compliant daily status emails for BarTender Cloud and OnPrem initiatives.

---

## Features

- **Strict Outlook / Word MSO HTML Formatting:** Produces pixel-perfect Word 15 MSO email markup (`xmlns:v`, `xmlns:o`, `xmlns:w`, `mso-yfti-tbllook`, `#B3CEFB` headers, point-based column widths).
- **Automated Quality Scorecard Engine:** Implements Christian Velasco's exact scoring algorithm, computes composite scores, and renders the score badge directly onto an offscreen HTML5 canvas to embed as a base64 image (no manual screenshotting or cropping required).
- **Zero-Defect 100% Quality Score:** Accurately evaluates initiatives with zero defects and valid Story Points to a full 100% composite score (`100 Excellent`) with an emerald green gauge ring.
- **Mandatory Story Points Validation Gate:** Requires Feature Story Points (SP > 0) in Setup before advancing to cycles, preventing downstream metric distortion.
- **Brand-Harmonized BarTender Palette:** Features interactive controls and buttons styled with BarTender File Librarian cerulean cyan (`#068FBE`) and deep navy (`#0F4761`).
- **Dynamic Bugs by Severity Chart:** Auto-aggregates defects from the bug table by severity (SEV 1–SEV 5) and generates an offscreen canvas distribution chart.
- **Auto-Calculated Defect Age:** Automatically computes defect age in days: `(Current Date - Date Created)`.
- **Automatic Summary Calculations:** Computes aggregate test cycle metrics (total test cases, progress, pass rate, and issue counts).
- **One-Click Native Outlook Clipboard Copying:** Uses the modern asynchronous Clipboard API (`new ClipboardItem({ 'text/html': ... })`) so clicking **"Copy Formatted Email"** allows you to press **Cmd+V / Ctrl+V** directly in Outlook with 100% formatting fidelity.
- **Dedicated "Copy Subject Line" Action:** Quickly copies formatted subject lines:
  `BTC v12.6: [IDEA-3110] Intelligent Forms: Refreshable Print Preview - Daily Status - YYYY-MM-DD`
- **Zero Backend Dependencies:** Runs 100% in-browser, fully compatible with GitHub Pages.

---

## Modular File Architecture

```
qa-daily-dispatcher/
├── index.html                 # Main dashboard UI & navigation
├── css/
│   └── styles.css             # Modern dashboard styles & responsive tables
├── js/
│   ├── app.js                 # Application state, UI wiring, and localStorage persistence
│   ├── section-intro.js       # Message headers, To/Cc distribution, and opening sentence
│   ├── section-summary.js     # Test cycle summary table & automatic Total calculation
│   ├── section-bugs-list.js   # List of Bugs Found table with auto-calculated Age
│   ├── section-bugs-chart.js  # Offscreen canvas generator for Bugs by Severity chart
│   ├── section-scorecard.js   # Quality Scorecard scoring engine & offscreen canvas badge
│   ├── section-links.js       # Traceability links (IDEA, Epic, Jira Bug Filter)
│   ├── section-signature.js   # Official Seagull Software email signature block
│   ├── template-mso.js        # Master MSO Word 15 HTML assembler
│   └── clipboard.js           # Multi-MIME HTML clipboard copy handler
└── README.md                  # Documentation & Release Changelog
```

---

## Release History & Changelog

### `0.0.9` — Local Timezone Subject Line Formatting & Session Deserialization
- **Local Browser Timezone Subject Formatting:** Replaced UTC-dependent `new Date().toISOString().split('T')[0]` with `SectionIntro.getLocalIsoDate(data?.sentDate)`. This prevents evening date rollover past 5:00 PM in Western/Pacific timezones (UTC-7) and guarantees that generated subject lines always match the engineer's active calendar day.
- **Wrapped Session State Deserialization:** Enhanced `loadSavedState()` in `app.js` with `if (parsed.state) parsed = parsed.state` to seamlessly parse both raw state and schema-wrapped session JSON files upon page reload.
- **Local Fallback for Defect Timestamps:** Updated default `dateCreated` in `addBugRow()` and `JiraImporter` to format timestamps in local browser time rather than UTC.
- **Asset Cache-Busting:** Bumped script and stylesheet query parameters to `?v=33`.

### `0.0.8` — Zero-Defect 100% Quality Score, Mandatory SP Gate & Brand-Harmonized UI
- **Zero-Defect 100% Score Realization:** Updated `computeQualityScore()` so that projects with zero defects and valid Story Points correctly satisfy turnaround SLA targets (`scoreAvgRes = 100`), generating an authentic composite score of **100 (Excellent)** with an emerald green ring (`#3B6D11` / `#22c55e`).
- **Empty Defect Table Guidance:** Updated empty bug table messaging to celebrate clean quality states and guide users:
  > *"No defects logged yet; the quality score is 100! If you want to add bugs, either paste from JIRA, or click 'add bug' to add them manually."*
- **Mandatory Feature Story Points Validation Gate:** 
  - Integrated Story Points validation (`rawSp !== '' && numSp > 0`) directly into `validateKeyGate()` alongside Jira issue keys.
  - The "Continue to Cycles &rarr;" action button and downstream navigation tabs remain locked until valid Story Points are provided.
  - Added inline field error helper text and contextual toast notifications (`⚠️ Feature Story Points (SP) is required to proceed.`) with automatic field focusing.
  - Preserved clean placeholder state (`—` / `NO SP` with amber indicator ring) upon form reset.
- **Keyboard Tab Order Optimization:** Removed `tabindex="0"` from the Feature Story Points tooltip icon wrapper (`.tooltip-wrapper`), allowing keyboard focus to traverse smoothly from **QA Engineer Name** directly into the **Feature Story Points** input field.
- **Brand-Harmonized Button Hover Styling:** Resolved an issue where blue buttons appeared transparent or white on hover by explicitly styling all `.btn-primary` and `.btn-secondary` hover states with the BarTender File Librarian cyan/cerulean palette (`#068FBE`) and crisp white text (`#ffffff`) across all dashboard tabs and modal dialogs.
- **Canvas Feature Detection:** Added `typeof ctx.roundRect === 'function'` check with a fallback to `ctx.rect` when rendering scorecard badges, preventing runtime exceptions on older browsers or canvas environments lacking native `roundRect` support.
- **Scorecard Metric Documentation:** Documented the architectural rationale behind computing `scoreEscape` with 0.00% weighting in `primaryScore` to mirror the live preview specification while preserving calculations for future full-scorecard expansion.
- **Asset Cache-Busting:** Bumped script and stylesheet query parameters to `?v=32` to guarantee immediate asset delivery and prevent stale browser caching.

### `0.0.7` — Story Points Validation Gate & NaN Turnaround Hardening
- **Story Points Validation Gate:** Gated `computeQualityScore()` in `SectionScorecard` to reject missing, blank, zero, or non-finite inputs without silent default fallbacks.
- **Amber Warning State:** Implemented dedicated amber warning state (`NO SP`, `#f59e0b` gauge) on 2x Retina canvas and MSO HTML preview with descriptive error tooltips.
- **NaN Turnaround Hardening:** Added `Number.isFinite()` validation to `avgRes` calculation and `safeAge` accumulation in `section-bugs-list.js` to prevent false-perfect grade inflation, cleanly rendering `'—'`.
- **Pure Math Engine:** Restored `scoreTier()` to pure mathematical interpolation with documented upstream validation contracts.

### `0.0.6` — Enterprise Input Sanitization, Strict Jira Validation & Filter URL Toolbar
- **Security & Input Sanitization Engine:** Added `sanitizeTextInput()` utility that strips XSS/script vectors (`<script>`, `<iframe>`, `javascript:`, inline event handlers) and neutralizes SQL injection tokens (`--`, `/* */`, `DROP TABLE`, `UNION SELECT`) across all text fields.
- **Strict Jira Key Lockdown:** Enforced regex validation (`/^IDEA-\d+$/i` and `/^BPLAT-\d+$/i`) with inline error helper text to ensure valid Jira issue URLs and distribution headers.
- **Execution Start Date UX:** Implemented numeric-only keydown filtering (`0-9` and `/`) and integrated a native calendar picker button (`showPicker()`).
- **Jira Filter URL Action Toolbar:** Replaced the wide text button with compact dual action icon buttons (Copy to Clipboard and Open Filter in Jira ↗) with dynamic active/disabled state management.

### `0.0.5` — Subject Line Formats, Wide Summary Table & Bottom Bug Action
- **Dynamic Subject Line Formats:** Supported flexible Jira key combinations (`[IDEA-XXXX / BPLAT-YYYY]`, `[IDEA-XXXX]`, or `[BPLAT-YYYY]`) with automatic prefix fallback.
- **Wide Summary Table:** Adjusted test cycle summary table column widths and spacing for improved legibility across email clients.
- **Bottom Action Button:** Added a secondary "Add Bug" action button below the defect table for faster logging workflows.

### `0.0.4` — High-DPI Scorecard Badge & Layout Refinement
- **Retina 2x Resolution:** Upgraded canvas rendering with 2x supersampling (`dpr = 2`) for razor-sharp rendering on high-DPI displays.
- **Layout Refinement:** Cleaned scorecard badge layout by removing mini pillar bars to match Christian Velasco's reference live preview gauge.

### `0.0.3` — Exact 4-Tier QA Scorecard Engine & Unified Table Borders
- **Exact Algorithm Alignment:** Aligned composite scoring engine with Christian Velasco's 4-tier model (Primary 50% / Severity 50%).
- **Configured Threshold Bands:** Updated grade boundaries to Poor (<30), Moderate (30–59), Good (60–89), and Excellent (≥90).
- **Unified Table Borders:** Standardized table borders (`border-collapse: collapse; border: 1pt solid #7F7F7F;`) for Word MSO email compatibility.

### `0.0.2` — Outlook MSO Heading 2 Styles & Decimal Bug Ages
- **Native Word Heading 2 Styles:** Applied explicit inline Word MSO Heading 2 formatting (`15pt Segoe UI`, `#0F4761`, `page-break-after: avoid`) across all section headers.
- **Decimal Bug Age Support:** Added support for fractional defect ages (e.g., `0.8d`) in bug table parsing and display.
- **Subject Line Key Deduplication:** Prevented duplicate Jira keys when identical identifiers were entered in both IDEA and Epic fields.

### `0.0.1` — Initial Release: Seagull QA Daily Dispatcher
- **Core Dispatcher Dashboard:** Client-side status report builder for Seagull QA initiatives.
- **Word/Outlook MSO HTML Generator:** Strict Word 15 MSO email markup assembly.
- **Embedded Quality Scorecard:** Automated composite score computation and offscreen canvas badge generation.
- **Dynamic Severity Chart:** Automatic defect distribution chart rendering.
- **One-Click Clipboard Copying:** Async multi-MIME HTML clipboard copy handler (`text/html`).

---

## 🔮 Roadmap & Future Features

To view upcoming features, architectural spikes, and contribute ideas, check out the [Feature Wishlist & Roadmap Backlog](file:///Users/aperez/SEAGULL/SEA2026-WSQA01/98-Projects/qa-daily-dispatcher/WISHLIST.md).

