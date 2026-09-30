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
- **Spanish Multi-Locale Localization (`en`, `es-MX`, `es-BO`):** Native Spanish interface support for Latin American and Bolivian QA squads with regional nuances, in-place reactive translation without form data loss, and an on-demand Tab 4 Email Language Toggle (`EN` | `ES`) while strictly maintaining `YYYY-MM-DD` subject dates.
- **Dedicated "Copy Subject Line" Action:** Quickly copies formatted subject lines:
  `BTC v12.6: [IDEA-3110] Intelligent Forms: Refreshable Print Preview - Daily Status - YYYY-MM-DD`
- **Zero Backend Dependencies:** Runs 100% in-browser, fully compatible with GitHub Pages.

---

## Modular File Architecture

```
├── docs/
│   └── CHANGELOG.md           # Complete historical release changelog
├── index.html                 # Main dashboard UI & navigation
├── css/
│   └── styles.css             # Modern dashboard styles & responsive tables
├── js/
│   ├── app.js                 # Application state, UI wiring, and localStorage persistence
│   ├── i18n.js                # Internationalization (i18n) translation engine (en, es-MX, es-BO)
│   ├── section-intro.js       # Message headers, To/Cc distribution, and opening sentence
│   ├── section-summary.js     # Test cycle summary table & automatic Total calculation
│   ├── section-bugs-list.js   # List of Bugs Found table with auto-calculated Age
│   ├── section-bugs-chart.js  # Offscreen canvas generator for Bugs by Severity chart
│   ├── section-scorecard.js   # Quality Scorecard scoring engine & offscreen canvas badge
│   ├── section-links.js       # Traceability links (IDEA, Epic, Jira Bug Filter)
│   ├── section-signature.js   # Official Seagull Software email signature block
│   ├── template-mso.js        # Master MSO Word 15 HTML assembler
│   ├── clipboard.js           # Multi-MIME HTML clipboard copy handler
│   └── jira-importer.js       # Clipboard & TSV Jira defect ingestion parser
├── tests/
│   ├── test-localization.mjs  # Automated Playwright test suite for Spanish localization
│   ├── test-json-import-validation.mjs # Strict JSON session validation tests
│   └── fixtures/              # Test session files (.json, .yaml, .csv, DS1.json)
├── WISHLIST.md                # Feature wishlist & roadmap backlog
└── README.md                  # Project overview & latest release notes
```

---

## Release History & Changelog

### `0.0.12` — Spanish Multi-Locale Localization (`en`, `es-MX`, `es-BO`) & Tab 4 Email Language Toggle
- **Multi-Locale Spanish Support (`en`, `es-MX`, `es-BO`):**
  - Added header language selector dropdown (`🇺🇸 EN`, `🇲🇽 ES-MX`, `🇧🇴 ES-BO`) positioned beside the application title.
  - Comprehensive modular dictionary mappings in `js/i18n.js` covering setup forms, test cycles, defects, live previews, buttons, tooltips, toasts, and modal dialogs.
  - Accommodated regional Latin American QA nuances (Mexico vs. Bolivia).
- **In-Place Reactive DOM Translation (Zero Data Loss):**
  - Translates text content, placeholders, and tooltips in-place without rebuilding form inputs, preserving typed values, cursor focus, and unsaved state.
  - Persists language preference to `localStorage` (`seagull_qa_lang`) and infers preferred dialect via `navigator.language` on first visit.
- **Tab 4 Email Language Toggle (`EN` | `ES`):**
  - Generated Outlook emails remain standard English by default for corporate distribution.
  - Added on-demand email toggle pill (`[ Email Language: 🇺🇸 EN | 🇪🇸 ES ]`) inside Tab 4's preview toolbar.
  - Translates greetings (`Hola a todos,`), placeholder text, section headings, and table column headers.
  - **Subject Line Date Lockdown:** Strictly enforces that the email subject line date format remains locked to `YYYY-MM-DD` (e.g., `BTC v12.6: [IDEA-3110] - BPLAT-20767 - Feature Name - Daily Status - YYYY-MM-DD`).

### `0.0.11` — Defect Chart Subtitle, Tab 4 Back Navigation & Strict JSON Import Validation
- **Defect Distribution Chart Subtitle (Wishlist Item 12):**
  - Replaced misleading percentage subtitle with accurate total defect count (e.g. *"Total Defects: 2"*).
- **Tab 4 "← Back to Bugs" Navigation Button (Wishlist Item 9):**
  - Added back button on the bottom left of Tab 4 to streamline navigation back to the bug list before copying.
- **Strict Session JSON Import Validation (Wishlist Item 10):**
  - Client-side extension/MIME guard blocking non-JSON (`.yaml`, `.csv`, `.txt`) before FileReader.
  - `validateSessionSchema()` checking root object and Dispatcher markers with explicit diagnosis distinguishing JSON arrays from session objects.
- **Header Score Gauge Optimization:**
  - Expanded gauge diameter to 52px with 7.5px bold font to prevent status text clipping in Safari/WebKit.

### `0.0.10` — Stale Date Warning UI, Test Cycle READY State & Setup Action Button Harmonization
- **Stale Session Date Warning Banner & 1-Click Refresh:** Auto-detects outdated session dates on session import, displays warning banner, and updates session date to today's local date with 1 click.
- **Native OS File Dialog Activation:** Replaced JavaScript-mediated button clicks on hidden file inputs with a semantic `<label for="session-file-input">` for instant OS file chooser activation across all desktop browsers.
- **Test Cycles 'READY' Testing Status:** Added `READY` as a first-class status option in Tab 2 dropdown and generated Outlook MSO HTML.
- **Project Setup Action Buttons Visual Harmonization:** Standardized action buttons on Seagull deep blue fill (`#185FA5`), BarTender cerulean cyan hover (`#068FBE`), 36x36px footprint, and white SVG icons.

### `0.0.9` — Local Timezone Subject Line Formatting & Session Deserialization
- **Local Browser Timezone Subject Formatting:** Replaced UTC-dependent date formatting with `SectionIntro.getLocalIsoDate()` to guarantee subject lines always match the engineer's active calendar day.
- **Wrapped Session State Deserialization:** Enhanced `loadSavedState()` to seamlessly parse both raw state and schema-wrapped session JSON files upon reload.
- **Local Fallback for Defect Timestamps:** Formats default `dateCreated` timestamps in local browser time.

### `0.0.8` — Zero-Defect 100% Quality Score, Mandatory SP Gate & Brand-Harmonized UI
- **Zero-Defect 100% Score Realization:** Updated `computeQualityScore()` so that projects with zero defects and valid Story Points achieve an authentic composite score of **100 (Excellent)** with an emerald green ring.
- **Mandatory Feature Story Points Validation Gate:** Gated `validateKeyGate()` to require Story Points before advancing, preventing downstream metric distortion.
- **Brand-Harmonized Button Hover Styling:** Styled all button hover states with BarTender File Librarian cyan/cerulean palette (`#068FBE`).

> 📜 **Complete Historical Changelog:** For older releases (`0.0.1` through `0.0.7`) and full version archives, see [docs/CHANGELOG.md](docs/CHANGELOG.md).

---

## 🔮 Roadmap & Future Features

To view upcoming features, architectural spikes, and contribute ideas, check out the [Feature Wishlist & Roadmap Backlog](WISHLIST.md).

