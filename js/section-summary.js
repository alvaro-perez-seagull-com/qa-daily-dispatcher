/**
 * Section: Summary (Test Cycle Execution Table)
 * Manages test cycle rows and computes aggregate totals.
 */
export const SectionSummary = {
  /**
   * Known Zephyr Scale test cycles dictionary for instant title & key lookup
   */
  KNOWN_ZEPHYR_CYCLES: {
    "BPLAT-R926": "BPLAT-R926: Intelligent Forms, Refreshable Print Preview - QA Functional & Integration Testing",
    "BPLAT-R935": "BPLAT-R935: Intelligent Forms, Refreshable Print Preview - QA Critical Path Testing",
    "BPLAT-R927": "BPLAT-R927: Intelligent Forms, Refreshable Print Preview - QA Localization Testing",
    "BPLAT-R14": "BPLAT-R14: IDEA_1844-AM1DEV_CY01",
    "BPLAT-R19": "BPLAT-R19: CoreUI_AcctMgmt_HomeNav_R1",
    "BPLAT-R22": "BPLAT-R22: CoreUI_AcctMgmt_PrintHistory_R1",
    "BPLAT-R23": "BPLAT-R23: CoreUI_AcctMgmt_Printers_R1",
    "BPLAT-R24": "BPLAT-R24: CT_IDEA-1844_AccMgmt_Usage",
    "BPLAT-R25": "BPLAT-R25: CT_CoreUI_AcctMgmt_HomeNav",
    "BPLAT-R26": "BPLAT-R26: CT_CoreUI_AcctMgmt_PrintHistory",
    "BPLAT-R27": "BPLAT-R27: CT_CoreUI_AcctMgmt_Printers",
    "BPLAT-R28": "BPLAT-R28: IDEA-1844_AccMgmt_Usage_R1",
    "BPLAT-R29": "BPLAT-R29: Regression",
    "BPLAT-R30": "BPLAT-R30: BTO v11.8",
    "BPLAT-R32": "BPLAT-R32: BTO v11.5"
  },

  defaultCycles: [
    {
      area: "BPLAT-R926: Intelligent Forms, Refreshable Print Preview - QA Functional & Integration Testing",
      cycleKey: "BPLAT-R926",
      cycleUrl: "https://mojixinc.atlassian.net/projects/BPLAT?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCycle/BPLAT-R926",
      productVersion: "BTC v12.6",
      readyToTest: true,
      testingStatus: "IN PROGRESS",
      progress: 50,
      passed: 100,
      retest: 0,
      issues: 0,
      testCases: 18
    },
    {
      area: "BPLAT-R935: Intelligent Forms, Refreshable Print Preview - QA Critical Path Testing",
      cycleKey: "BPLAT-R935",
      cycleUrl: "https://mojixinc.atlassian.net/projects/BPLAT?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCycle/BPLAT-R935",
      productVersion: "BTC v12.6",
      readyToTest: true,
      testingStatus: "-",
      progress: null,
      passed: null,
      retest: null,
      issues: null,
      testCases: 6
    },
    {
      area: "BPLAT-R927: Intelligent Forms, Refreshable Print Preview - QA Localization Testing",
      cycleKey: "BPLAT-R927",
      cycleUrl: "https://mojixinc.atlassian.net/projects/BPLAT?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCycle/BPLAT-R927",
      productVersion: "BTC v12.6",
      readyToTest: true,
      testingStatus: "-",
      progress: null,
      passed: null,
      retest: null,
      issues: null,
      testCases: 2
    }
  ],

  /**
   * Extracts a Zephyr test cycle key from text or URL
   */
  extractCycleKey(text, defaultProject = 'BPLAT') {
    if (!text || typeof text !== 'string') return '';
    const clean = text.trim();
    
    // Check URL pattern first
    const urlMatch = clean.match(/testCycle\/([A-Za-z0-9_]+-(?:R|C)\d+|R\d+)/i);
    if (urlMatch) return urlMatch[1].toUpperCase();

    // Check key pattern: BPLAT-R926 or R926
    const keyMatch = clean.match(/\b([A-Za-z0-9_]+-(?:R|C)\d+)\b/i);
    if (keyMatch) return keyMatch[1].toUpperCase();

    const shortMatch = clean.match(/\b(R\d+)\b/i);
    if (shortMatch) return `${defaultProject}-${shortMatch[1].toUpperCase()}`;

    return '';
  },

  /**
   * Builds the official Zephyr Scale test cycle web URL
   */
  buildZephyrUrl(cycleKey) {
    if (!cycleKey) return '';
    const projectKey = cycleKey.split('-')[0] || 'BPLAT';
    return `https://mojixinc.atlassian.net/projects/${projectKey}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCycle/${cycleKey}`;
  },

  /**
   * Formats the Area cell for Word 15 MSO Outlook HTML with Zephyr link
   */
  renderAreaCell(c) {
    const area = (c.area || '').trim();
    if (!area) return '';

    let key = c.cycleKey || this.extractCycleKey(area);
    let url = c.cycleUrl || (key ? this.buildZephyrUrl(key) : '');

    if (key && url) {
      const upperArea = area.toUpperCase();
      const upperKey = key.toUpperCase();

      if (upperArea.startsWith(upperKey)) {
        const remainder = area.slice(key.length);
        return `<a href="${url}"><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:#1155CC;mso-ligatures:none;text-decoration:underline'>${key}</span></a><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${remainder}</span>`;
      } else if (upperArea.includes(upperKey)) {
        const idx = upperArea.indexOf(upperKey);
        const before = area.slice(0, idx);
        const actualKey = area.slice(idx, idx + key.length);
        const after = area.slice(idx + key.length);
        return `<span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${before}</span><a href="${url}"><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:#1155CC;mso-ligatures:none;text-decoration:underline'>${actualKey}</span></a><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${after}</span>`;
      } else {
        return `<a href="${url}"><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:#1155CC;mso-ligatures:none;text-decoration:underline'>${area}</span></a>`;
      }
    }

    return `<span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${area}</span>`;
  },

  /**
   * Calculates the summary row across all cycles
   */
  calculateTotals(cycles) {
    let totalTestCases = 0;
    let totalIssues = 0;
    let totalRetests = 0;
    let executedCases = 0;
    let passedCases = 0;

    cycles.forEach(c => {
      const tc = Number(c.testCases) || 0;
      totalTestCases += tc;

      if (c.issues !== null && c.issues !== undefined && c.issues !== '-') {
        totalIssues += Number(c.issues) || 0;
      }
      if (c.retest !== null && c.retest !== undefined && c.retest !== '-') {
        totalRetests += Number(c.retest) || 0;
      }

      if (c.progress !== null && c.progress !== undefined && c.progress !== '-') {
        const progRate = (Number(c.progress) || 0) / 100;
        const executedInCycle = tc * progRate;
        executedCases += executedInCycle;

        if (c.passed !== null && c.passed !== undefined && c.passed !== '-') {
          const passRate = (Number(c.passed) || 0) / 100;
          passedCases += (executedInCycle * passRate);
        }
      }
    });

    // In Seagull's standard template, active progress reflects overall executed vs active, or active cycle progress.
    const overallProgress = totalTestCases > 0 ? Math.round((executedCases / totalTestCases) * 100) : 0;
    const overallPassed = executedCases > 0 ? Math.round((passedCases / executedCases) * 100) : (totalTestCases > 0 ? 100 : 0);

    return {
      progress: totalTestCases > 0 ? `${overallProgress}%` : "0%",
      passed: totalTestCases > 0 ? `${overallPassed}%` : "0%",
      retest: totalRetests,
      issues: totalIssues,
      testCases: totalTestCases
    };
  },

  /**
   * Formats a cell value or returns a dash if empty/null
   */
  formatCell(val, isPercent = false) {
    if (val === null || val === undefined || val === '-' || val === '') return '-';
    return isPercent ? `${val}%` : val;
  },

  /**
   * Renders the exact Outlook MSO HTML Table
   */
  renderMsoHtml(cycles) {
    const totals = this.calculateTotals(cycles);

    const rowsHtml = cycles.map((c, idx) => `
 <tr style='mso-yfti-irow:${idx + 1};height:25.5pt'>
  <td width=336 valign=top style='width:251.5pt;border:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal>${this.renderAreaCell(c)}<o:p></o:p></p>
  </td>
  <td width=115 valign=top style='width:86.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${c.productVersion}<o:p></o:p></span></p>
  </td>
  <td width=88 valign=top style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal align=center style='text-align:center'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${c.readyToTest ? 'TRUE' : 'FALSE'}<o:p></o:p></span></p>
  </td>
  <td width=119 valign=top style='width:89.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal align=center style='text-align:center'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${c.testingStatus || '-'}<o:p></o:p></span></p>
  </td>
  <td width=88 valign=top style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${this.formatCell(c.progress, true)}<o:p></o:p></span></p>
  </td>
  <td width=95 valign=top style='width:71.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${this.formatCell(c.passed, true)}<o:p></o:p></span></p>
  </td>
  <td width=95 valign=top style='width:71.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${this.formatCell(c.retest)}<o:p></o:p></span></p>
  </td>
  <td width=88 valign=top style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${this.formatCell(c.issues)}<o:p></o:p></span></p>
  </td>
  <td width=88 valign=top style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
   <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${c.testCases}<o:p></o:p></span></p>
  </td>
 </tr>`).join('');

    return `
<h2 class=MsoHeading2 style='mso-style-name:"Heading 2";mso-outline-level:2;margin-top:12.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;page-break-after:avoid;font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold'><span class=Heading2Char style='mso-style-name:"Heading 2 Char";font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold;mso-fareast-font-family:"Times New Roman"'>Summary<o:p></o:p></span></h2>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>

<table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0 width=1110
 style='width:832.5pt;border-collapse:collapse;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in'>
 <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes;height:12.75pt'>
  <td width=336 nowrap valign=top style='width:251.5pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Area</span></b><o:p></o:p></p>
  </td>
  <td width=115 nowrap valign=top style='width:86.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Product Version</span></b><o:p></o:p></p>
  </td>
  <td width=88 nowrap valign=top style='width:66.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Ready To Test</span></b><o:p></o:p></p>
  </td>
  <td width=119 nowrap valign=top style='width:89.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Testing Status</span></b><o:p></o:p></p>
  </td>
  <td width=88 nowrap valign=top style='width:66.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>TC Progress %</span></b><o:p></o:p></p>
  </td>
  <td width=95 nowrap valign=top style='width:71.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>TC Passed %</span></b><o:p></o:p></p>
  </td>
  <td width=95 nowrap valign=top style='width:71.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'># ReTest</span></b><o:p></o:p></p>
  </td>
  <td width=88 nowrap valign=top style='width:66.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'># Issues</span></b><o:p></o:p></p>
  </td>
  <td width=88 nowrap valign=top style='width:66.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=center style='text-align:center'><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'># TestCases</span></b><o:p></o:p></p>
  </td>
 </tr>
 ${rowsHtml}
 <tr style='mso-yfti-irow:${cycles.length + 1};height:12.75pt'><td colspan=9 style='height:12.75pt'></td></tr>
 <tr style='mso-yfti-irow:${cycles.length + 2};mso-yfti-lastrow:yes;height:12.75pt'>
  <td colspan=3 style='border:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'></td>
  <td width=119 nowrap valign=bottom style='width:89.0pt;border:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Total<o:p></o:p></span></b></p>
  </td>
  <td width=88 nowrap valign=bottom style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=right style='text-align:right'><b><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${totals.progress}<o:p></o:p></span></b></p>
  </td>
  <td width=95 nowrap valign=bottom style='width:71.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=right style='text-align:right'><b><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${totals.passed}<o:p></o:p></span></b></p>
  </td>
  <td width=95 nowrap valign=bottom style='width:71.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=right style='text-align:right'><b><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${totals.retest}<o:p></o:p></span></b></p>
  </td>
  <td width=88 nowrap valign=bottom style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${totals.issues}<o:p></o:p></span></p>
  </td>
  <td width=88 nowrap valign=bottom style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${totals.testCases}<o:p></o:p></span></p>
  </td>
 </tr>
</table>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
`;
  }
};
