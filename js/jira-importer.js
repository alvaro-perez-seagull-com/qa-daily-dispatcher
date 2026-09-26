/**
 * Jira Data Importer & Parser for QA Daily Dispatcher
 * Supports:
 * 1. Direct Clipboard Copy (TSV from Jira table selection - No export files required!)
 * 2. Jira XML / RSS feed (<rss><channel><item>...)
 * 3. Jira JSON search output ({"issues": [...]})
 * 4. HTML table fragments
 * 
 * Auto-detects columns: Type, Key, Summary, Date Created, Severity, Status, # ReOpen, Age.
 * Automatically cleans Jira UI artifacts (like "Copy link", "Duplicate fields info", sort labels).
 */

export const JiraImporter = {
  /**
   * Parse raw text (TSV, XML, JSON, or HTML) into structured defect objects
   */
  parse(rawText) {
    if (!rawText || !rawText.trim()) return [];
    const text = rawText.trim();

    // 1. Check for Jira XML (RSS format: <rss><channel><item>...)
    if (text.startsWith('<?xml') || (text.includes('<rss') && text.includes('<channel>') && text.includes('<item>')) || (text.includes('<item>') && text.includes('<key'))) {
      return this.parseXml(text);
    }

    // 2. Check for Jira JSON (e.g. {"issues": [...]} or [...])
    if ((text.startsWith('{') && text.includes('"issues"')) || (text.startsWith('[') && text.includes('"key"'))) {
      try {
        const parsedJson = JSON.parse(text);
        const issues = Array.isArray(parsedJson) ? parsedJson : (parsedJson.issues || []);
        if (issues.length > 0) {
          return this.parseJsonIssues(issues);
        }
      } catch (e) {
        // Not valid JSON, continue to other parsers
      }
    }

    // 3. Check for HTML table fragment
    if (text.includes('<table') || (text.includes('<tr') && text.includes('<td'))) {
      return this.parseHtmlTable(text);
    }

    // 4. Tab-Separated Values (TSV from browser table copy) or Line-by-line selection
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const hasTabs = lines.some(l => l.includes('\t'));
    if (hasTabs) {
      const tsvBugs = this.parseTsv(lines);
      if (tsvBugs.length > 0) {
        return tsvBugs;
      }
    }

    return this.parseLinearTokens(lines);
  },

  /**
   * Parse Jira XML (RSS format from Jira "Export XML")
   */
  parseXml(xmlText) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const items = Array.from(doc.querySelectorAll('item'));
      if (items.length === 0) return [];

      return items.map(item => {
        const key = item.querySelector('key')?.textContent?.trim() || '';
        const summary = item.querySelector('summary')?.textContent?.trim() || '';
        const type = item.querySelector('type')?.textContent?.trim() || 'Bug';
        const status = item.querySelector('status')?.textContent?.trim() || 'Open';
        const createdRaw = item.querySelector('created')?.textContent?.trim() || '';

        // Extract custom fields: Age and Severity
        let age = null;
        let severity = 'SEV 4 (Medium)';
        const customFields = Array.from(item.querySelectorAll('customfield'));
        customFields.forEach(cf => {
          const name = cf.querySelector('customfieldname')?.textContent?.trim()?.toLowerCase();
          const val = cf.querySelector('customfieldvalues customfieldvalue')?.textContent?.trim();
          if (name === 'age' && val) {
            const floatVal = parseFloat(val);
            if (!isNaN(floatVal)) {
              age = Math.max(0, floatVal);
            }
          } else if (name === 'severity' && val) {
            severity = this.normalizeSeverity(val);
          }
        });

        const dateCreated = this.normalizeDate(createdRaw);
        if (age === null || isNaN(age)) {
          age = this.calculateAgeFallback(dateCreated);
        }

        return {
          type,
          key: key.toUpperCase(),
          url: `https://mojixinc.atlassian.net/browse/${key.toUpperCase()}`,
          summary,
          dateCreated,
          severity,
          status: this.normalizeStatus(status),
          reopened: 0,
          age
        };
      }).filter(b => b.key);
    } catch (err) {
      console.warn('Failed to parse Jira XML:', err);
      return [];
    }
  },

  /**
   * Parse Jira JSON issues
   */
  parseJsonIssues(issues) {
    return issues.map(item => {
      const key = (item.key || '').toUpperCase();
      const fields = item.fields || {};
      const type = fields.issuetype?.name || item.type || 'Bug';
      const summary = fields.summary || item.summary || '';
      const createdRaw = fields.created || item.created || '';
      const dateCreated = this.normalizeDate(createdRaw);
      const status = fields.status?.name || item.status || 'Open';

      // Severity (customfield_10700 or severity field)
      const sevRaw = fields.customfield_10700?.value || fields.severity?.value || fields.severity || item.severity;
      const severity = this.normalizeSeverity(sevRaw);

      // Age (customfield_18008 or age field)
      let age = null;
      const ageRaw = fields.customfield_18008 || item.age;
      if (ageRaw !== undefined && ageRaw !== null && ageRaw !== '') {
        const floatVal = parseFloat(String(ageRaw));
        if (!isNaN(floatVal)) age = Math.max(0, floatVal);
      }
      if (age === null) {
        age = this.calculateAgeFallback(dateCreated);
      }

      return {
        type,
        key,
        url: `https://mojixinc.atlassian.net/browse/${key}`,
        summary,
        dateCreated,
        severity,
        status: this.normalizeStatus(status),
        reopened: 0,
        age
      };
    }).filter(b => b.key);
  },

  /**
   * Parse TSV lines copied directly from the Jira search results table
   */
  parseTsv(lines) {
    const rawRows = lines.map(line => line.split('\t').map(c => this.cleanJiraCellText(c)));
    if (rawRows.length === 0) return [];

    // Filter out completely empty rows
    const rows = rawRows.filter(r => r.some(cell => cell.length > 0));
    if (rows.length === 0) return [];

    // Detect header mapping from first row
    const headerMapping = this.detectHeaderMapping(rows[0]);
    let startIndex = 0;
    let mapping = headerMapping;

    if (headerMapping && headerMapping.hasHeader) {
      startIndex = 1;
    } else {
      // No standard header row; evaluate column positions heuristically
      mapping = this.detectRowHeuristics(rows[0]);
    }

    const bugs = [];
    for (let i = startIndex; i < rows.length; i++) {
      const bug = this.mapCellsToBug(rows[i], mapping);
      if (bug && bug.key) {
        bugs.push(bug);
      }
    }

    return bugs;
  },

  /**
   * Parse linear token lines copied directly from Jira Cloud UI selection
   * Handles modern Jira where cells are rendered as separate DOM text nodes/lines
   */
  parseLinearTokens(lines) {
    const cleanLines = lines.map(l => this.cleanJiraCellText(l)).filter(l => l.length > 0);
    if (cleanLines.length === 0) return [];

    const keyIndices = [];
    cleanLines.forEach((line, idx) => {
      const key = this.extractJiraKey(line);
      if (key) {
        keyIndices.push({ key, idx });
      }
    });

    if (keyIndices.length === 0) return [];

    const bugs = [];
    for (let i = 0; i < keyIndices.length; i++) {
      const current = keyIndices[i];
      const nextIdx = (i + 1 < keyIndices.length) ? keyIndices[i + 1].idx : cleanLines.length;
      const key = current.key;

      // Check type before key
      let type = 'Bug';
      if (current.idx > 0) {
        const prev = cleanLines[current.idx - 1];
        if (/^(Bug|Defect|Task|Story|Improvement)$/i.test(prev)) {
          type = prev;
        }
      }

      // Tokens between current.idx and nextIdx
      const tokens = cleanLines.slice(current.idx + 1, nextIdx);

      let summary = '';
      let dateCreated = '';
      let severity = 'SEV 4 (Medium)';
      let status = 'Open';
      let reopened = 0;
      let age = null;

      tokens.forEach(tok => {
        // Skip pagination or UI text like "1 of 1" or "More actions"
        if (/^\d+\s+of\s+\d+$/i.test(tok) || /actions/i.test(tok) || /configure/i.test(tok)) return;

        // Date Created
        if (!dateCreated && this.isValidDateString(tok)) {
          dateCreated = this.normalizeDate(tok);
          return;
        }

        // Severity
        if (/sev\s*[1-5]/i.test(tok) || /\b(Showstopper|Critical|Major|Medium|Minor)\b/i.test(tok)) {
          severity = this.normalizeSeverity(tok);
          return;
        }

        // Status
        if (/\b(Open|In Progress|Ready for QA|Resolved|Closed|Done|To Do)\b/i.test(tok)) {
          status = this.normalizeStatus(tok);
          return;
        }

        // Reopen / Number
        if (/^none$/i.test(tok)) {
          reopened = 0;
          return;
        }

        // Age / Numeric float or int (e.g. 0.8, 1.5, 4)
        if (/^\d+(\.\d+)?\s*(d(ays)?)?$/i.test(tok)) {
          const num = parseFloat(tok);
          if (!isNaN(num)) {
            age = Math.max(0, num);
          }
          return;
        }

        // Summary (longest descriptive string)
        if (!summary && tok.length > 5 && !tok.startsWith('http')) {
          summary = tok;
        }
      });

      if (!summary) summary = `${key} defect item`;
      if (!dateCreated) dateCreated = this.getLocalIsoDate() + 'T00:00:00';
      if (age === null || isNaN(age)) age = this.calculateAgeFallback(dateCreated);

      bugs.push({
        type,
        key,
        url: `https://mojixinc.atlassian.net/browse/${key}`,
        summary,
        dateCreated,
        severity,
        status,
        reopened,
        age
      });
    }

    return bugs;
  },

  /**
   * Parse HTML table fragment copied from browser
   */
  parseHtmlTable(htmlStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, 'text/html');
    const trs = Array.from(doc.querySelectorAll('tr'));
    if (trs.length === 0) return [];

    const rows = trs.map(tr => {
      return Array.from(tr.querySelectorAll('th, td')).map(td => this.cleanJiraCellText(td.textContent));
    }).filter(r => r.some(cell => cell.length > 0));

    if (rows.length === 0) return [];

    const headerMapping = this.detectHeaderMapping(rows[0]);
    let startIndex = 0;
    let mapping = headerMapping;

    if (headerMapping && headerMapping.hasHeader) {
      startIndex = 1;
    } else {
      mapping = this.detectRowHeuristics(rows[0]);
    }

    const bugs = [];
    for (let i = startIndex; i < rows.length; i++) {
      const bug = this.mapCellsToBug(rows[i], mapping);
      if (bug && bug.key) {
        bugs.push(bug);
      }
    }

    return bugs;
  },

  /**
   * Strips Jira UI noise from copied cell text:
   * e.g. "More actions for ...", "Duplicate fields info ...", "Copy link", "Sort ...", etc.
   */
  cleanJiraCellText(rawText) {
    if (!rawText) return '';
    let text = String(rawText).trim();

    // Remove sorting metadata
    text = text.replace(/•\s*Sort(ed)?\s+[^•\n]*/gi, '');
    text = text.replace(/More actions for [A-Z0-9_-]+/gi, '');
    text = text.replace(/More actions for Work/gi, '');
    text = text.replace(/Duplicate fields info [A-Z0-9_-]+ Severity/gi, '');
    text = text.replace(/Configure columns/gi, '');

    return text.trim();
  },

  /**
   * Detect column positions from header names
   */
  detectHeaderMapping(headers) {
    const mapping = {
      hasHeader: false,
      type: -1,
      key: -1,
      summary: -1,
      dateCreated: -1,
      severity: -1,
      status: -1,
      reopened: -1,
      age: -1
    };

    let matchedHeaderCount = 0;

    headers.forEach((h, idx) => {
      const raw = String(h || '').trim();
      // Headers are concise column titles (< 40 chars), never long bug summaries
      if (raw.length === 0 || raw.length > 40) return;

      const clean = raw.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (clean === 'type' || clean === 'issuetype' || clean === 't') {
        mapping.type = idx;
        matchedHeaderCount++;
      } else if (clean === 'key' || clean === 'issuekey' || clean === 'id' || clean === 'issueid') {
        mapping.key = idx;
        matchedHeaderCount++;
      } else if (clean === 'summary' || clean === 'description' || clean === 'work' || clean === 'workitem' || clean === 'workitems' || clean.includes('summary')) {
        // Jira's modern search results label the column "Work" (which contains Key + Summary)
        mapping.summary = idx;
        if (mapping.key === -1) mapping.key = idx;
        matchedHeaderCount++;
      } else if (clean === 'created' || clean === 'datecreated' || clean.includes('created')) {
        mapping.dateCreated = idx;
        matchedHeaderCount++;
      } else if (clean === 'severity' || clean === 'priority' || clean === 'sev' || clean.includes('severity')) {
        mapping.severity = idx;
        matchedHeaderCount++;
      } else if (clean === 'status' || clean.includes('status')) {
        mapping.status = idx;
        matchedHeaderCount++;
      } else if (clean === 'reopen' || clean === 'reopened' || clean.includes('reopen')) {
        mapping.reopened = idx;
        matchedHeaderCount++;
      } else if (clean === 'age' || clean.includes('age')) {
        mapping.age = idx;
        matchedHeaderCount++;
      }
    });

    // Only classify as a genuine header row if at least 2 recognized header columns match
    mapping.hasHeader = matchedHeaderCount >= 2;
    return mapping;
  },

  /**
   * Validates and extracts a Jira issue key while rejecting CSS/system prefixes (e.g. PANOSE-1, UTF-8)
   */
  extractJiraKey(str) {
    if (!str) return null;
    const match = String(str).match(/\b([A-Z]{2,10})-(\d+)\b/i);
    if (!match) return null;
    const prefix = match[1].toUpperCase();
    const disallowed = ['PANOSE', 'UTF', 'ISO', 'LEVEL', 'PAGE', 'FONT', 'WIN', 'HTTP', 'HTTPS', 'HTML', 'RGB', 'RGBA', 'PT', 'PX'];
    if (disallowed.includes(prefix)) return null;
    return `${prefix}-${match[2]}`;
  },

  /**
   * Heuristic fallback when header row was not highlighted in the copied text
   */
  detectRowHeuristics(cells) {
    const mapping = {
      hasHeader: false,
      type: -1,
      key: -1,
      summary: -1,
      dateCreated: -1,
      severity: -1,
      status: -1,
      reopened: -1,
      age: -1
    };

    cells.forEach((val, idx) => {
      const clean = val.trim();
      if (!clean) return;

      // Key pattern (e.g. BPLAT-23199)
      const detectedKey = this.extractJiraKey(clean);
      if (mapping.key === -1 && detectedKey) {
        mapping.key = idx;
        if (clean.length > 20) {
          mapping.summary = idx;
        }
        return;
      }

      // Type
      if (mapping.type === -1 && /^(Bug|Defect|Task|Story|Sub-task|Improvement)$/i.test(clean)) {
        mapping.type = idx;
        return;
      }

      // Severity pattern
      if (mapping.severity === -1 && /sev\s*[1-5]/i.test(clean)) {
        mapping.severity = idx;
        return;
      }

      // Status
      if (mapping.status === -1 && /^(Open|In Progress|Ready for QA|Resolved|Closed|Done|To Do)$/i.test(clean)) {
        mapping.status = idx;
        return;
      }

      // Date Created
      if (mapping.dateCreated === -1 && this.isValidDateString(clean)) {
        mapping.dateCreated = idx;
        return;
      }

      // Age (float or integer, e.g. 0.8 or 14)
      if (/^\d+(\.\d+)?\s*(d(ays)?)?$/i.test(clean)) {
        if (mapping.age === -1 && idx > (mapping.status !== -1 ? mapping.status : 3)) {
          mapping.age = idx;
        } else if (mapping.reopened === -1) {
          mapping.reopened = idx;
        }
        return;
      }

      // Longer descriptive text
      if (mapping.summary === -1 && clean.length > 15 && !clean.startsWith('http')) {
        mapping.summary = idx;
      }
    });

    return mapping;
  },

  /**
   * Maps an array of row cell strings to a structured defect object
   */
  mapCellsToBug(cells, mapping) {
    if (!cells || cells.length === 0) return null;

    let key = '';
    let summaryCellText = '';

    // Extract Key
    if (mapping.key !== -1 && cells[mapping.key]) {
      const detected = this.extractJiraKey(cells[mapping.key]);
      if (detected) {
        key = detected;
        summaryCellText = cells[mapping.key];
      }
    }

    if (!key) {
      for (const c of cells) {
        const detected = this.extractJiraKey(c);
        if (detected) {
          key = detected;
          summaryCellText = c;
          break;
        }
      }
    }

    if (!key) return null;

    // Type
    let type = 'Bug';
    if (mapping.type !== -1 && cells[mapping.type]) {
      type = cells[mapping.type];
    } else {
      for (const c of cells) {
        if (/^(Bug|Defect|Task|Story|Improvement)$/i.test(c)) {
          type = c;
          break;
        }
      }
    }

    // Summary - Clean out "Copy link" and the Key prefix from cell
    let summary = 'Defect summary';
    if (mapping.summary !== -1 && cells[mapping.summary] && mapping.summary !== mapping.key) {
      summary = cells[mapping.summary];
    } else if (summaryCellText) {
      summary = summaryCellText;
    }

    // Clean Key and "Copy link" from summary string
    summary = summary.replace(new RegExp(`${key}\\s*Copy\\s*link\\s*`, 'gi'), '');
    summary = summary.replace(new RegExp(`^${key}\\s*`, 'gi'), '');
    summary = summary.replace(/Copy\s*link/gi, '');
    summary = summary.trim();
    if (!summary) summary = `${key} defect item`;

    // Date Created
    let dateCreated = '';
    if (mapping.dateCreated !== -1 && cells[mapping.dateCreated]) {
      dateCreated = this.normalizeDate(cells[mapping.dateCreated]);
    } else {
      for (const c of cells) {
        if (this.isValidDateString(c)) {
          dateCreated = this.normalizeDate(c);
          break;
        }
      }
    }
    if (!dateCreated) {
      dateCreated = this.getLocalIsoDate() + 'T00:00:00';
    }

    // Severity - Strict matching (never match arbitrary numbers)
    let severity = 'SEV 4 (Medium)';
    if (mapping.severity !== -1 && cells[mapping.severity]) {
      severity = this.normalizeSeverity(cells[mapping.severity]);
    } else {
      for (const c of cells) {
        if (/sev\s*[1-5]/i.test(c) || /\b(Showstopper|Critical|Major|Medium|Minor)\b/i.test(c)) {
          severity = this.normalizeSeverity(c);
          break;
        }
      }
    }

    // Status
    let status = 'Open';
    if (mapping.status !== -1 && cells[mapping.status]) {
      status = this.normalizeStatus(cells[mapping.status]);
    } else {
      for (const c of cells) {
        if (/\b(Open|In Progress|Ready for QA|Resolved|Closed)\b/i.test(c)) {
          status = this.normalizeStatus(c);
          break;
        }
      }
    }

    // Reopened
    let reopened = 0;
    if (mapping.reopened !== -1 && cells[mapping.reopened]) {
      const parsedReopen = parseInt(cells[mapping.reopened], 10);
      if (!isNaN(parsedReopen)) reopened = parsedReopen;
    }

    // Age (supports decimal values like 0.8)
    let age = null;
    if (mapping.age !== -1 && cells[mapping.age] !== undefined && cells[mapping.age] !== '') {
      const rawAgeStr = String(cells[mapping.age]).replace(/[^\d.]/g, '');
      const parsedAge = parseFloat(rawAgeStr);
      if (!isNaN(parsedAge)) {
        age = Math.max(0, parsedAge);
      }
    }

    if (age === null || isNaN(age)) {
      age = this.calculateAgeFallback(dateCreated);
    }

    return {
      type,
      key,
      url: `https://mojixinc.atlassian.net/browse/${key}`,
      summary,
      dateCreated,
      severity,
      status,
      reopened,
      age
    };
  },

  /**
   * Normalizes severity strictly based on SEV 1-5 or explicit keywords
   */
  normalizeSeverity(raw) {
    if (!raw) return 'SEV 4 (Medium)';
    const text = String(raw).trim();

    const sevMatch = text.match(/sev\s*([1-5])/i);
    if (sevMatch) {
      const num = parseInt(sevMatch[1], 10);
      switch (num) {
        case 1: return 'SEV 1 (Showstopper)';
        case 2: return 'SEV 2 (Critical)';
        case 3: return 'SEV 3 (Major)';
        case 4: return 'SEV 4 (Medium)';
        case 5: return 'SEV 5 (Minor)';
      }
    }

    if (/\b(showstopper|highest)\b/i.test(text)) return 'SEV 1 (Showstopper)';
    if (/\b(critical|blocker)\b/i.test(text)) return 'SEV 2 (Critical)';
    if (/\b(major|high)\b/i.test(text)) return 'SEV 3 (Major)';
    if (/\b(medium)\b/i.test(text)) return 'SEV 4 (Medium)';
    if (/\b(minor|low|lowest)\b/i.test(text)) return 'SEV 5 (Minor)';

    return 'SEV 4 (Medium)';
  },

  /**
   * Normalizes Jira status strings
   */
  normalizeStatus(raw) {
    if (!raw) return 'Open';
    const text = String(raw).trim();
    if (/closed/i.test(text)) return 'Closed';
    if (/resolved/i.test(text)) return 'Resolved';
    if (/in\s*progress/i.test(text)) return 'In Progress';
    if (/ready\s*for\s*qa/i.test(text)) return 'Ready for QA';
    if (/open|to\s*do|reopened/i.test(text)) return 'Open';
    return text;
  },

  /**
   * Validates if string looks like a date
   */
  isValidDateString(val) {
    if (!val || typeof val !== 'string') return false;
    const clean = val.trim();
    if (/^\d+$/.test(clean)) return false; // Reject pure digits
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return true;
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(clean)) return true;
    if (/[0-9]{1,2}\/[a-z]{3}\/[0-9]{2,4}/i.test(clean)) return true;
    if (/[a-z]{3}\s+\d{1,2},\s+\d{4}/i.test(clean)) return true;
    return false;
  },

  /**
   * Normalizes date to ISO format YYYY-MM-DDTHH:mm:ss
   */
  normalizeDate(raw) {
    if (!raw) return '';
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }
    } catch (e) {}

    // Match MM/DD/YYYY
    const match = String(raw).match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (match) {
      let y = parseInt(match[3], 10);
      if (y < 100) y += 2000;
      const m = String(parseInt(match[1], 10)).padStart(2, '0');
      const d = String(parseInt(match[2], 10)).padStart(2, '0');
      return `${y}-${m}-${d}T00:00:00`;
    }

    return raw;
  },

  /**
   * Fallback age calculation in days
   */
  calculateAgeFallback(dateCreated) {
    if (!dateCreated) return 0;
    const created = new Date(dateCreated);
    if (isNaN(created.getTime())) return 0;
    const diff = Math.max(0, new Date().getTime() - created.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * Returns current local date in YYYY-MM-DD format (local browser timezone)
   */
  getLocalIsoDate(date = new Date()) {
    const d = (date instanceof Date && !isNaN(date.getTime())) ? date : new Date(date || Date.now());
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};
