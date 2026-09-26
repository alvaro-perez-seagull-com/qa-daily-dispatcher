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

## 🤖 AI-Generated Recommendations

### 5. Jira Cloud Direct Filter API Sync (OAuth / Personal Access Token)
* **Value:** Eliminates the manual step of opening Jira in another tab, highlighting rows, and pasting clipboard text.
* **Mechanism:** Optional field in Setup to save a Jira PAT or API token. A single **"Fetch Bugs from Jira"** button executes the generated JQL query via Jira REST API (`/rest/api/3/search`) and directly populates the defect table in seconds.

---

### 6. Zephyr Scale Test Cycle Auto-Import
* **Value:** Removes manual cycle data entry for test case counts, pass rates, and execution status.
* **Mechanism:** Given one or more Zephyr Cycle keys (e.g., `BPLAT-R925`, `BPLAT-R926`), fetch cycle metrics (`totalTestCases`, `executionSummaries.PASSED`, `retestCount`) via the Zephyr Scale REST API (`/v2/testcycle/{key}/executions`) and auto-populate Tab 2.

---

### 7. Multi-Channel Export: Slack / Teams / Confluence Markdown
* **Value:** Teams frequently post daily status updates in Slack or Microsoft Teams channels in addition to sending Outlook emails.
* **Mechanism:** Add a **"Copy as Slack/Teams Markdown"** action in Tab 4 that generates clean, bulleted Slack markdown blocks with bold metrics, severity summaries, and status badges ready to paste into chat threads.

---

### 8. Multi-Engineer / Co-Tester Attribution
* **Value:** Complex feature testing is frequently shared between 2 or more QA engineers (e.g., functional tester + automation lead).
* **Mechanism:** Support adding multiple QA Engineer names (e.g., `Alvaro Perez, Catherine Buenafe`) that automatically format into the email greeting, sender signature, and subject metadata without manual edits.

---

### 9. Project Preset Profiles (Saved Workspace Configurations)
* **Value:** QA engineers switching between different projects during the sprint (e.g., BTC Intelligent Forms vs. BTO Licensing vs. Print Service) have to re-enter versions, links, and recipient preferences each time.
* **Mechanism:** Allow users to save named configuration profiles (e.g., `"BTC - Intelligent Forms"`, `"BTO - Licensing Service"`) to switch entire setups with a single click.

---

### 10. Day-over-Day Delta & Trend Indicators (Source Scorecard Feature Parity)
* **Value & Context:** This capability natively exists in Christian Velasco's original scorecard project, tracking day-over-day trajectory and velocity. Incorporating this aligns our email dispatcher directly with the source scoring tool.
* **Mechanism:** Compare current session with yesterday's imported session JSON or local history snapshot to compute and render historical delta badges (e.g., `Score Delta: 85 ↗ 92 (+7 pts)`, `+3 test cases passed`, `-1 defect resolved`).
