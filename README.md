# Seagull QA Daily Dispatcher

A client-side web application designed for Seagull Software QA teams to automate the generation and copying of rigid, Microsoft Outlook / Word-compliant daily status emails for BarTender Cloud and OnPrem initiatives.

---

## Features

- **Strict Outlook / Word MSO HTML Formatting:** Produces pixel-perfect Word 15 MSO email markup (`xmlns:v`, `xmlns:o`, `xmlns:w`, `mso-yfti-tbllook`, `#B3CEFB` headers, point-based column widths).
- **Automated Quality Scorecard Engine:** Implements Christian Velasco's exact scoring algorithm, computes composite scores, and renders the `100 Excellent` score badge directly onto an offscreen HTML5 canvas to embed as a base64 image (no manual screenshotting or cropping required).
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
└── README.md                  # Documentation & GitHub Pages deployment guide
```

---

## Deploying to GitHub Pages

1. **Create or Open your GitHub Repository:**
   - Create a repository (e.g. `qa-daily-dispatcher` or within your user GitHub page repository `username.github.io`).
2. **Push the Files:**
   - Push the contents of `98-Projects/qa-daily-dispatcher/` to the `main` branch.
3. **Enable GitHub Pages:**
   - Go to your repository **Settings** &rarr; **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Choose `main` branch and `/ (root)` folder, then click **Save**.
4. **Access the Live Tool:**
   - Your tool will be live at: `https://[your-username].github.io/qa-daily-dispatcher/`!
