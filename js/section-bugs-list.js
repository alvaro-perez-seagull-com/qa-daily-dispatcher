/**
 * Section: List of Bugs Found
 * Manages bug list from Jira, auto-calculates Age, and generates MSO table rows.
 */
export const SectionBugsList = {
  defaultBugs: [
    {
      type: "Bug",
      key: "BPLAT-23199",
      url: "https://mojixinc.atlassian.net/browse/BPLAT-23199",
      summary: "Forms: Mapping of same Form Components to multiple Label Variables is not working on Preview",
      dateCreated: "2026-09-22T00:00:00",
      severity: "SEV 4 (Medium)",
      status: "Open",
      reopened: 0
    }
  ],

  /**
   * Returns Age in days: uses b.age if explicitly provided (e.g. from Jira),
   * otherwise auto-calculates: (Reference Date - Date Created). Supports decimal values (e.g. 0.8).
   */
  getBugAge(bug, referenceDate = new Date()) {
    if (!bug) return 0;
    if (bug.age !== undefined && bug.age !== null && bug.age !== '') {
      const cleanStr = String(bug.age).trim().replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanStr);
      if (!isNaN(parsed)) return parsed;
    }
    return this.calculateAge(bug.dateCreated, referenceDate);
  },

  /**
   * Auto-calculates Age in days: (Today - Date Created)
   */
  calculateAge(dateCreated, referenceDate = new Date()) {
    if (!dateCreated) return 0;
    const created = new Date(dateCreated);
    if (isNaN(created.getTime())) return 0;
    const diffTime = Math.max(0, referenceDate.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Formats a date string for the table
   * e.g. 9/22/2026 0:00
   */
  formatDateCreated(dateCreated) {
    if (!dateCreated) return '';
    const d = new Date(dateCreated);
    if (isNaN(d.getTime())) return dateCreated;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  /**
   * Normalizes severity string to a number 1-5
   */
  extractSeverityNumber(sevString) {
    if (!sevString) return 4;
    const match = String(sevString).match(/([1-5])/);
    return match ? parseInt(match[1], 10) : 4;
  },

  /**
   * Aggregates bug counts and resolution turnaround ages by severity (SEV 1 - SEV 5)
   * Feeds SectionBugsChart and SectionScorecard
   */
  getSeverityCounts(bugs = [], referenceDate = new Date()) {
    const counts = {
      s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, total: 0,
      s1Age: 0, s2Age: 0, s3Age: 0, s4Age: 0, s5Age: 0, totalAge: 0,
      avgResBySev: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 },
      overallAvgRes: 0
    };
    bugs.forEach(b => {
      const sevNum = this.extractSeverityNumber(b.severity);
      const age = this.getBugAge(b, referenceDate);
      if (sevNum >= 1 && sevNum <= 5) {
        counts[`s${sevNum}`]++;
        counts[`s${sevNum}Age`] += age;
        counts.total++;
        counts.totalAge += age;
      }
    });

    for (let i = 1; i <= 5; i++) {
      const c = counts[`s${i}`];
      counts.avgResBySev[`s${i}`] = c > 0 ? (counts[`s${i}Age`] / c) : 0;
    }
    counts.overallAvgRes = counts.total > 0 ? (counts.totalAge / counts.total) : 0;

    return counts;
  },

  /**
   * Renders the exact Outlook MSO HTML Table for List of Bugs Found
   */
  renderMsoHtml(bugs = [], referenceDate = new Date()) {
    const bugRowsHtml = (bugs || []).map((b, idx) => {
      const age = this.getBugAge(b, referenceDate);
      const dateStr = this.formatDateCreated(b.dateCreated);
      const url = b.url || `https://mojixinc.atlassian.net/browse/${b.key}`;
      const isFirst = idx === 0;

      return `
 <tr style='mso-yfti-irow:${idx + 1};height:25.5pt'>
  <td width=89 valign=top style='width:67.0pt;border:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${b.type || 'Bug'}<o:p></o:p></span></p>
  </td>
  <td width=127 valign=top style='width:95.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal><u><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:#1155CC;mso-ligatures:none'><a href="${url}"><span style='color:#1155CC'>${b.key}</span></a><o:p></o:p></span></u></p>
  </td>
  <td width=378 valign=top style='width:283.5pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${b.summary}<o:p></o:p></span></p>
  </td>
  <td width=120 valign=top style='width:1.25in;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${dateStr}<o:p></o:p></span></p>
  </td>
  <td width=126 valign=top style='width:94.5pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${b.severity}<o:p></o:p></span></p>
  </td>
  <td width=68 valign=top style='width:51.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${b.status}<o:p></o:p></span></p>
  </td>
  <td width=88 valign=top style='width:66.0pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${b.reopened || 0}<o:p></o:p></span></p>
  </td>
  <td width=114 valign=top style='width:85.5pt;border:solid black 1.0pt;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:25.5pt'>
  <p class=MsoNormal align=right style='text-align:right'><span style='font-size:10.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>${age}<o:p></o:p></span></p>
  </td>
 </tr>`;
    }).join('');

    // Renders filler rows to maintain clean Word table grid if < 5 bugs
    const fillerRowCount = Math.max(0, 4 - bugs.length);
    let fillerRowsHtml = '';
    for (let i = 0; i < fillerRowCount; i++) {
      fillerRowsHtml += `
 <tr style='mso-yfti-irow:${bugs.length + i + 1};height:12.75pt'>
  <td width=89 valign=top style='width:67.0pt;border:solid black 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'><p class=MsoNormal>&nbsp;</p></td>
  <td width=127 valign=top style='width:95.0pt;border-top:none;border-left:none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'></td>
  <td width=378 valign=top style='width:283.5pt;border:solid black 1.0pt;border-top:none;border-left:none;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'><p class=MsoNormal>&nbsp;</p></td>
  <td width=120 valign=top style='width:1.25in;border-top:none;border-left:none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'><p class=MsoNormal>&nbsp;</p></td>
  <td width=126 valign=top style='width:94.5pt;border-top:none;border-left:none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'><p class=MsoNormal>&nbsp;</p></td>
  <td width=68 valign=top style='width:51.0pt;border-top:none;border-left:none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'><p class=MsoNormal>&nbsp;</p></td>
  <td width=88 valign=top style='width:66.0pt;border-top:none;border-left:none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'><p class=MsoNormal>&nbsp;</p></td>
  <td width=114 valign=top style='width:85.5pt;border-top:none;border-left:none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'><p class=MsoNormal>&nbsp;</p></td>
 </tr>`;
    }

    return `
<h2 style='mso-style-name:"Heading 2";margin-top:12.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold'><span style='font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold;mso-fareast-font-family:"Times New Roman"'>List of Bugs Found<o:p></o:p></span></h2>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>

<table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0 width=1110
 style='width:832.5pt;border-collapse:collapse;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in'>
 <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes;height:12.75pt'>
  <td width=89 nowrap valign=top style='width:67.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Type</span></b><o:p></o:p></p>
  </td>
  <td width=127 valign=top style='width:95.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>ID</span></b><o:p></o:p></p>
  </td>
  <td width=378 valign=top style='width:283.5pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Summary</span></b><o:p></o:p></p>
  </td>
  <td width=120 nowrap valign=top style='width:1.25in;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Date Created</span></b><o:p></o:p></p>
  </td>
  <td width=126 nowrap valign=top style='width:94.5pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Severity</span></b><o:p></o:p></p>
  </td>
  <td width=68 nowrap valign=top style='width:51.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Status</span></b><o:p></o:p></p>
  </td>
  <td width=88 nowrap valign=top style='width:66.0pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'># ReOpened</span></b><o:p></o:p></p>
  </td>
  <td width=114 nowrap valign=top style='width:85.5pt;background:#B3CEFB;padding:0in 5.4pt 0in 5.4pt;height:12.75pt'>
  <p class=MsoNormal><b><span style='font-size:8.0pt;font-family:"Arial",sans-serif;color:black;mso-ligatures:none'>Age</span></b><o:p></o:p></p>
  </td>
 </tr>
 ${bugRowsHtml}
 ${fillerRowsHtml}
</table>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
`;
  }
};
