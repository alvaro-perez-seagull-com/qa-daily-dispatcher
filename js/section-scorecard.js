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
   * Linear tier interpolation (Excellent 100-75, Good 75-50, Moderate 50-25, Poor 25-0)
   * Matching Christian Velasco's exact QA Scorecard engine
   */
  scoreTier(val, thresholds) {
    const v = Math.max(0, Number(val) || 0);
    const [exc, good, mod] = thresholds;

    if (v === 0) return 100;

    // Zero-tolerance threshold (e.g. S1 Showstopper rate)
    if (exc === 0 && good === 0 && mod === 0) {
      return v === 0 ? 100 : 0;
    }

    // Zero-lower bound with non-zero upper bounds (e.g. S2 Critical)
    if (exc === 0) {
      if (v <= good) {
        return 75 - (v / good) * 25;
      }
      if (v <= mod) {
        return 50 - ((v - good) / (mod - good)) * 25;
      }
      const poorSpan = (mod - good > 0) ? (mod - good) : 0.05;
      return Math.max(0, 25 - ((v - mod) / poorSpan) * 25);
    }

    // Excellent tier (0 to exc): maps 100 down to 75
    if (v <= exc) {
      return 100 - (v / exc) * 25;
    }

    // Good tier (exc to good): maps 75 down to 50
    if (v <= good) {
      return 75 - ((v - exc) / (good - exc)) * 25;
    }

    // Moderate tier (good to mod): maps 50 down to 25
    if (v <= mod) {
      return 50 - ((v - good) / (mod - good)) * 25;
    }

    // Poor tier (> mod): maps 25 down to 0
    const poorSpan = (mod - good > 0) ? (mod - good) : exc;
    return Math.max(0, 25 - ((v - mod) / poorSpan) * 25);
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
    const escaped = params.escaped || { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 };
    const totalEscaped = (escaped.s1 || 0) + (escaped.s2 || 0) + (escaped.s3 || 0) + (escaped.s4 || 0) + (escaped.s5 || 0);

    // 1. Raw Values
    const rawDensity = totalDefects / sp;
    const rawEscape = (totalDefects + totalEscaped) > 0 ? (totalEscaped / (totalDefects + totalEscaped)) : 0;
    const rawReopen = closed > 0 ? (reopened / closed) : 0;
    const rawS1Rate = (counts.s1 || 0) / sp;
    const rawAvgRes = counts.overallAvgRes !== undefined ? counts.overallAvgRes : (params.avgRes || 0);

    // 2. Primary Metric Scores (0-100)
    const scoreDensity = this.scoreTier(rawDensity, [0.005, 0.01, 0.03]);
    const scoreEscape = this.scoreTier(rawEscape, [0.01, 0.03, 0.05]);
    const scoreReopen = this.scoreTier(rawReopen, [0.03, 0.07, 0.15]);
    const scoreS1Rate = this.scoreTier(rawS1Rate, [0, 0, 0]);
    const scoreAvgRes = this.scoreTier(rawAvgRes, [1, 4, 7]);

    // Primary Group Score (% Weights: Density 25%, Escape 0%, Reopen 25%, S1 20%, Resolution 30%)
    const primaryScore = (scoreDensity * 0.25) +
                         (scoreEscape * 0.00) +
                         (scoreReopen * 0.25) +
                         (scoreS1Rate * 0.20) +
                         (scoreAvgRes * 0.30);

    // 3. Severity Rows (defects/SP mapped against severity tier thresholds)
    const s1Density = (counts.s1 || 0) / sp;
    const s2Density = (counts.s2 || 0) / sp;
    const s3Density = (counts.s3 || 0) / sp;
    const s4Density = (counts.s4 || 0) / sp;
    const s5Density = (counts.s5 || 0) / sp;

    const scoreS1 = this.scoreTier(s1Density, [0, 0, 0]);
    const scoreS2 = this.scoreTier(s2Density, [0, 0.02, 0.05]);
    const scoreS3 = this.scoreTier(s3Density, [0.03, 0.05, 0.07]);
    const scoreS4 = this.scoreTier(s4Density, [0.07, 0.10, 0.25]);
    const scoreS5 = this.scoreTier(s5Density, [0.20, 0.50, 1.00]);

    // Severity Group Score (Relative Weights: S1=10, S2=7, S3=4, S4=2, S5=1 -> Total 24 pts)
    const sevGroupScore = ((scoreS1 * 10) + (scoreS2 * 7) + (scoreS3 * 4) + (scoreS4 * 2) + (scoreS5 * 1)) / 24;

    // 4. Final Composite Score = (Primary × 50%) + (Severity Group × 50%)
    let finalScore = (primaryScore * 0.50) + (sevGroupScore * 0.50);
    finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

    // 5. Quality Grade & Ring Color (Poor <30, Moderate 30-59, Good 60-89, Excellent 90-100)
    let grade = 'Excellent';
    let ringColor = '#3B6D11'; // Seagull green
    if (finalScore < 30) {
      grade = 'Poor';
      ringColor = '#A32D2D'; // Red
    } else if (finalScore < 60) {
      grade = 'Moderate';
      ringColor = '#b45309'; // Amber/Orange
    } else if (finalScore < 90) {
      grade = 'Good';
      ringColor = '#185FA5'; // Blue
    }

    const pillars = {
      s1: Math.round(scoreS1),
      s2: Math.round(scoreS2),
      s3: Math.round(scoreS3),
      s4: Math.round(scoreS4),
      s5: Math.round(scoreS5)
    };

    return {
      score: finalScore,
      grade,
      ringColor,
      density: rawDensity.toFixed(2),
      reopen: (rawReopen * 100).toFixed(1),
      s1Rate: (rawS1Rate * 100).toFixed(2),
      avgRes: `${rawAvgRes.toFixed(1)}d`,
      pillars,
      primaryScore: Math.round(primaryScore),
      sevGroupScore: Math.round(sevGroupScore)
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

    // Draw 5 Severity Mini-Pillars (Top Right)
    const pillars = metrics.pillars || { s1: 100, s2: 100, s3: 100, s4: 100, s5: 100 };
    const barBaseX = 405;
    const barBaseY = 100;
    const barMaxH = 26;
    const barW = 8;
    const barGap = 8;

    ['s1', 's2', 's3', 's4', 's5'].forEach((k, i) => {
      const bx = barBaseX + (i * (barW + barGap));
      const pVal = pillars[k] !== undefined ? pillars[k] : 100;
      const bH = Math.max(2, (pVal / 100) * barMaxH);
      const by = barBaseY - bH;

      // Color based on pillar score
      ctx.fillStyle = pVal >= 90 ? '#3B6D11' : (pVal >= 60 ? '#185FA5' : (pVal >= 30 ? '#b45309' : '#A32D2D'));
      ctx.beginPath();
      ctx.roundRect(bx, by, barW, bH, 2);
      ctx.fill();

      // Score above bar
      ctx.font = 'bold 8px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(pVal), bx + (barW / 2), by - 3);

      // Label below bar (S1..S5)
      ctx.fillStyle = '#6b7280';
      ctx.font = '8px Arial, sans-serif';
      ctx.fillText(`S${i + 1}`, bx + (barW / 2), barBaseY + 11);
    });

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
