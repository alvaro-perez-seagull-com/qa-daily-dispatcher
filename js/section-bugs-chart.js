/**
 * Section: Bugs by Severity (Chart Generator)
 * Dynamically renders the Bugs by Severity chart on an offscreen HTML5 canvas
 * based on the List of Bugs Found, exporting an inline base64 image.
 */
export const SectionBugsChart = {
  colors: {
    s1: '#E24B4A', // Showstopper Red
    s2: '#EF9F27', // Critical Amber
    s3: '#639922', // Major Green
    s4: '#378ADD', // Medium Blue
    s5: '#888780'  // Minor Gray
  },

  labels: [
    'S1 - Showstopper',
    'S2 - Critical',
    'S3 - Major',
    'S4 - Medium',
    'S5 - Minor'
  ],

  /**
   * Generates a base64 PNG image of the Bugs by Severity distribution chart
   * using offscreen HTML5 Canvas (zero external dependencies).
   */
  generateChartImage(counts = { s1: 0, s2: 0, s3: 0, s4: 1, s5: 0 }) {
    const width = 530;
    const height = 359;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('Defects by Severity Distribution', 25, 38);

    // Subtitle / Total
    const totalBugs = (counts.s1 || 0) + (counts.s2 || 0) + (counts.s3 || 0) + (counts.s4 || 0) + (counts.s5 || 0);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText(`Total Active Defects: ${totalBugs}`, 25, 58);

    // Chart Dimensions
    const chartLeft = 50;
    const chartRight = width - 40;
    const chartTop = 85;
    const chartBottom = height - 55;
    const chartHeight = chartBottom - chartTop;
    const chartWidth = chartRight - chartLeft;

    const dataVals = [counts.s1 || 0, counts.s2 || 0, counts.s3 || 0, counts.s4 || 0, counts.s5 || 0];
    const maxVal = Math.max(5, ...dataVals);

    // Grid lines & Y-axis labels
    const gridSteps = 5;
    ctx.strokeStyle = '#f3f4f6';
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridSteps; i++) {
      const y = chartBottom - (i / gridSteps) * chartHeight;
      const val = Math.round((i / gridSteps) * maxVal);
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartRight, y);
      ctx.stroke();
      ctx.fillText(String(val), chartLeft - 8, y + 4);
    }

    // Baseline
    ctx.strokeStyle = '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    ctx.lineTo(chartRight, chartBottom);
    ctx.stroke();

    // Bars
    const barWidth = 48;
    const barGap = (chartWidth - barWidth * 5) / 6;
    const palette = [this.colors.s1, this.colors.s2, this.colors.s3, this.colors.s4, this.colors.s5];

    dataVals.forEach((val, i) => {
      const x = chartLeft + barGap + i * (barWidth + barGap);
      const barHeight = maxVal > 0 ? (val / maxVal) * chartHeight : 0;
      const y = chartBottom - barHeight;

      // Draw Bar
      ctx.fillStyle = palette[i];
      if (barHeight > 0) {
        ctx.fillRect(x, y, barWidth, barHeight);
      } else {
        // Subtle baseline pip for 0
        ctx.fillRect(x, chartBottom - 2, barWidth, 2);
      }

      // Value label on top of bar
      ctx.fillStyle = val > 0 ? '#111827' : '#9ca3af';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x + barWidth / 2, y - 6);

      // X-axis label
      ctx.fillStyle = '#4b5563';
      ctx.font = '11px Arial, sans-serif';
      ctx.fillText(`S${i + 1}`, x + barWidth / 2, chartBottom + 18);
    });

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '11px Arial, sans-serif';
    const legendY = height - 20;
    const legendX = 40;
    const itemSpacing = 95;

    ['S1 Showstopper', 'S2 Critical', 'S3 Major', 'S4 Medium', 'S5 Minor'].forEach((text, i) => {
      const lx = legendX + i * itemSpacing;
      ctx.fillStyle = palette[i];
      ctx.fillRect(lx, legendY - 8, 10, 10);
      ctx.fillStyle = '#374151';
      ctx.fillText(text, lx + 14, legendY);
    });

    return canvas.toDataURL('image/png');
  },

  /**
   * Renders the exact Outlook MSO HTML for Bugs by Severity section
   */
  renderMsoHtml(chartBase64) {
    return `
<h2 style='mso-style-name:"Heading 2";margin-top:12.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold'><span style='font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold;mso-fareast-font-family:"Times New Roman"'>Bugs by Severity<o:p></o:p></span></h2>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><img width=530 height=359 src="${chartBase64}" style='height:3.739in;width:5.52in'></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
`;
  }
};
