/**
 * Section: Links
 * Manages direct links to the IDEA, Epic, and pre-filtered Jira bug search.
 * Automatically constructs the Atlassian URLs from keys.
 */
export const SectionLinks = {
  defaultLinks: {
    ideaKey: "IDEA-3110",
    epicKey: "BPLAT-20767",
    filterUrl: "https://mojixinc.atlassian.net/issues?filter=26711&jql=type%20IN%20(Improvement%2C%20Bug)%20and%20Project%20%3D%20%22Bartender%20Platform%22%20and%20labels%20IN%20(IDEA-3110)%20and%20status%20!%3D%20Invalid%20AND%20affectedVersion%20%3D%20%22BTC%20v12.6%22%0AORDER%20BY%20%22cf%5B10700%5D%22%20ASC%2C%20fixVersion%20DESC%2C%20created%20ASC"
  },

  /**
   * Constructs the canonical Jira Browse URL for any issue key
   */
  getJiraBrowseUrl(key) {
    if (!key) return null;
    const cleanKey = key.trim().toUpperCase();
    return `https://mojixinc.atlassian.net/browse/${cleanKey}`;
  },

  /**
   * Generates the Jira bug filter search URL based on key and product version.
   * Priority: IDEA key > Epic key
   */
  generateFilterUrl(key, productVersion = 'BTC v12.6') {
    if (!key || !key.trim()) return '';
    const cleanKey = key.trim().toUpperCase();
    const cleanVer = (productVersion || 'BTC v12.6').trim();
    const jql = `type IN (Improvement, Bug) and Project = "Bartender Platform" and labels IN (${cleanKey}) and status != Invalid AND affectedVersion = "${cleanVer}"\nORDER BY "cf[10700]" ASC, fixVersion DESC, created ASC`;
    return `https://mojixinc.atlassian.net/issues?filter=26711&jql=${encodeURIComponent(jql)}`;
  },

  /**
   * Returns a shortened base domain/filter URL for display to prevent multi-line wrapping
   */
  getShortFilterDisplayUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url);
      const filterId = u.searchParams.get('filter');
      if (filterId) {
        return `${u.origin}${u.pathname}?filter=${filterId}`;
      }
      return `${u.origin}${u.pathname}`;
    } catch {
      const idx = url.indexOf('&jql=');
      if (idx !== -1) return url.substring(0, idx);
      return url;
    }
  },

  /**
   * Renders the exact Outlook MSO HTML for Links section
   * Dynamically includes IDEA link, Epic link, and List of Bugs based on user input.
   */
  renderMsoHtml(links = {}) {
    const listItems = [];

    // IDEA URL (only if IDEA key provided)
    if (links.ideaKey && links.ideaKey.trim()) {
      const ideaUrl = this.getJiraBrowseUrl(links.ideaKey);
      if (ideaUrl) {
        listItems.push(`<li class=MsoListParagraph style='margin-left:0in;mso-list:l0 level1 lfo3'><span style='mso-fareast-font-family:"Times New Roman"'>IDEA: <a href="${ideaUrl}" target="_blank" rel="noopener noreferrer">${ideaUrl}</a><o:p></o:p></span></li>`);
      }
    }

    // EPIC URL (only if EPIC key provided)
    if (links.epicKey && links.epicKey.trim()) {
      const epicUrl = this.getJiraBrowseUrl(links.epicKey);
      if (epicUrl) {
        listItems.push(`<li class=MsoListParagraph style='margin-left:0in;mso-list:l0 level1 lfo3'><span style='mso-fareast-font-family:"Times New Roman"'>EPIC: <a href="${epicUrl}" target="_blank" rel="noopener noreferrer">${epicUrl}</a><o:p></o:p></span></li>`);
      }
    }

    // List of Bugs URL (from generated Jira filter) - shortened display text, full href
    const filterUrl = (links.filterUrl && links.filterUrl.trim()) ? links.filterUrl.trim() : '';
    if (filterUrl) {
      const displayUrl = this.getShortFilterDisplayUrl(filterUrl);
      listItems.push(`<li class=MsoListParagraph style='margin-left:0in;mso-list:l0 level1 lfo3'><span style='mso-fareast-font-family:"Times New Roman"'>List of Bugs: <a href="${filterUrl}" target="_blank" rel="noopener noreferrer">${displayUrl}</a><o:p></o:p></span></li>`);
    }

    if (listItems.length === 0) {
      return '';
    }

    return `
<h2 style='mso-style-name:"Heading 2";margin-top:12.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold'><span style='font-size:15.0pt;font-family:"Segoe UI",Arial,sans-serif;color:#0F4761;font-weight:bold;mso-fareast-font-family:"Times New Roman"'>Links<o:p></o:p></span></h2>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>

<ul style='margin-top:0in' type=disc>
 ${listItems.join('\n ')}
</ul>

<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p><o:p>&nbsp;</o:p></p>
`;
  }
};
