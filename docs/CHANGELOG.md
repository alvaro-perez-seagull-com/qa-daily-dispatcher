# Seagull QA Daily Dispatcher — Complete Release Changelog

This document contains the complete historical log of all releases, architectural enhancements, fixes, and updates for the Seagull QA Daily Dispatcher.

---

## Release History

### `0.0.11` — Strict JSON Import Validation, Navigation Polish & Defect Chart Subtitle
- **Strict Session JSON Import Validation & Diagnostics (Wishlist Item 10):**
  - **OS-Level File Dialog Filter:** Strict `accept=".json,application/json"` attribute on session file input.
  - **Extension & MIME Guard:** Validates file extension before FileReader execution, rejecting non-JSON documents (`.yaml`, `.csv`, `.txt`) with zero runtime errors.
  - **Schema Verification Engine (`validateSessionSchema`):** Enforces Dispatcher session structure (`appName === 'Seagull QA Daily Dispatcher'` or `introData`, `cycles`, `bugs`).
  - **Actionable Diagnostic Messages:** Specifically detects root JSON arrays (e.g. `DS1.json` database/data source tables) and surfaces clear feedback distinguishing tabular record arrays from structured Dispatcher sessions.
  - **State Protection & Ergonomics:** Leaves active application state 100% untouched upon rejection, surfaces descriptive error alerts and red toast notifications, and resets input value for immediate re-selection without page reload.
- **Defect Distribution Chart Subtitle Correction (Wishlist Item 12):**
  - Updated canvas subtitle rendering in `SectionBugsChart` from `"Total Active Defects: ${totalBugs}"` to `"Total Defects: ${totalBugs}"` to accurately reflect total logged defects (active, resolved, or closed).
- **Tab 4 Live Email Preview Navigation & Action Button Labels (Wishlist Item 9):**
  - Added standard **"← Back to Bugs"** button on the bottom-left of Tab 4's action toolbar (`onclick="switchTab('bugs')"`).
  - Cleaned up export action button label to simply **"Export Session"**.
  - Organized bottom actions into a clear left group (`[ ← Back to Bugs ]`, `[ Export Session ]`) and right group (`[ Copy Formatted Email ]`).
- **Header Score Gauge Optimization:**
  - Expanded circular container diameter from 46px to 52px and refined label typography (7.5px bold) so 100 / "Excellent" status renders cleanly without intersecting the circular boundary ring.
- **Generic Brand Subtitle Harmonization:**
  - Generalized brand sub-header to `"Automated Outlook Daily Status Generator"` across `index.html` and `README.md`, removing product-specific references to neutrally accommodate BarTender Track & Trace (BTT) teams alongside BTC and BTO initiatives.
- **Documentation Restructuring:**
  - Archived complete release history in `docs/CHANGELOG.md` and maintained rolling 5-release window in `README.md`.

### `0.0.10` — Stale Date Warning UI, Test Cycle READY State & Setup Action Button Harmonization
- **Stale Session Date Warning Banner & 1-Click Refresh:**
  - Auto-detects outdated session dates on session import (`importedDate !== today`).
  - Displays a high-visibility warning banner in Tab 4 (`#preview-stale-date-banner`) and outlines the subject input in warning red (`.subject-stale-warning`).
  - Added a 1-click **"Refresh Preview"** action button that automatically updates the session date to today's local date, regenerates subject lines and message headers, dismisses the warning banner, and persists the state.
  - Normalized ISO string deserialization in `SectionBugsList.calculateAge()` to prevent `referenceDate.getTime is not a function` runtime errors when loading serialized dates.
- **Native OS File Dialog Activation:**
  - Replaced JavaScript-mediated button clicks on hidden file inputs with a semantic `<label for="session-file-input" class="btn btn-secondary">` and an off-screen clipped file input (`width: 0.1px`, `height: 0.1px`, `opacity: 0`).
  - Guarantees immediate, native OS file chooser activation across all desktop browsers (Chrome, Safari, Firefox, Edge).
- **Test Cycles 'READY' Testing Status:**
  - Added `READY` as a first-class status option in Tab 2's Test Cycles Summary table dropdown.
  - Automatically renders centered `READY` status text in the generated Outlook MSO HTML summary table.
- **Project Setup Action Buttons Visual Harmonization:**
  - Harmonized Tab 1 action buttons (`#btn-date-picker`, `#btn-copy-filter-url`, `#btn-open-filter-url`) with Tab 4's solid blue button design system (`.btn.btn-secondary.btn-icon`).
  - Standardized on Seagull deep blue fill (`#185FA5`), BarTender cerulean cyan hover (`#068FBE`), 36x36px square footprint, and crisp white SVG icons.
  - Synchronized `:disabled` states with `opacity: 0.45` and `pointer-events: none` using standard CSS `:disabled` pseudo-class and `toggleAttribute('disabled')`.
- **Local Testing Sandbox & Ignore Protocol:**
  - Added `.gitignore` to strictly exclude the local `testing/` workspace folder from git commits.
- **Asset Cache-Busting:**
  - Bumped script and stylesheet query parameters to `?v=38` for immediate cache invalidation.

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
