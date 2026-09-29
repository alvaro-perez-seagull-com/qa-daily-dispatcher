# Seagull QA Daily Dispatcher — Feature Wishlist & Roadmap Backlog

This document tracks prospective feature requests, UX enhancements, and architectural ideas requested by QA engineers, test leads, and cross-functional teams.

---

## 📋 Status Legend
- 💡 **Idea / In Discussion:** Concept proposed; requirements, scope, and technical design under discussion.
- 📐 **Planned / Architecture Spike:** Feature approved in principle; architectural spike or implementation plan pending.
- 🚧 **In Development:** Active development underway.
- ✅ **Completed / Released:** Delivered in a production release.

---

## 🎯 Core User Wishlist Items

### 1. Multi-Epic Support (`💡 Idea / In Discussion`)
* **Problem Statement:** Large initiatives (or QA engineers overseeing multiple feature tracks within the same sprint) often touch 2 or more related Jira Epics (e.g., frontend Forms Designer Epic + backend Print Execution Engine Epic). Currently, Setup strictly accepts one Primary Epic Key.
* **Proposed Concepts:**
  * **Option A (Multi-Tag / Token Input):** Allow comma-separated or tokenized Epic entry (e.g., `BPLAT-20767, BPLAT-21440`). Jira bug filter JQL dynamically combines them (`labels IN (BPLAT-20767, BPLAT-21440)`).
  * **Option B (Multi-Epic Table):** Define an Epics table in Setup with individual Initiative Names and Story Point allocations, auto-summing total Story Points for Defect Density calculations.
  * **Subject Line Impact:** Needs formatting consensus (e.g., `BTC v12.6: [IDEA-3110 / BPLAT-20767, BPLAT-21440] ...` vs. primary epic fallback).
  * **Email "Links" Section Traceability:** When multiple Epics are configured, the generated Outlook email "Links" section must render dedicated links for *all* associated Epics (e.g., `Epic (Frontend): [BPLAT-20767](...)`, `Epic (Backend): [BPLAT-21440](...)`) rather than linking only the primary Epic.

---

### 2. Dashboard Dark Mode Theme (`💡 Idea / In Discussion`)
* **Problem Statement:** Engineers working in low-light environments desire a dark UI theme for the web application dashboard without affecting the generated email preview.
* **Proposed Scope:**
  * **Scope Constraint:** Dark mode strictly applies to the Dispatcher dashboard background, cards, tables, and text (`--bg-app: #121820`, `--bg-card: #1b2430`, `--text-main: #f3f4f6`).
  * **Buttons & Controls:** Retain the signature Seagull deep navy (`#0F4761`) and BarTender Cerulean Cyan (`#068FBE`) hover states for brand harmony.
  * **Email Isolation:** The iframe containing the live Outlook email preview remains 100% standard light mode (`#ffffff` body with `#B3CEFB` headers) to reflect actual Outlook recipient rendering accurately.
  * **Persistence:** Save theme preference (`light` vs. `dark` or `system`) to `localStorage`.

---

### 3. Full Configurable Scorecard Engine & Weight Adjustments (`💡 Idea / In Discussion`)
* **Problem Statement:** Quality scorecard calculations currently utilize Christian Velasco's baseline weights (Primary 50% / Severity 50%, with fixed metric distributions). Different engineering teams or release phases may require tailored weights or threshold band tuning.
* **Proposed Concepts:**
  * **Algorithm Analysis Spike:** Deep-dive Christian Velasco's GitHub repository/engine to catalog all available metric parameters, weights, and edge formulas.
  * **Config Modal / Settings Drawer:** Provide a subtle `"⚙️ Configure Metric Weights"` link next to the Live Score Preview badge.
  * **Configurable Sliders/Inputs:**
    - Primary Metric Weights (Density %, Escape %, Reopen %, S1 SLA %, Avg Resolution %).
    - Severity Multipliers (S1=10, S2=7, S3=4, S4=2, S5=1).
    - Tier Thresholds (Poor <30, Moderate 30–59, Good 60–89, Excellent ≥90).
  * **Quick Preset Switcher:** Include presets (e.g., *"Default Seagull Standard"*, *"Zero-Tolerance S1/S2 Strict"*, *"Post-Release Hardening"*).

---

### 4. Spanish Localization (Bolivia QA Team Support) (`💡 Idea / In Discussion`)
* **Problem Statement:** Ensure QA team members in the Cochabamba, Bolivia office can comfortably navigate and operate the daily dispatch tool in their native Spanish language.
* **Proposed Scope:**
  * **UI Language Toggle:** Simple header toggle (`🇺🇸 EN` | `🇧🇴 ES`) in the top navigation bar.
  * **I18n Translation Dictionary (`js/i18n.js`):** Modular JSON dictionary mapping all UI strings (labels, placeholders, tooltips, validation messages, toast notifications, and modal dialogs).
  * **Email Language Preservation:** By default, generated Outlook email status tables, greetings, and column headers remain in standard English for global corporate distribution, with an optional toggle to generate Spanish status reports if communicating with regional squads.
  * **No Other Languages Needed:** Exclusively scoped to English & Spanish.

---

### 5. Testing Status: Add 'Ready' State (`💡 Idea / In Discussion`)
* **Problem Statement:** In Tab 2 (Test Cycles Summary Table), newly provisioned or staged test cycles that are ready for QA execution but have not yet actively started are currently forced into `-` or `IN PROGRESS`.
* **Proposed Scope:**
  * Add `'Ready'` (or `'READY'`) as a selectable option in the **Testing Status** dropdown across UI rows and MSO email rendering.
  * Ensures alignment with standard QA test cycle lifecycle states: `Ready` &rarr; `IN PROGRESS` &rarr; `COMPLETED` / `BLOCKED`.

---

### 6. Safe Test Cycle Deletion: Confirmation Modal for Populated Rows (`💡 Idea / In Discussion`)
* **Problem Statement:** Clicking the delete (`×`) icon on a test cycle row currently removes it immediately without a prompt. Accidental clicks on populated cycle rows can result in data loss and require re-entry.
* **Proposed Scope:**
  * **Smart Guardrail:** Inspect row state before deletion:
    - If a cycle row has required data populated (non-empty `area`, `readyToTest`, active `testingStatus`, and `testCases > 0`), clicking delete opens a lightweight confirmation dialog: *"Delete Test Cycle '[Area Name]'? This action will remove this cycle and its progress totals."*
    - If a cycle row is blank or newly added without test cases/progress, delete it immediately without prompting (zero friction for quick cleanup).

---

### 7. Split 'Product & Version' into Dedicated Product Dropdown & Version Input (`💡 Idea / In Discussion`)
* **Problem Statement:** Currently, "Product and Version" is a single free-text input (e.g. `BTC v12.6`). Free-text entry can result in typos, inconsistent spacing, or missing `v` prefixes across email subject lines, cycle tables, and Jira filter URLs.
* **Proposed Scope:**
  * **Two Dedicated Controls in Setup:**
    1. **Product Dropdown:** Pre-populated with supported Seagull product suites:
       - `BTC` (BarTender Cloud)
       - `BTO` (BarTender OnPrem)
       - `BTT` (BarTender Track & Trace)
    2. **Version Text Input:** Dedicated field for version entry (placeholder: `e.g. 12.7 or v12.7`).
  * **Smart Version Normalizer:**
    - Automatically normalizes entered versions to canonical `vM.m` (or `vM.m.p`) format.
    - If the user types `12.9`, it auto-prefixes to `v12.9`.
    - If the user types `v12.7`, it preserves `v12.7`.
  * **Harmonized Output:**
    - Seamlessly combines into `<Product> v<M.m>` (e.g., `BTO v12.7`, `BTO v12.9`, `BTC v12.6`, `BTT v1.0`).
    - Propagates automatically to the Email Subject line, Test Cycles summary table column, and Jira filter URL builder.

---

### 8. Project Setup Action Buttons: Visual Harmonization (`💡 Idea / In Discussion`)
* **Problem Statement:** In Tab 1 (Project Setup), the calendar date picker icon button, copy-to-clipboard button, and open Jira filter tab button currently utilize `.btn-input-action` (outline style), which looks visually inconsistent with the polished, solid action buttons in Tab 4 (Live Email Preview).
* **Proposed Scope:**
  * Harmonize the action buttons in Tab 1 (`#btnDatePicker`, `#btnCopyJiraUrl`, `#btnOpenJiraUrl`) with the button styling used in Tab 4 (`.btn.btn-secondary.btn-icon`).
  * Ensure consistent Seagull deep blue fill (`#185FA5`), BarTender cerulean cyan hover state (`#068FBE`), crisp SVG icon sizing, and smooth active/disabled transitions across both tabs.

---

### 9. Live Email Preview Navigation & Action Button Labels (`💡 Idea / In Discussion`)
* **Problem Statement:** In Tab 4 (Live Email Preview), users currently only have a `Copy Email Body` button, `Export Session (.JSON)` button, and `Reset / Clear All` button. There is no rapid navigation control to jump back to Tab 3 (List of Bugs Found) if an edit is needed before sending. Furthermore, the `.JSON` file extension in the button label is redundant and clutters the UI.
* **Proposed Scope:**
  * **"← Back to Bugs" Navigation Link/Button:** Add a navigation button placed first on the left in Tab 4's action toolbar (preceding `Export Session`). Clicking switches the active view directly back to Tab 3 (List of Bugs Found).
  * **Button Label Cleanup:** Change `Export Session (.JSON)` to simply `Export Session`.

---

### 10. Strict Session JSON Import Validation & Label Cleanup (`💡 Idea / In Discussion`)
* **Problem Statement:** Currently, the import button is labeled `Import Session (.json)`. The file picker does not strictly restrict uploads to JSON documents, and the importer accepts any valid JSON structure, risking application state corruption or runtime crashes if an incompatible JSON file is selected.
* **Proposed Scope:**
  * **Button Label Cleanup:** Change `Import Session (.json)` to simply `Import Session`.
  * **File Picker Restriction:** Constrain `<input type="file">` to `accept=".json,application/json"` so the OS file dialog strictly permits `.json` documents.
  * **Strict Schema Validation:**
    - Validate the imported JSON document against the Dispatcher export schema before committing to application state.
    - Check for required schema markers (e.g., `appName === 'Seagull QA Daily Dispatcher'`, valid `schemaVersion`, or presence of required state sections: `introData`, `cycles`, `bugs`, `scorecardParams`).
    - If the uploaded file fails schema verification, reject the import cleanly with a descriptive error message/toast (e.g., *"Invalid Session File: The selected JSON document does not match the Seagull QA Daily Dispatcher schema"*), preserving current session data without corruption.

---

### 11. Bugs Tab: Live Severity Chart Preview (`💡 Idea / In Discussion`)
* **Problem Statement:** In Tab 3 (List of Bugs Found), users can see defect rows and a live score badge, but the visual **Bugs by Severity Chart** is only visible after navigating to Tab 4 (Live Email Preview). QA engineers want immediate visual confirmation of defect severity distribution while actively entering, pasting, or reviewing bugs.
* **Proposed Scope:**
  * Render a live preview card containing the **Bugs by Severity Chart** (Critical, High, Medium, Low breakdown bars) beneath the defect table in Tab 3.
  * Dynamically recalculate and refresh the chart in real time whenever a bug is added, edited, deleted, or imported via TSV, mirroring the existing live scorecard score badge update lifecycle.

---

## 🤖 AI-Generated Recommendations

### 12. Jira Cloud Direct Filter API Sync (OAuth / Personal Access Token)
* **Value:** Eliminates the manual step of opening Jira in another tab, highlighting rows, and pasting clipboard text.
* **Mechanism:** Optional field in Setup to save a Jira PAT or API token. A single **"Fetch Bugs from Jira"** button executes the generated JQL query via Jira REST API (`/rest/api/3/search`) and directly populates the defect table in seconds.

---

### 13. Zephyr Scale Test Cycle Auto-Import
* **Value:** Removes manual cycle data entry for test case counts, pass rates, and execution status.
* **Mechanism:** Given one or more Zephyr Cycle keys (e.g., `BPLAT-R925`, `BPLAT-R926`), fetch cycle metrics (`totalTestCases`, `executionSummaries.PASSED`, `retestCount`) via the Zephyr Scale REST API (`/v2/testcycle/{key}/executions`) and auto-populate Tab 2.

---

### 14. Multi-Channel Export: Slack / Teams / Confluence Markdown
* **Value:** Teams frequently post daily status updates in Slack or Microsoft Teams channels in addition to sending Outlook emails.
* **Mechanism:** Add a **"Copy as Slack/Teams Markdown"** action in Tab 4 that generates clean, bulleted Slack markdown blocks with bold metrics, severity summaries, and status badges ready to paste into chat threads.

---

### 15. Multi-Engineer / Co-Tester Attribution
* **Value:** Complex feature testing is frequently shared between 2 or more QA engineers (e.g., functional tester + automation lead).
* **Mechanism:** Support adding multiple QA Engineer names (e.g., `Alvaro Perez, Catherine Buenafe`) that automatically format into the email greeting, sender signature, and subject metadata without manual edits.

---

### 16. Project Preset Profiles (Saved Workspace Configurations)
* **Value:** QA engineers switching between different projects during the sprint (e.g., BTC Intelligent Forms vs. BTO Licensing vs. Print Service) have to re-enter versions, links, and recipient preferences each time.
* **Mechanism:** Allow users to save named configuration profiles (e.g., `"BTC - Intelligent Forms"`, `"BTO - Licensing Service"`) to switch entire setups with a single click.

---

### 17. Day-over-Day Delta & Trend Indicators (Source Scorecard Feature Parity)
* **Value & Context:** This capability natively exists in Christian Velasco's original scorecard project, tracking day-over-day trajectory and velocity. Incorporating this aligns our email dispatcher directly with the source scoring tool.
* **Mechanism:** Compare current session with yesterday's imported session JSON or local history snapshot to compute and render historical delta badges (e.g., `Score Delta: 85 ↗ 92 (+7 pts)`, `+3 test cases passed`, `-1 defect resolved`).
