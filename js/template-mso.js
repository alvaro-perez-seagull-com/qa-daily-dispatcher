import { SectionIntro } from './section-intro.js?v=15';
import { SectionSummary } from './section-summary.js?v=15';
import { SectionScorecard } from './section-scorecard.js?v=15';
import { SectionBugsChart } from './section-bugs-chart.js?v=15';
import { SectionBugsList } from './section-bugs-list.js?v=15';
import { SectionLinks } from './section-links.js?v=15';

/**
 * Master Template Assembler
 * Assembles all modular sections into a rigid Microsoft Word / Outlook MSO HTML document.
 */
export const TemplateMso = {
  /**
   * Assembles the full, rigid MSO HTML email
   */
  assembleEmailHtml(state) {
    // 1. Process Bug Data & Severity Counts with calculated ages
    const severityCounts = SectionBugsList.getSeverityCounts(state.bugs || [], state.referenceDate || new Date());

    // 2. Generate Chart & Scorecard Images (offscreen Canvas)
    const chartBase64 = SectionBugsChart.generateChartImage(severityCounts);
    const scoreMetrics = SectionScorecard.computeQualityScore({
      storyPoints: state.scorecardParams?.storyPoints || 22,
      reopened: state.scorecardParams?.reopened || 0,
      closed: state.scorecardParams?.closed || 0,
      severityCounts
    });
    const scorecardBase64 = SectionScorecard.generateScorecardImage(scoreMetrics);

    // 3. Render HTML blocks from each module
    const introHtml = SectionIntro.renderMsoHtml(state.introData);
    const summaryHtml = SectionSummary.renderMsoHtml(state.cycles);
    const scorecardHtml = SectionScorecard.renderMsoHtml(scorecardBase64);
    const chartHtml = SectionBugsChart.renderMsoHtml(chartBase64);
    const bugsListHtml = SectionBugsList.renderMsoHtml(state.bugs, state.referenceDate || new Date());
    const linksHtml = SectionLinks.renderMsoHtml(state.links);

    // 4. Wrap with full Word 15 MSO Header & Schema
    return `<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
xmlns="http://www.w3.org/TR/REC-html40">

<head>
<meta http-equiv=Content-Type content="text/html; charset=windows-1252">
<meta name=ProgId content=Word.Document>
<meta name=Generator content="Microsoft Word 15">
<meta name=Originator content="Microsoft Word 15">
<!--[if !mso]>
<style>
v\\:* {behavior:url(#default#VML);}
o\\:* {behavior:url(#default#VML);}
w\\:* {behavior:url(#default#VML);}
.shape {behavior:url(#default#VML);}
</style>
<![endif]-->
<style>
<!--
 /* Font Definitions */
 @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4;}
 @font-face {font-family:Aptos;}
 @font-face {font-family:"Aptos Display";}
 @font-face {font-family:Roboto;}
 @font-face {font-family:Arial;}
 /* Style Definitions */
 p.MsoNormal, li.MsoNormal, div.MsoNormal
	{margin:0in; font-size:12.0pt; font-family:"Aptos",sans-serif;}
 h2
	{margin-top:8.0pt; margin-right:0in; margin-bottom:4.0pt; margin-left:0in;
	font-size:16.0pt; font-family:"Aptos Display",sans-serif; color:#0F4761; font-weight:normal;}
 a:link, span.MsoHyperlink {color:#467886; text-decoration:underline;}
 a:visited, span.MsoHyperlinkFollowed {color:#96607D; text-decoration:underline;}
 p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph
	{margin-top:0in; margin-right:0in; margin-bottom:0in; margin-left:.5in;
	font-size:12.0pt; font-family:"Aptos",sans-serif;}
 table.MsoNormalTable
	{font-size:10.0pt; font-family:"Times New Roman",serif;}
 @page WordSection1 {size:8.5in 11.0in; margin:1.0in 1.0in 1.0in 1.0in;}
 div.WordSection1 {page:WordSection1;}
-->
</style>
</head>

<body lang=EN-US link="#467886" vlink="#96607D" style='tab-interval:.5in; word-wrap:break-word'>
<div class=WordSection1>

${introHtml}
${summaryHtml}
${scorecardHtml}
${chartHtml}
${bugsListHtml}
${linksHtml}

</div>
</body>
</html>`;
  }
};
