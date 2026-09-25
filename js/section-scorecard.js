/**
 * Section: Quality Scorecard Engine
 * Implements Christian Velasco's exact scoring algorithm, computes composite scores,
 * and renders the score preview badge onto an offscreen HTML5 canvas to export an inline image.
 */
export const SectionScorecard = {
  defaultConfig: {
    storyPoints: null, // Manually configured feature scope denominator
    reopened: 0,
    closed: 0,
    escaped: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 }
  },

  /**
   * Linear tier interpolation (Excellent 100-75, Good 75-50, Moderate 50-25, Poor 25-0)
   * Matching Christian Velasco's exact QA Scorecard engine
   */
  // NOTE: scoreTier() assumes callers have already validated their
  // input (finite, non-null numbers). computeQualityScore() enforces
  // this upstream for all current callers. If scoreTier() is ever
  // called from a new location, validate there first — do not
  // reintroduce silent fallback behavior inside this function.
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
    // 0. Story Points Validation & Separation of Concerns:
    // Concern A (Input Validation): Reject missing, zero, blank, or non-finite values without guessing.
    // Concern B (Arithmetic Floor): Math.max(0.1, sp) safeguards against divide-by-zero for valid positive numbers.
    const rawSp = params ? params.storyPoints : undefined;
    const numSp = Number(rawSp);
    const hasValidSp = rawSp !== null && rawSp !== undefined && rawSp !== '' && Number.isFinite(numSp) && numSp > 0;

    if (!hasValidSp) {
      return {
        score: '—',
        grade: '—',
        ringColor: '#b45309', // Amber warning ring
        density: '—',
        reopen: '—',
        s1Rate: '—',
        avgRes: '—',
        pillars: null,
        primaryScore: null,
        sevGroupScore: null,
        hasData: false,
        invalidInput: true,
        missingStoryPoints: true,
        errorMessage: 'Feature Story Points (SP) is missing or invalid. Please enter a positive number in Setup.'
      };
    }

    const sp = Math.max(0.1, numSp);
    const counts = params.severityCounts || { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, total: 0, avgResBySev: {}, overallAvgRes: 0 };
    const totalDefects = counts.total || 0;
    const reopened = Number(params.reopened) || 0;
    const closed = (Number(params.closed) || 0) + reopened;
    const escaped = params.escaped || { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 };
    const totalEscaped = (escaped.s1 || 0) + (escaped.s2 || 0) + (escaped.s3 || 0) + (escaped.s4 || 0) + (escaped.s5 || 0);

    // 1. Raw Values with Finite Validation
    const rawDensity = totalDefects / sp;
    const rawEscape = (totalDefects + totalEscaped) > 0 ? (totalEscaped / (totalDefects + totalEscaped)) : 0;
    const rawReopen = closed > 0 ? (reopened / closed) : 0;
    const rawS1Rate = (counts.s1 || 0) / sp;

    // Validate that candidate turnaround is a finite, non-negative number
    const candidateAvgRes = counts.overallAvgRes !== undefined ? counts.overallAvgRes : params.avgRes;
    const numAvgRes = Number(candidateAvgRes);
    const hasValidAvgRes = candidateAvgRes !== null && candidateAvgRes !== undefined && candidateAvgRes !== '' && Number.isFinite(numAvgRes) && numAvgRes >= 0;
    const rawAvgRes = hasValidAvgRes ? numAvgRes : null;

    // 2. Primary Metric Scores (0-100)
    const scoreDensity = this.scoreTier(rawDensity, [0.005, 0.01, 0.03]);
    // NOTE: scoreEscape is intentionally computed but weighted at 0.00 in primaryScore
    // to match the source tool's Live Score Preview widget (which excludes escape rate
    // from the live badge, reserving it for full scorecard/history views). It is kept in place
    // rather than removed so the computation does not need to be re-derived if surfaced
    // in a future, more complete view. Anyone changing this weight away from 0.00 should
    // also decide whether scoreEscape needs to be added to the returned metrics object,
    // since it is currently not exposed in the return payload.
    const scoreEscape = this.scoreTier(rawEscape, [0.01, 0.03, 0.05]);
    const scoreReopen = this.scoreTier(rawReopen, [0.03, 0.07, 0.15]);
    const scoreS1Rate = this.scoreTier(rawS1Rate, [0, 0, 0]);
    // If no defects exist, turnaround SLA target is 100% met; otherwise if no valid turnaround days exist, scoreAvgRes evaluates to 0 (does not inflate score)
    const scoreAvgRes = (totalDefects === 0) ? 100 : (rawAvgRes !== null ? this.scoreTier(rawAvgRes, [1, 4, 7]) : 0);

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
      density: Number.isFinite(rawDensity) ? rawDensity.toFixed(2) : '—',
      reopen: Number.isFinite(rawReopen) ? (rawReopen * 100).toFixed(1) : '—',
      s1Rate: Number.isFinite(rawS1Rate) ? (rawS1Rate * 100).toFixed(2) : '—',
      avgRes: rawAvgRes !== null ? `${rawAvgRes.toFixed(1)}d` : '—',
      pillars,
      primaryScore: Math.round(primaryScore),
      sevGroupScore: Math.round(sevGroupScore),
      hasData: true
    };
  },

  /**
   * Renders the Quality Scorecard Badge on an offscreen Canvas
   * matching Christian Velasco's exact UI component at 2x Retina resolution
   * (Without S1-S5 pillar bars as requested)
   */
  generateScorecardImage(metrics) {
    const width = 506;
    const height = 100;
    const dpr = 2; // 2x supersampling for razor-sharp Retina/High-DPI rendering
    const canvas = document.createElement('canvas');
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const hasData = metrics && metrics.hasData !== false && metrics.score !== '—';

    // 1. Outer background (white so corners blend seamlessly in Outlook)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Card dark background container (matching Christian's UI)
    ctx.fillStyle = '#18191c';
    ctx.strokeStyle = '#2d2f36';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(6, 6, width - 12, height - 12, 8);
    } else {
      ctx.rect(6, 6, width - 12, height - 12);
    }
    ctx.fill();
    ctx.stroke();

    // 3. Circular Score Ring (Gauge)
    const ringCenterX = 52;
    const ringCenterY = 50;
    const ringRadius = 30;

    // Determine ring accent color (Green for Good/Excellent, matching reference screenshot)
    let ringColor = '#22c55e'; // Green default for Excellent / Good
    if (hasData) {
      const numScore = Number(metrics.score) || 0;
      if (numScore < 30) ringColor = '#ef4444'; // Red (Poor)
      else if (numScore < 60) ringColor = '#f59e0b'; // Amber (Moderate)
      else ringColor = '#22c55e'; // Green (Good & Excellent)
    } else if (metrics && (metrics.invalidInput || metrics.missingStoryPoints)) {
      ringColor = '#f59e0b'; // Amber accent for invalid / missing SP input state
    } else {
      ringColor = '#3b82f6'; // Blue accent for empty state
    }

    // Background track
    ctx.strokeStyle = '#2c2e35';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Score progress arc
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const scoreVal = hasData ? (Number(metrics.score) || 0) : 100;
    const angle = (Math.max(0, Math.min(100, scoreVal)) / 100) * 2 * Math.PI;
    ctx.arc(ringCenterX, ringCenterY, ringRadius, -0.5 * Math.PI, -0.5 * Math.PI + angle);
    ctx.stroke();

    // Center Score & Grade Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (!hasData) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('—', ringCenterX, ringCenterY - 5);

      if (metrics && metrics.missingStoryPoints) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8px Arial, sans-serif';
        ctx.fillText('NO SP', ringCenterX, ringCenterY + 10);
      } else {
        ctx.fillStyle = '#8b929e';
        ctx.font = 'bold 9px Arial, sans-serif';
        ctx.fillText('—', ringCenterX, ringCenterY + 10);
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText(String(metrics.score), ringCenterX, ringCenterY - 5);

      ctx.fillStyle = ringColor;
      ctx.font = 'bold 9px Arial, sans-serif';
      ctx.fillText(String(metrics.grade), ringCenterX, ringCenterY + 10);
    }

    // 4. Header title
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#8b929e';
    ctx.font = 'bold 10.5px Arial, sans-serif';
    ctx.fillText('LIVE SCORE PREVIEW', 98, 35);

    // 5. Metrics readout: Single clean horizontal line
    const metricY = 67;

    // Density
    ctx.font = '11.5px Arial, sans-serif';
    ctx.fillStyle = '#8b929e';
    ctx.fillText('Density: ', 98, metricY);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11.5px Arial, sans-serif';
    ctx.fillText(hasData ? `${metrics.density}/SP` : '—', 146, metricY);

    // Reopen
    ctx.font = '11.5px Arial, sans-serif';
    ctx.fillStyle = '#8b929e';
    ctx.fillText('Reopen: ', 202, metricY);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11.5px Arial, sans-serif';
    ctx.fillText(hasData ? `${metrics.reopen}%` : '—', 248, metricY);

    // S1 rate
    ctx.font = '11.5px Arial, sans-serif';
    ctx.fillStyle = '#8b929e';
    ctx.fillText('S1 rate: ', 294, metricY);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11.5px Arial, sans-serif';
    ctx.fillText(hasData ? `${metrics.s1Rate}%` : '—', 338, metricY);

    // Avg res
    ctx.font = '11.5px Arial, sans-serif';
    ctx.fillStyle = '#8b929e';
    ctx.fillText('Avg res: ', 386, metricY);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11.5px Arial, sans-serif';
    ctx.fillText(hasData && metrics.avgRes && !metrics.avgRes.includes('NaN') ? `${metrics.avgRes}` : '—', 432, metricY);

    return canvas.toDataURL('image/png');
  },

  /**
   * Renders the exact Outlook MSO HTML for Quality Scorecard section
   */
  renderMsoHtml(scorecardBase64, metrics = null) {
    const titleAttr = metrics && metrics.errorMessage ? ` title="${metrics.errorMessage.replace(/"/g, '&quot;')}"` : '';
    const altAttr = metrics && metrics.missingStoryPoints ? 'Scorecard Uncomputed - Story Points Required' : 'Quality Scorecard';
    return `
<h2 class=MsoHeading2 style='mso-style-name:"Heading 2";mso-outline-level:2;margin-top:12.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;page-break-after:avoid;font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold'><span class=Heading2Char style='mso-style-name:"Heading 2 Char";font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold;mso-fareast-font-family:"Times New Roman"'>Quality Scorecard<o:p></o:p></span></h2>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><img width=506 height=100 src="${scorecardBase64}"${titleAttr} alt="${altAttr}" style='height:1.042in;width:5.27in'></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
`;
  }
};
