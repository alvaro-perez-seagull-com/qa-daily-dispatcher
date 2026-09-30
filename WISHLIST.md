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
* **Agreed Interaction Specification (Chip / Token Multi-Input):**
  1. **Tokenization on Completion:** When a user types a complete Epic key (e.g., `BPLAT-100`), entering a **Space** or **Comma** (or pressing **Enter**) converts the key into an inline chip/token badge within the input container.
  2. **Subsequent Keys:** The user can continue typing additional Epic keys (e.g., `BPLAT-101`), each converting to its own chip/token in sequence.
  3. **Chip Removal Button:** Each chip appears with a remove button (e.g., `[ [×] BPLAT-100 ]`) allowing the user to delete/remove individual tokens with a single click.
  4. **Keyboard Deletion (Backspace):** When the text cursor is in an empty state within the input, pressing **Backspace / Delete** removes the preceding chip.
  5. **Dynamic Filter URL Generation:** The Jira bug filter JQL dynamically combines all tokenized Epics into the label clause (e.g., `labels IN (BPLAT-100, BPLAT-101)`). If only one Epic is entered, it generates standard single-label JQL as before.
  6. **Email "Links" & Subject Traceability:**
     - The generated Outlook email "Links" section renders direct browse links for *all* active Epics individually (e.g., `Epic (BPLAT-100): [BPLAT-100](...)`, `Epic (BPLAT-101): [BPLAT-101](...)`).
     - The **Jira - List of Bugs** link uses the exact unified multi-epic filter URL generated in Section 1.
     - **Subject Line Formatting (Pending QA Lead Approval):** Format consensus is pending formal approval from QA Leads. Current working recommendation is forward-slash separation (e.g., `BTC v12.6: [IDEA-3110 / BPLAT-20766/BPLAT-20767] - ...` or `BTC v12.6: [BPLAT-20766/BPLAT-20767] - ...`).
  7. **Unified Defect Ingestion & Severity Chart:**
     - Because the generated filter URL searches across all configured Epics (`labels IN (BPLAT-100, BPLAT-101)`), defect imports/pastes in Tab 3 (List of Bugs Found) automatically aggregate defects across all associated Epics.
     - The **Bugs by Severity Chart** and **Defect Distribution Table** in Tab 4 (Live Email Preview) automatically reflect the combined defect metrics across all Epics.
  8. **Quality Scorecard & Defect Density:**
     - The Quality Scorecard calculation organically evaluates total defects across all Epics against total feature Story Points, ensuring accurate composite scoring and SLA adherence.
  9. **Session Import Forward-Compatibility & Dynamic Subject Refresh:**
     - If a user imports an older single-epic session JSON and subsequently adds a second Epic in Setup, the Live Preview engine must dynamically re-evaluate the Subject line rather than retaining the stale imported single-epic string.

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

### 4. Spanish Multi-Locale Localization (`📐 Shelved in Branch: feature/spanish-localization`)
* **Problem Statement:** Ensure QA team members across regional engineering hubs (including Cochabamba, Bolivia and Latin America) can comfortably navigate and operate the daily dispatch tool in their native Spanish language.
* **Status Note:** Fully implemented, verified via Playwright, and shelved in feature branch `feature/spanish-localization` for future rollout.
* **Proposed Scope:**
  * **UI Language Toggle:** Simple header toggle (`🇺🇸 EN` | `🇧🇴 ES`) in the top navigation bar.
  * **I18n Translation Dictionary (`js/i18n.js`):** Modular JSON dictionary mapping all UI strings (labels, placeholders, tooltips, validation messages, toast notifications, and modal dialogs).
  * **Email Language Preservation:** By default, generated Outlook email status tables, greetings, and column headers remain in standard English for global corporate distribution, with an optional toggle to generate Spanish status reports if communicating with regional squads.
  * **No Other Languages Needed:** Exclusively scoped to English & Spanish.

---

### 5. Testing Status: Add 'Ready' State (`✅ Completed / Released`)
* **Problem Statement:** In Tab 2 (Test Cycles Summary Table), newly provisioned or staged test cycles that are ready for QA execution but have not yet actively started were forced into `-` or `IN PROGRESS`.
* **Delivered Scope:**
  * Added `'READY'` as a selectable option in the **Testing Status** dropdown across UI rows and MSO email rendering.
  * Ensures alignment with standard QA test cycle lifecycle states: `READY` &rarr; `IN PROGRESS` &rarr; `COMPLETED` / `BLOCKED`.

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

### 8. Project Setup Action Buttons: Visual Harmonization (`✅ Completed / Released`)
* **Problem Statement:** In Tab 1 (Project Setup), the calendar date picker icon button, copy-to-clipboard button, and open Jira filter tab button previously utilized `.btn-input-action` (outline style), which looked visually inconsistent with the polished, solid action buttons in Tab 4 (Live Email Preview).
* **Delivered Solution:**
  * Harmonized the action buttons in Tab 1 (`#btn-date-picker`, `#btn-copy-filter-url`, `#btn-open-filter-url`) with the solid blue button design system used in Tab 4 (`.btn.btn-secondary.btn-icon`).
  * Enforced consistent Seagull deep blue fill (`#185FA5`), BarTender cerulean cyan hover state (`#068FBE`), crisp SVG icon sizing, and smooth active/disabled transitions across all tabs.

---

### 9. Live Email Preview Navigation & Action Button Labels (`✅ Completed / Released`)
* **Problem Statement:** In Tab 4 (Live Email Preview), users previously had no rapid navigation control to jump back to Tab 3 (List of Bugs Found) if a defect edit was needed before sending. Furthermore, the `.JSON` file extension in the button label was redundant.
* **Delivered Solution:**
  * Added a standard **"← Back to Bugs"** button on the bottom-left of Tab 4's action toolbar (`onclick="switchTab('bugs')"`).
  * Cleaned up the export action button label to simply **"Export Session"**.
  * Organized bottom actions into a clear left group (`[ ← Back to Bugs ]`, `[ Export Session ]`) and right group (`[ Copy Formatted Email ]`).

---

### 10. Strict Session JSON Import Validation & Label Cleanup (`✅ Completed / Released`)
* **Problem Statement:** Previously, the file picker did not strictly restrict uploads to JSON documents, and the importer accepted any valid JSON structure, risking application state corruption or runtime crashes if an incompatible JSON file was selected.
* **Delivered Solution:**
  * **Clean Button Label:** Harmonized import button label to **"Import Session"** across UI and accessible tooltips.
  * **Strict OS-Level File Picker Filter:** Configured `<input type="file" id="session-file-input">` with `accept=".json,application/json"`.
  * **Client-Side Extension & MIME Guard:** Added instant check in `handleSessionFileSelected` verifying `file.name.toLowerCase().endsWith('.json')`, rejecting non-JSON documents (e.g., YAML, CSV, TXT) before file parsing.
  * **Strict Schema Verification Engine (`validateSessionSchema`):**
    - Verifies root document is a non-null JSON object.
    - Enforces Seagull QA Daily Dispatcher signature (`appName === 'Seagull QA Daily Dispatcher'`) or full valid structural markers (`introData`, `cycles` array, `bugs` array).
    - Rejects incompatible or arbitrary JSON payloads (e.g., `package.json`, cloud configs, raw API responses) cleanly without touching active application state.
  * **Safe Error Feedback & State Rollback:** Surfaces descriptive error messages in a styled red error toast (`.toast.toast-error`) and alert dialog, keeping active state 100% intact upon rejection.
  * **Immediate Re-selection Ergonomics:** Resets file input value (`event.target.value = ''`) upon completion or rejection, permitting instant re-selection of the same or corrected file without page reloads.

---

### 11. Bugs Tab: Live Severity Chart Preview (`💡 Idea / In Discussion`)
* **Problem Statement:** In Tab 3 (List of Bugs Found), users can see defect rows and a live score badge, but the visual **Bugs by Severity Chart** is only visible after navigating to Tab 4 (Live Email Preview). QA engineers want immediate visual confirmation of defect severity distribution while actively entering, pasting, or reviewing bugs.
* **Proposed Scope:**
  * Render a live preview card containing the **Bugs by Severity Chart** (Critical, High, Medium, Low breakdown bars) beneath the defect table in Tab 3.
  * Dynamically recalculate and refresh the chart in real time whenever a bug is added, edited, deleted, or imported via TSV, mirroring the existing live scorecard score badge update lifecycle.

---

### 12. Bugs Severity Chart Subtitle: Rename 'Total Active Defects' to 'Total Defects' (`✅ Completed / Released`)
* **Problem Statement:** In the Bugs by Severity chart generated on offscreen canvas (`SectionBugsChart`), the subtitle previously read `"Total Active Defects: X"`. However, if defects logged in the table are Resolved or Closed, they are no longer "active", making the label technically inaccurate.
* **Delivered Solution:**
  * Updated canvas subtitle rendering in `SectionBugsChart.generateChartImage()` from `"Total Active Defects: ${totalBugs}"` to `"Total Defects: ${totalBugs}"`.
  * Guarantees that the chart subtitle reflects total logged defects (active, resolved, or closed) consistently with the defect table.

---

## 🤖 AI-Generated Recommendations

### 13. Jira Cloud Direct Filter API Sync (OAuth / Personal Access Token)
* **Value:** Eliminates the manual step of opening Jira in another tab, highlighting rows, and pasting clipboard text.
* **Mechanism:** Optional field in Setup to save a Jira PAT or API token. A single **"Fetch Bugs from Jira"** button executes the generated JQL query via Jira REST API (`/rest/api/3/search`) and directly populates the defect table in seconds.

---

### 14. Zephyr Scale Test Cycle Auto-Import
* **Value:** Removes manual cycle data entry for test case counts, pass rates, and execution status.
* **Mechanism:** Given one or more Zephyr Cycle keys (e.g., `BPLAT-R925`, `BPLAT-R926`), fetch cycle metrics (`totalTestCases`, `executionSummaries.PASSED`, `retestCount`) via the Zephyr Scale REST API (`/v2/testcycle/{key}/executions`) and auto-populate Tab 2.

---

### 15. Multi-Channel Export: Slack / Teams / Confluence Markdown
* **Value:** Teams frequently post daily status updates in Slack or Microsoft Teams channels in addition to sending Outlook emails.
* **Mechanism:** Add a **"Copy as Slack/Teams Markdown"** action in Tab 4 that generates clean, bulleted Slack markdown blocks with bold metrics, severity summaries, and status badges ready to paste into chat threads.

---

### 16. Multi-Engineer / Co-Tester Attribution
* **Value:** Complex feature testing is frequently shared between 2 or more QA engineers (e.g., functional tester + automation lead).
* **Mechanism:** Support adding multiple QA Engineer names (e.g., `Alvaro Perez, Catherine Buenafe`) that automatically format into the email greeting, sender signature, and subject metadata without manual edits.

---

### 17. Project Preset Profiles (Saved Workspace Configurations)
* **Value:** QA engineers switching between different projects during the sprint (e.g., BTC Intelligent Forms vs. BTO Licensing vs. Print Service) have to re-enter versions, links, and recipient preferences each time.
* **Mechanism:** Allow users to save named configuration profiles (e.g., `"BTC - Intelligent Forms"`, `"BTO - Licensing Service"`) to switch entire setups with a single click.

---

### 18. Day-over-Day Delta & Trend Indicators (Source Scorecard Feature Parity)
* **Value & Context:** This capability natively exists in Christian Velasco's original scorecard project, tracking day-over-day trajectory and velocity. Incorporating this aligns our email dispatcher directly with the source scoring tool.
* **Mechanism:** Compare current session with yesterday's imported session JSON or local history snapshot to compute and render historical delta badges (e.g., `Score Delta: 85 ↗ 92 (+7 pts)`, `+3 test cases passed`, `-1 defect resolved`).
