/**
 * Section: Intro & Message Header
 * Manages sender, distribution list, subject line, and opening sentence.
 */
export const SectionIntro = {
  defaultData: {
    senderName: "Alvaro Perez",
    senderEmail: "aperez@seagullsoftware.com",
    sentDate: new Date(),
    toRecipients: [],
    ccRecipients: [],
    productVersion: "BTC v12.6",
    ideaKey: "IDEA-3110",
    epicKey: "BPLAT-20767",
    featureName: "Intelligent Forms: Refreshable Print Preview",
    executionStartDate: "09/22/2026"
  },

  /**
   * Generates the subject line
   * e.g.: BTC v12.6: [IDEA-3110] Intelligent Forms: Refreshable Print Preview - Daily Status - 2026-09-23
   */
  generateSubject(data) {
    const today = new Date().toISOString().split('T')[0];
    const keys = [data.ideaKey, data.epicKey].filter(k => k && k.trim()).join(' / ');
    const prefix = keys ? `[${keys}] ` : '';
    return `${data.productVersion}: ${prefix}${data.featureName} - Daily Status - ${today}`;
  },

  /**
   * Formats the sent date header in Outlook style
   * e.g.: Wednesday, September 23, 2026 10:53 AM
   */
  formatSentDate(date = new Date()) {
    const d = (date instanceof Date && !isNaN(date)) ? date : new Date(date || Date.now());
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    return d.toLocaleDateString('en-US', options);
  },

  /**
   * Renders the MSO HTML Header & Opening Paragraphs
   */
  renderMsoHtml(data) {
    const sentDateStr = this.formatSentDate(data.sentDate || new Date());
    const subject = this.generateSubject(data);
    const toRecipients = data.toRecipients || [];
    const ccRecipients = data.ccRecipients || [];
    const hasRecipients = toRecipients.length > 0 || ccRecipients.length > 0;

    let headerBlock = '';
    if (hasRecipients) {
      const toStr = toRecipients.join('; ');
      const ccStr = ccRecipients.join('; ');
      headerBlock = `
<p class=MsoNormal style='margin-left:120.0pt;text-indent:-120.0pt;tab-stops:120.0pt;mso-layout-grid-align:none;text-autospace:none'><b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>From:<span style='mso-tab-count:1'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>${data.senderName}<o:p></o:p></span></p>

<p class=MsoNormal style='margin-left:120.0pt;text-indent:-120.0pt;tab-stops:120.0pt;mso-layout-grid-align:none;text-autospace:none'><b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>Sent:<span style='mso-tab-count:1'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>${sentDateStr}<o:p></o:p></span></p>

${toStr ? `<p class=MsoNormal style='margin-left:120.0pt;text-indent:-120.0pt;tab-stops:120.0pt;mso-layout-grid-align:none;text-autospace:none'><b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>To:<span style='mso-tab-count:1'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>${toStr}<o:p></o:p></span></p>` : ''}

${ccStr ? `<p class=MsoNormal style='margin-left:120.0pt;text-indent:-120.0pt;tab-stops:120.0pt;mso-layout-grid-align:none;text-autospace:none'><b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>Cc:<span style='mso-tab-count:1'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>${ccStr}<o:p></o:p></span></p>` : ''}

<p class=MsoNormal style='margin-left:120.0pt;text-indent:-120.0pt;tab-stops:120.0pt;mso-layout-grid-align:none;text-autospace:none'><b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>Subject:<span style='mso-tab-count:1'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></b><span style='font-size:11.0pt;font-family:"Calibri",sans-serif;color:black'>${subject}<o:p></o:p></span></p>
`;
    }

    return `
${headerBlock}

<p class=MsoNormal style='font-family:"Aptos",sans-serif;font-size:12.0pt;'>Team,</p>
<p class=MsoNormal style='margin-bottom:12.0pt;font-family:"Aptos",sans-serif;font-size:12.0pt;'>&lt;your message here!&gt;</p>
`;
  }
};
