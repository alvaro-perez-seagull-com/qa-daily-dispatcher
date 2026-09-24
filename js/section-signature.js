/**
 * Section: Email Signature Block
 * Renders the official Seagull Software signature table and branding.
 */
export const SectionSignature = {
  defaultSignature: {
    name: "Alvaro Perez",
    title: "QA Engineer  |  Seagull",
    website: "seagullsoftware.com",
    websiteUrl: "https://seagullsoftware.com",
    // Clean inline SVG logo fallback matching Seagull icon
    logoBase64: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjEyIiBmaWxsPSIjMDYxOTJFIi8+PHBhdGggZD0iTTI1IDYwQzM1IDQ1IDQ1IDQ1IDU1IDU1QzY1IDQ1IDc1IDQ1IDg1IDYwIiBzdHJva2U9IiMyMzg4RkYiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTMwIDcwQzM4IDU4IDQ2IDU4IDU1IDY2QzY0IDU4IDcyIDU4IDgwIDcwIiBzdHJva2U9IiMwMEMwRkYiIHN0cm9rZS13aWR0aD0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },

  /**
   * Renders the exact Outlook MSO HTML Table for Signature
   */
  renderMsoHtml(sig = {}) {
    const name = sig.name || this.defaultSignature.name;
    const title = sig.title || this.defaultSignature.title;
    const website = sig.website || this.defaultSignature.website;
    const websiteUrl = sig.websiteUrl || this.defaultSignature.websiteUrl;
    const logoSrc = sig.logoBase64 || this.defaultSignature.logoBase64;

    return `
<table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0
 style='mso-cellspacing:0in;mso-yfti-tbllook:1184;mso-padding-alt:0in 0in 0in 0in'>
 <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes;mso-yfti-lastrow:yes;height:69.4pt'>
  <td width=97 valign=top style='width:72.55pt;padding:0in 5.4pt 0in 5.4pt;height:69.4pt'>
  <p class=MsoNormal><img border=0 width=100 height=89 src="${logoSrc}" style='height:.927in;width:1.041in' alt="seagullsoftware.com"></p>
  </td>
  <td width=408 valign=top style='width:306.1pt;padding:0in 5.4pt 0in 5.4pt;height:69.4pt'>
  <p class=MsoNormal><b>${name}</b></p>
  <p class=MsoNormal><b>${title}</b><span style='font-size:11.0pt'><o:p></o:p></span></p>
  <p class=MsoNormal><span style='color:#467886'><a href="${websiteUrl}">${website}</a>&nbsp;</span><span style='font-size:11.0pt'><o:p></o:p></span></p>
  </td>
 </tr>
</table>
<p class=MsoNormal><span style='font-size:10.0pt;font-family:"Arial",sans-serif'>&nbsp;</span></p>
`;
  }
};
