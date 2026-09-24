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
   * Sanitizes feature initiative name by removing redundant version prefixes or Jira keys
   * e.g. "BTC v12.6 [IDEA-3110] Intelligent Forms" -> "Intelligent Forms"
   */
  cleanFeatureName(rawName, productVersion = '', ideaKey = '', epicKey = '') {
    if (!rawName) return '';
    let name = rawName.trim();

    // Strip leading product version if repeated (e.g. "BTC v12.6:" or "BTC v12.6")
    if (productVersion) {
      const escapedVer = productVersion.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      name = name.replace(new RegExp(`^${escapedVer}[:\\s-]*`, 'i'), '');
    }
    // General version pattern strip (e.g. "BTC v12.6", "BTOP v12.1.1")
    name = name.replace(/^(BTC|BTOP|BTO)\s*v?\d+(\.\d+)*[:\s-]*/i, '');

    // Strip bracketed or raw keys (loop to catch both IDEA and EPIC if both are present in title)
    for (let i = 0; i < 3; i++) {
      let changed = false;
      if (ideaKey) {
        const escIdea = ideaKey.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const before = name;
        name = name.replace(new RegExp(`^\\[?\\s*${escIdea}\\s*\\]?[:\\s-]*`, 'i'), '');
        if (name !== before) changed = true;
      }
      if (epicKey) {
        const escEpic = epicKey.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const before = name;
        name = name.replace(new RegExp(`^\\[?\\s*${escEpic}\\s*\\]?[:\\s-]*`, 'i'), '');
        if (name !== before) changed = true;
      }
      // Strip any remaining leading bracketed key (e.g. "[IDEA-3110" or "[BPLAT-20767]")
      const beforeKey = name;
      name = name.replace(/^\[?[A-Z]{2,10}-\d+\]?[:\s-]*/i, '');
      if (name !== beforeKey) changed = true;

      // Clean up any remaining leading separators
      name = name.replace(/^[:\s-]+/, '').trim();
      if (!changed) break;
    }

    return name;
  },

  /**
   * Generates the subject line matching Seagull QA rules:
   * 1. Both IDEA and EPIC: Product vX.Y: [IDEA-NNN] - EPIC# - Feature Name - Daily Status - YYYY-MM-DD
   * 2. IDEA only:          Product vX.Y: [IDEA-NNN] Feature Name - Daily Status - YYYY-MM-DD
   * 3. EPIC only:          Product vX.Y: EPIC# - Feature Name - Daily Status - YYYY-MM-DD
   */
  generateSubject(data) {
    const today = new Date().toISOString().split('T')[0];
    const idea = (data.ideaKey || '').trim();
    const epic = (data.epicKey || '').trim();

    const cleanName = this.cleanFeatureName(data.featureName, data.productVersion, idea, epic);
    const finalFeature = cleanName || data.featureName || 'Test Feature';
    const ver = (data.productVersion || '').trim();
    const verPrefix = ver ? `${ver}: ` : '';

    let keySegment = '';
    if (idea && epic) {
      keySegment = `[${idea}] - ${epic} - `;
    } else if (idea) {
      keySegment = `[${idea}] `;
    } else if (epic) {
      keySegment = `${epic} - `;
    }

    return `${verPrefix}${keySegment}${finalFeature} - Daily Status - ${today}`;
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
<p class=MsoNormal style='font-family:"Aptos",sans-serif;font-size:12.0pt;'><o:p>&nbsp;</o:p></p>
<p class=MsoNormal style='margin-bottom:12.0pt;font-family:"Aptos",sans-serif;font-size:12.0pt;'>&lt;your message here!&gt;</p>
`;
  }
};
