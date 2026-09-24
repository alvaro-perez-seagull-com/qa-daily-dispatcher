/**
 * Section: Quality Scorecard Engine
 * Implements Christian Velasco's exact scoring algorithm, computes composite scores,
 * and renders the score preview badge onto an offscreen HTML5 canvas to export an inline image.
 */
export const SectionScorecard = {
  defaultConfig: {
    storyPoints: 22, // Feature scope denominator
    reopened: 0,
    closed: 0,
    escaped: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 }
  },

  /**
   * Evaluates quality metrics and computes the composite score (0-100)
   * matching Christian Velasco's exact QA Scorecard algorithm
   */
  computeQualityScore(params) {
    const sp = Math.max(0.1, Number(params.storyPoints) || 22);
    const counts = params.severityCounts || { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, total: 0, avgResBySev: {}, overallAvgRes: 0 };
    const totalDefects = counts.total || 0;
    const reopened = Number(params.reopened) || 0;
    const closed = (Number(params.closed) || 0) + reopened;

    const dd = totalDefects / sp;
    const rr = closed > 0 ? (reopened / closed) : 0;
    const s1r = (counts.s1 || 0) / sp;
    const avgRt = counts.overallAvgRes !== undefined ? counts.overallAvgRes : (params.avgRes || 0);

    // SLA Targets in days for Dev-to-QA turnaround
    const slaTargets = { s1: 1.0, s2: 2.0, s3: 3.0, s4: 5.0, s5: 7.0 };
    const weights = { s1: 0.30, s2: 0.25, s3: 0.17, s4: 0.15, s5: 0.13 };

    // Calculate pillar scores (0 - 100)
    const pillars = {};
    for (let i = 1; i <= 5; i++) {
      const key = `s${i}`;
      const cnt = counts[key] || 0;
      const res = (counts.avgResBySev && counts.avgResBySev[key]) || 0;
      const target = slaTargets[key];

      if (cnt === 0) {
        pillars[key] = 100;
      } else {
        pillars[key] = res <= target ? 100 : 0;
      }
    }

    let score = 0;
    for (let i = 1; i <= 5; i++) {
      const key = `s${i}`;
      score += (pillars[key] * weights[key]);
    }

    if (rr > 0.1) score -= (rr * 20);
    score = Math.max(0, Math.min(100, Math.round(score)));

    let grade = 'Excellent';
    let ringColor = '#3B6D11'; // Seagull green
    if (score < 40) {
      grade = 'Poor';
      ringColor = '#A32D2D'; // Red
    } else if (score < 70) {
      grade = 'Moderate';
      ringColor = '#185FA5'; // Blue/Cyan
    } else if (score < 90) {
      grade = 'Good';
      ringColor = '#185FA5'; // Blue
    }

    return {
      score,
      grade,
      ringColor,
      density: dd.toFixed(2),
      reopen: (rr * 100).toFixed(1),
      s1Rate: (s1r * 100).toFixed(2),
      avgRes: `${avgRt.toFixed(1)}d`,
      pillars
    };
  },

  /**
   * Renders the Quality Scorecard Badge on an offscreen Canvas
   * matching Christian's UI component (width=506, height=135)
   */
  generateScorecardImage(metrics) {
    const width = 506;
    const height = 135;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Outer background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Card background
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(8, 8, width - 16, height - 16, 10);
    ctx.fill();
    ctx.stroke();

    // Circular Score Ring
    const ringCenterX = 68;
    const ringCenterY = 67;
    const ringRadius = 40;

    // Background track
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Score progress arc
    ctx.strokeStyle = metrics.ringColor || '#3B6D11';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const angle = ((metrics.score || 100) / 100) * 2 * Math.PI;
    ctx.arc(ringCenterX, ringCenterY, ringRadius, -0.5 * Math.PI, -0.5 * Math.PI + angle);
    ctx.stroke();

    // Score Number inside ring
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(metrics.score || 100), ringCenterX, ringCenterY - 6);

    // Grade Label inside ring
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial, sans-serif';
    ctx.fillText(metrics.grade || 'Excellent', ringCenterX, ringCenterY + 12);

    // Header title
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText('LIVE SCORE PREVIEW', 130, 48);

    // Metrics readout line
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(`Density: `, 130, 80);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(`${metrics.density}/SP`, 180, 80);

    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(`Reopen: `, 250, 80);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(`${metrics.reopen}%`, 302, 80);

    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(`S1 rate: `, 360, 80);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(`${metrics.s1Rate}%`, 408, 80);

    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(`Avg res: `, 130, 105);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(`${metrics.avgRes}`, 180, 105);

    return canvas.toDataURL('image/png');
  },

  /**
   * Renders the exact Outlook MSO HTML for Quality Scorecard section
   */
  renderMsoHtml(scorecardBase64) {
    return `
<h2 class=MsoHeading2 style='mso-style-name:"Heading 2";mso-outline-level:2;margin-top:12.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;page-break-after:avoid;font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold'><span class=Heading2Char style='mso-style-name:"Heading 2 Char";font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold;mso-fareast-font-family:"Times New Roman"'>Quality Scorecard<o:p></o:p></span></h2>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><img width=506 height=135 src="${scorecardBase64}" style='height:1.406in;width:5.27in'></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
`;
  }
};
