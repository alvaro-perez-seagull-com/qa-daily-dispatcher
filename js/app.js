import { SectionIntro } from './section-intro.js?v=32';
import { SectionSummary } from './section-summary.js?v=32';
import { SectionScorecard } from './section-scorecard.js?v=32';
import { SectionBugsChart } from './section-bugs-chart.js?v=32';
import { SectionBugsList } from './section-bugs-list.js?v=32';
import { SectionLinks } from './section-links.js?v=32';
import { TemplateMso } from './template-mso.js?v=32';
import { ClipboardHelper } from './clipboard.js?v=32';
import { JiraImporter } from './jira-importer.js?v=32';

const STORAGE_KEY = 'seagull_dispatcher_v1';

// Initial Application State
const state = {
  introData: { ...SectionIntro.defaultData },
  cycles: JSON.parse(JSON.stringify(SectionSummary.defaultCycles)),
  bugs: JSON.parse(JSON.stringify(SectionBugsList.defaultBugs)),
  links: { ...SectionLinks.defaultLinks },
  scorecardParams: { ...SectionScorecard.defaultConfig }
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Load saved configuration from localStorage
function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.introData) Object.assign(state.introData, parsed.introData);
      if (parsed.cycles) {
        state.cycles = parsed.cycles.map(c => {
          // Keep productVersion strictly synchronized with introData
          c.productVersion = state.introData.productVersion || c.productVersion || 'BTC v12.6';
          // Ensure cycleKey and cycleUrl are resolved if area has a key
          if (!c.cycleKey && c.area) {
            const defaultProj = (state.introData.epicKey || state.introData.ideaKey || 'BPLAT').split('-')[0] || 'BPLAT';
            const k = SectionSummary.extractCycleKey(c.area, defaultProj);
            if (k) {
              c.cycleKey = k;
              c.cycleUrl = SectionSummary.buildZephyrUrl(k);
            }
          }
          return c;
        });
      }
      if (parsed.bugs) state.bugs = parsed.bugs;
      if (parsed.links) Object.assign(state.links, parsed.links);
      if (parsed.scorecardParams) Object.assign(state.scorecardParams, parsed.scorecardParams);
      if (parsed.signature) Object.assign(state.signature, parsed.signature);
    }
  } catch (e) {
    console.warn("Could not load saved state:", e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save state:", e);
  }
}

// Helper to extract Jira issue key from text or full URL
function extractKey(val) {
  if (!val) return '';
  const trimmed = val.trim();
  const match = trimmed.match(/([A-Za-z]+-[0-9]+)/);
  if (match) return match[1].toUpperCase();
  return trimmed.toUpperCase();
}

// Security Sanitization Utility: Prevents XSS, Script Injection, and SQL Injection Tokens
function sanitizeTextInput(val, maxLen = 250) {
  if (!val) return '';
  let str = String(val);

  // 1. Remove null bytes
  str = str.replace(/\0/g, '');

  // 2. Strip HTML tags and script/iframe/style blocks
  str = str.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  str = str.replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '');
  str = str.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '');
  str = str.replace(/<[^>]+>/g, '');

  // 3. Strip pseudo-protocols and inline event attributes
  str = str.replace(/javascript:/gi, '');
  str = str.replace(/vbscript:/gi, '');
  str = str.replace(/data:text\/html/gi, '');
  str = str.replace(/on\w+\s*=/gi, '');

  // 4. Neutralize SQL injection tokens (comments and statement chaining)
  str = str.replace(/--+/g, '-');
  str = str.replace(/\/\*[\s\S]*?\*\//g, '');
  str = str.replace(/;\s*(drop|alter|delete|insert|update|select|truncate|exec|execute)\b/gi, '');
  str = str.replace(/\b(or|and)\s+['"]?1['"]?\s*=\s*['"]?1/gi, '');

  // 5. Truncate to maximum length and trim
  return str.slice(0, maxLen).trim();
}

window.handleSanitizedTextInput = function(input, maxLen = 250) {
  if (input.value.includes('<') || input.value.toLowerCase().includes('javascript:') || input.value.includes('--')) {
    input.value = sanitizeTextInput(input.value, maxLen);
  }
  syncInputsToState();
};

window.handleSanitizedTextBlur = function(input, maxLen = 250) {
  input.value = sanitizeTextInput(input.value, maxLen);
  syncInputsToState();
};

// Smart Date Parsing, Formatting, and Validation (MM/DD/YYYY)
function parseAndFormatDate(val) {
  if (!val) return { formatted: '', valid: true, empty: true };
  const trimmed = val.trim();
  if (!trimmed) return { formatted: '', valid: true, empty: true };

  // 1. ISO Format (YYYY-MM-DD or YYYY/MM/DD)
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    return validateAndBuildDate(month, day, year);
  }

  // 2. Delimited Date (MM/DD/YYYY, M/D/YYYY, MM-DD-YYYY, etc.)
  const delimMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (delimMatch) {
    const month = parseInt(delimMatch[1], 10);
    const day = parseInt(delimMatch[2], 10);
    let year = parseInt(delimMatch[3], 10);
    if (year < 100) {
      year += year >= 70 ? 1900 : 2000;
    }
    return validateAndBuildDate(month, day, year);
  }

  // 3. Raw Digits Only
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length === 8) {
    // e.g. 09222026 -> MM=09, DD=22, YYYY=2026
    const month = parseInt(digitsOnly.substring(0, 2), 10);
    const day = parseInt(digitsOnly.substring(2, 4), 10);
    const year = parseInt(digitsOnly.substring(4, 8), 10);
    return validateAndBuildDate(month, day, year);
  } else if (digitsOnly.length === 7) {
    // e.g. 9222026 -> M=9, DD=22, YYYY=2026
    const month = parseInt(digitsOnly.substring(0, 1), 10);
    const day = parseInt(digitsOnly.substring(1, 3), 10);
    const year = parseInt(digitsOnly.substring(3, 7), 10);
    return validateAndBuildDate(month, day, year);
  } else if (digitsOnly.length === 6) {
    // e.g. 092226 -> MM=09, DD=22, YY=26
    const month = parseInt(digitsOnly.substring(0, 2), 10);
    const day = parseInt(digitsOnly.substring(2, 4), 10);
    let year = parseInt(digitsOnly.substring(4, 6), 10);
    year += year >= 70 ? 1900 : 2000;
    return validateAndBuildDate(month, day, year);
  }

  // Incomplete or non-matching string
  return { formatted: trimmed, valid: false, empty: false };
}

function validateAndBuildDate(month, day, year) {
  if (month < 1 || month > 12) return { formatted: '', valid: false, empty: false };
  if (day < 1 || day > 31) return { formatted: '', valid: false, empty: false };
  if (year < 1970 || year > 2100) return { formatted: '', valid: false, empty: false };

  // Validate calendar days in month (leap year check, 30 vs 31 days)
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return { formatted: '', valid: false, empty: false };
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const yyyy = String(year);
  return { formatted: `${mm}/${dd}/${yyyy}`, valid: true, empty: false };
}

// Keyboard Guard: Numeric and slash only for Execution Start Date
window.handleDateKeyDown = function(event) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'Home', 'End'
  ];
  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }
  // Allow digits 0-9 and slash /
  if (/^[0-9\/]$/.test(event.key)) {
    return;
  }
  event.preventDefault();
};

// Native Calendar Date Picker Integration
window.openNativeDatePicker = function() {
  const datePicker = document.getElementById('native-date-picker');
  const textInput = document.getElementById('input-start-date');
  if (!datePicker) return;

  const curVal = (textInput?.value || '').trim();
  if (curVal) {
    const parts = curVal.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      datePicker.value = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
  }

  if (typeof datePicker.showPicker === 'function') {
    datePicker.showPicker();
  } else {
    datePicker.focus();
    datePicker.click();
  }
};

window.handleNativeDateSelect = function(isoVal) {
  if (!isoVal) return;
  const parts = isoVal.split('-');
  if (parts.length === 3) {
    const formatted = `${parts[1]}/${parts[2]}/${parts[0]}`;
    const textInput = document.getElementById('input-start-date');
    if (textInput) {
      textInput.value = formatted;
      textInput.classList.remove('input-error');
    }
    const errEl = document.getElementById('start-date-error');
    if (errEl) errEl.style.display = 'none';

    state.introData.executionStartDate = formatted;
    saveState();
  }
};

window.handleDateInput = function(input) {
  // Strip any characters that are not numeric or slash
  input.value = input.value.replace(/[^0-9\/]/g, '');

  const val = input.value;
  // If user pasted or typed 8 raw digits (e.g. 09222026), auto-format immediately
  const rawDigits = val.replace(/\D/g, '');
  if (rawDigits.length === 8 && !val.includes('/')) {
    const res = parseAndFormatDate(rawDigits);
    if (res.valid) {
      input.value = res.formatted;
      state.introData.executionStartDate = res.formatted;
      input.classList.remove('input-error');
      const errEl = document.getElementById('start-date-error');
      if (errEl) errEl.style.display = 'none';
      saveState();
      return;
    }
  }

  input.classList.remove('input-error');
  const errEl = document.getElementById('start-date-error');
  if (errEl) errEl.style.display = 'none';
};

window.handleDateBlur = function(input) {
  const val = input.value.trim();
  const errEl = document.getElementById('start-date-error');

  if (!val) {
    input.classList.remove('input-error');
    if (errEl) errEl.style.display = 'none';
    state.introData.executionStartDate = '';
    saveState();
    return;
  }

  const result = parseAndFormatDate(val);
  if (result.valid) {
    input.value = result.formatted;
    input.classList.remove('input-error');
    if (errEl) errEl.style.display = 'none';
    state.introData.executionStartDate = result.formatted;
    saveState();
  } else {
    input.classList.add('input-error');
    if (errEl) errEl.style.display = 'block';
  }
};

// Strict Key Format Validators
// IDEA: IDEA-<digits> (e.g. IDEA-3110)
// EPIC: BPLAT-<digits> (e.g. BPLAT-20767)
function validateKeyFormat(type, rawVal) {
  if (!rawVal || !rawVal.trim()) {
    return { valid: true, empty: true, cleanKey: '', error: null };
  }

  const cleanKey = extractKey(rawVal);
  if (type === 'idea') {
    const isMatch = /^IDEA-\d+$/i.test(cleanKey);
    return {
      valid: isMatch,
      empty: false,
      cleanKey: cleanKey.toUpperCase(),
      error: isMatch ? null : 'Must follow format IDEA-<number> (e.g. IDEA-3110)'
    };
  } else if (type === 'epic') {
    const isMatch = /^BPLAT-\d+$/i.test(cleanKey);
    return {
      valid: isMatch,
      empty: false,
      cleanKey: cleanKey.toUpperCase(),
      error: isMatch ? null : 'Must follow format BPLAT-<number> (e.g. BPLAT-20767)'
    };
  }
  return { valid: false, empty: false, cleanKey, error: 'Unknown key type' };
}

// Validation Gate: Require at least ONE valid key (IDEA or Epic), NO invalid keys, and valid Feature Story Points (> 0)
function validateKeyGate(showUI = false) {
  const ideaInput = document.getElementById('input-idea-key');
  const epicInput = document.getElementById('input-epic-key');
  const spInput = document.getElementById('input-sp');
  const spError = document.getElementById('sp-error');

  const ideaVal = (ideaInput ? ideaInput.value : (state.introData.ideaKey || '')).trim();
  const epicVal = (epicInput ? epicInput.value : (state.introData.epicKey || '')).trim();
  const rawSp = spInput ? spInput.value.trim() : (state.scorecardParams?.storyPoints !== null && state.scorecardParams?.storyPoints !== undefined ? String(state.scorecardParams.storyPoints) : '');
  const numSp = Number(rawSp);
  const hasValidSp = rawSp !== '' && Number.isFinite(numSp) && numSp > 0;

  const ideaCheck = validateKeyFormat('idea', ideaVal);
  const epicCheck = validateKeyFormat('epic', epicVal);

  const hasAtLeastOneKey = (!ideaCheck.empty && ideaCheck.valid) || (!epicCheck.empty && epicCheck.valid);
  const hasNoInvalidKeys = ideaCheck.valid && epicCheck.valid;
  const isValid = hasAtLeastOneKey && hasNoInvalidKeys && hasValidSp;

  const banner = document.getElementById('setup-validation-banner');
  const continueBtn = document.getElementById('btn-continue-cycles');

  if (continueBtn) {
    continueBtn.disabled = !isValid;
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.dataset.tab !== 'setup') {
      btn.classList.toggle('tab-locked', !isValid);
    }
  });

  if (!isValid && showUI) {
    banner?.classList.add('show');
    if (!ideaCheck.valid) ideaInput?.classList.add('input-error');
    if (!epicCheck.valid) epicInput?.classList.add('input-error');
    if (!hasValidSp) {
      spInput?.classList.add('input-error');
      if (spError) spError.style.display = 'block';
    } else {
      spInput?.classList.remove('input-error');
      if (spError) spError.style.display = 'none';
    }
  } else if (isValid || !showUI) {
    banner?.classList.remove('show');
    if (ideaCheck.valid) ideaInput?.classList.remove('input-error');
    if (epicCheck.valid) epicInput?.classList.remove('input-error');
    if (hasValidSp) {
      spInput?.classList.remove('input-error');
      if (spError) spError.style.display = 'none';
    }
  }

  return isValid;
}

window.handleSpInput = function(val) {
  const cleanVal = (val || '').trim();
  const num = parseFloat(cleanVal);
  state.scorecardParams.storyPoints = (cleanVal !== '' && !isNaN(num) && num > 0) ? num : null;
  const spInput = document.getElementById('input-sp');
  const spError = document.getElementById('sp-error');
  if (state.scorecardParams.storyPoints !== null) {
    spInput?.classList.remove('input-error');
    if (spError) spError.style.display = 'none';
  }
  validateKeyGate(false);
  renderLiveStats();
  renderPreview();
  saveState();
};

// Global exposure for UI events
window.switchTab = function(tabName) {
  if (tabName !== 'setup') {
    syncInputsToState();
    if (!validateKeyGate(true)) {
      const spInput = document.getElementById('input-sp');
      const rawSp = spInput ? spInput.value.trim() : '';
      const numSp = Number(rawSp);
      const hasValidSp = rawSp !== '' && Number.isFinite(numSp) && numSp > 0;

      const ideaInput = document.getElementById('input-idea-key');
      const epicInput = document.getElementById('input-epic-key');
      const ideaVal = (ideaInput ? ideaInput.value : '').trim();
      const epicVal = (epicInput ? epicInput.value : '').trim();
      const ideaCheck = validateKeyFormat('idea', ideaVal);
      const epicCheck = validateKeyFormat('epic', epicVal);
      const hasKey = (!ideaCheck.empty && ideaCheck.valid) || (!epicCheck.empty && epicCheck.valid);

      if (!hasKey) {
        showToast('⚠️ Please enter a valid IDEA Key or Epic Key (or both) before proceeding.');
        document.getElementById('input-idea-key')?.focus();
      } else if (!hasValidSp) {
        showToast('⚠️ Feature Story Points (SP) is required to proceed.');
        document.getElementById('input-sp')?.focus();
      } else {
        showToast('⚠️ Please correct the errors in the Setup form before proceeding.');
      }
      return;
    }
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tabName}`);
  });
  if (tabName === 'preview') {
    renderPreview();
  }
};

window.proceedToCycles = function() {
  syncInputsToState();
  if (!validateKeyGate(true)) {
    const spInput = document.getElementById('input-sp');
    const rawSp = spInput ? spInput.value.trim() : '';
    const numSp = Number(rawSp);
    const hasValidSp = rawSp !== '' && Number.isFinite(numSp) && numSp > 0;

    const ideaInput = document.getElementById('input-idea-key');
    const epicInput = document.getElementById('input-epic-key');
    const ideaVal = (ideaInput ? ideaInput.value : '').trim();
    const epicVal = (epicInput ? epicInput.value : '').trim();
    const ideaCheck = validateKeyFormat('idea', ideaVal);
    const epicCheck = validateKeyFormat('epic', epicVal);
    const hasKey = (!ideaCheck.empty && ideaCheck.valid) || (!epicCheck.empty && epicCheck.valid);

    if (!hasKey) {
      showToast('⚠️ Please enter a valid IDEA Key or Epic Key (or both) before proceeding.');
      document.getElementById('input-idea-key')?.focus();
    } else if (!hasValidSp) {
      showToast('⚠️ Feature Story Points (SP) is required to proceed.');
      document.getElementById('input-sp')?.focus();
    } else {
      showToast('⚠️ Please correct the errors in the Setup form before proceeding.');
    }
    return;
  }
  window.switchTab('summary');
};

// Dynamically update the Jira bug filter URL based on active key (Epic key > IDEA key)
function updateFilterUrl() {
  const ideaInput = document.getElementById('input-idea-key');
  const epicInput = document.getElementById('input-epic-key');
  const ideaVal = (ideaInput ? ideaInput.value : (state.introData.ideaKey || '')).trim();
  const epicVal = (epicInput ? epicInput.value : (state.introData.epicKey || '')).trim();
  const version = (document.getElementById('input-product-version')?.value || state.introData.productVersion || 'BTC v12.6').trim();

  const ideaCheck = validateKeyFormat('idea', ideaVal);
  const epicCheck = validateKeyFormat('epic', epicVal);

  // Active key selection (Epic has precedence if valid, else Idea if valid)
  let activeKey = '';
  if (!epicCheck.empty && epicCheck.valid) {
    activeKey = epicCheck.cleanKey;
  } else if (!ideaCheck.empty && ideaCheck.valid) {
    activeKey = ideaCheck.cleanKey;
  }

  const generatedUrl = activeKey ? SectionLinks.generateFilterUrl(activeKey, version) : '';
  state.links.filterUrl = generatedUrl;

  const filterInput = document.getElementById('input-filter-url');
  if (filterInput) {
    filterInput.value = generatedUrl;
  }

  const copyBtn = document.getElementById('btn-copy-filter-url');
  const openBtn = document.getElementById('btn-open-filter-url');
  const hasUrl = Boolean(generatedUrl);
  if (copyBtn) copyBtn.disabled = !hasUrl;
  if (openBtn) openBtn.disabled = !hasUrl;
}

window.copyFilterUrl = async function() {
  const url = document.getElementById('input-filter-url')?.value;
  if (!url) {
    showToast('⚠️ No filter URL generated yet. Enter a valid IDEA or Epic key first.');
    return;
  }
  const result = await ClipboardHelper.copyText(url);
  showToast(result.success ? 'Copied List of Bugs filter URL to clipboard!' : 'Failed to copy URL.');
};

window.openFilterUrlFromSetup = function() {
  const url = document.getElementById('input-filter-url')?.value;
  if (!url) {
    showToast('⚠️ No filter URL generated yet. Enter a valid IDEA or Epic key first.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

window.handleKeyInput = function(type, rawVal) {
  const result = validateKeyFormat(type, rawVal);
  const inputEl = document.getElementById(`input-${type}-key`);
  const errorEl = document.getElementById(`${type}-key-error`);
  const hintEl = document.getElementById(`${type}-key-hint`);

  // If user pasted a URL, replace field value with extracted key
  if (rawVal && (rawVal.includes('/') || rawVal.includes('http') || rawVal.includes(':'))) {
    if (inputEl) inputEl.value = result.cleanKey;
  }

  if (result.empty) {
    if (errorEl) errorEl.style.display = 'none';
    if (hintEl) hintEl.style.display = 'block';
    inputEl?.classList.remove('input-error');
    if (type === 'idea') {
      state.introData.ideaKey = '';
      state.links.ideaKey = '';
      state.links.ideaUrl = '';
    } else {
      state.introData.epicKey = '';
      state.links.epicKey = '';
      state.links.epicUrl = '';
    }
  } else if (result.valid) {
    if (errorEl) errorEl.style.display = 'none';
    if (hintEl) hintEl.style.display = 'block';
    inputEl?.classList.remove('input-error');
    if (type === 'idea') {
      state.introData.ideaKey = result.cleanKey;
      state.links.ideaKey = result.cleanKey;
      state.links.ideaUrl = `https://mojixinc.atlassian.net/browse/${result.cleanKey}`;
    } else {
      state.introData.epicKey = result.cleanKey;
      state.links.epicKey = result.cleanKey;
      state.links.epicUrl = `https://mojixinc.atlassian.net/browse/${result.cleanKey}`;
    }
  } else {
    // Invalid key format
    if (errorEl) {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
    }
    if (hintEl) hintEl.style.display = 'none';
    inputEl?.classList.add('input-error');
    if (type === 'idea') {
      state.introData.ideaKey = '';
      state.links.ideaKey = '';
      state.links.ideaUrl = '';
    } else {
      state.introData.epicKey = '';
      state.links.epicKey = '';
      state.links.epicUrl = '';
    }
  }

  updateFilterUrl();
  validateKeyGate(false);
  renderLiveStats();
  saveState();
};

// Reset Form Modal Handlers
window.openResetModal = function() {
  const modal = document.getElementById('reset-confirm-modal');
  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }
};

window.closeResetModal = function() {
  const modal = document.getElementById('reset-confirm-modal');
  if (modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
};

window.confirmResetForm = function() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear localStorage:", e);
  }

  // Reset to initial blank defaults (all fields wiped)
  state.introData = {
    senderName: "",
    senderEmail: "aperez@seagullsoftware.com",
    sentDate: new Date(),
    toRecipients: [],
    ccRecipients: [],
    productVersion: "",
    ideaKey: "",
    epicKey: "",
    featureName: "",
    executionStartDate: ""
  };
  state.cycles = [];
  state.bugs = [];
  state.links = {
    ideaKey: "",
    epicKey: "",
    ideaUrl: "",
    epicUrl: "",
    filterUrl: ""
  };
  state.scorecardParams = {
    storyPoints: null,
    reopened: 0,
    closed: 0,
    escaped: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 }
  };

  saveState();

  // Clear validation error displays and restore hints
  const ideaErr = document.getElementById('idea-key-error');
  const ideaHint = document.getElementById('idea-key-hint');
  const epicErr = document.getElementById('epic-key-error');
  const epicHint = document.getElementById('epic-key-hint');
  const dateErr = document.getElementById('start-date-error');
  const spErr = document.getElementById('sp-error');
  if (ideaErr) ideaErr.style.display = 'none';
  if (ideaHint) ideaHint.style.display = 'block';
  if (epicErr) epicErr.style.display = 'none';
  if (epicHint) epicHint.style.display = 'block';
  if (dateErr) dateErr.style.display = 'none';
  if (spErr) spErr.style.display = 'none';

  document.getElementById('input-idea-key')?.classList.remove('input-error');
  document.getElementById('input-epic-key')?.classList.remove('input-error');
  document.getElementById('input-start-date')?.classList.remove('input-error');
  document.getElementById('input-sp')?.classList.remove('input-error');
  const nativePicker = document.getElementById('native-date-picker');
  if (nativePicker) nativePicker.value = '';

  renderSetupForm();
  renderCyclesTable();
  renderBugsTable();
  renderLiveStats();
  updateFilterUrl();
  validateKeyGate(false);
  renderPreview();
  window.switchTab('setup');
  closeResetModal();
  showToast("All fields and sections have been reset.");
};

window.copyEmailToClipboard = async function() {
  syncInputsToState();
  const html = TemplateMso.assembleEmailHtml(state);
  const result = await ClipboardHelper.copyRichHtml(html);
  showToast(result.success ? 'Rich Email copied! Paste directly into Outlook (Cmd+V / Ctrl+V)' : 'Copy failed, please try manual copy.');
};

window.copySubjectLine = async function() {
  syncInputsToState();
  const subject = SectionIntro.generateSubject(state.introData);
  const result = await ClipboardHelper.copyText(subject);
  showToast(result.success ? `Subject copied: "${subject}"` : 'Copy failed.');
};

window.handleProductVersionInput = function(val) {
  const version = (val || '').trim();
  state.introData.productVersion = version;
  if (state.cycles) {
    state.cycles.forEach(c => {
      c.productVersion = version;
    });
  }
  updateFilterUrl();
  renderCyclesTable();
  saveState();
};

window.addCycleRow = function() {
  state.cycles.push({
    area: "",
    cycleKey: "",
    cycleUrl: "",
    productVersion: state.introData.productVersion || "BTC v12.6",
    readyToTest: true,
    testingStatus: "IN PROGRESS",
    progress: null,
    passed: null,
    retest: null,
    issues: null,
    testCases: 0
  });
  renderCyclesTable();
  saveState();

  // Auto-focus on the newly created cycle key / area input
  const newIdx = state.cycles.length - 1;
  const tbody = document.getElementById('cycles-tbody');
  if (tbody && tbody.rows[newIdx]) {
    const areaInput = tbody.rows[newIdx].querySelector('.cycle-area-cell input');
    if (areaInput) {
      setTimeout(() => {
        areaInput.focus();
        areaInput.select();
      }, 50);
    }
  }
};

window.removeCycleRow = function(index) {
  state.cycles.splice(index, 1);
  renderCyclesTable();
  saveState();
};

window.addBugRow = function() {
  const today = new Date().toISOString().split('T')[0] + "T00:00:00";
  state.bugs.push({
    type: "Bug",
    key: "BPLAT-",
    url: "https://mojixinc.atlassian.net/browse/",
    summary: "New defect summary",
    dateCreated: today,
    severity: "SEV 4 (Medium)",
    status: "Open",
    reopened: 0
  });
  renderBugsTable();
  saveState();

  const newIdx = state.bugs.length - 1;
  const tbody = document.getElementById('bugs-tbody');
  if (tbody && tbody.rows[newIdx]) {
    const keyInput = tbody.rows[newIdx].querySelector('td:nth-child(2) input');
    if (keyInput) {
      setTimeout(() => {
        keyInput.focus();
        keyInput.select();
      }, 50);
    }
  }
};

window.removeBugRow = function(index) {
  state.bugs.splice(index, 1);
  renderBugsTable();
  saveState();
};

// Sync Form inputs to State
function syncInputsToState() {
  const senderInput = document.getElementById('input-sender-name');
  if (senderInput) state.introData.senderName = sanitizeTextInput(senderInput.value, 100);

  const versionInput = document.getElementById('input-product-version');
  if (versionInput) state.introData.productVersion = sanitizeTextInput(versionInput.value, 50);

  const featureInput = document.getElementById('input-feature-name');
  if (featureInput) state.introData.featureName = sanitizeTextInput(featureInput.value, 250);
  
  const rawDate = document.getElementById('input-start-date')?.value?.trim();
  if (rawDate) {
    const parsedDate = parseAndFormatDate(rawDate);
    state.introData.executionStartDate = parsedDate.valid ? parsedDate.formatted : rawDate;
  } else {
    state.introData.executionStartDate = '';
  }

  const ideaInput = document.getElementById('input-idea-key');
  const epicInput = document.getElementById('input-epic-key');
  const ideaCheck = validateKeyFormat('idea', ideaInput ? ideaInput.value : '');
  const epicCheck = validateKeyFormat('epic', epicInput ? epicInput.value : '');

  const ideaKey = (!ideaCheck.empty && ideaCheck.valid) ? ideaCheck.cleanKey : '';
  const epicKey = (!epicCheck.empty && epicCheck.valid) ? epicCheck.cleanKey : '';

  state.introData.ideaKey = ideaKey;
  state.introData.epicKey = epicKey;

  state.links.ideaKey = ideaKey;
  state.links.ideaUrl = ideaKey ? `https://mojixinc.atlassian.net/browse/${ideaKey}` : '';
  state.links.epicKey = epicKey;
  state.links.epicUrl = epicKey ? `https://mojixinc.atlassian.net/browse/${epicKey}` : '';
  state.links.filterUrl = document.getElementById('input-filter-url')?.value || '';

  const spInput = document.getElementById('input-sp');
  if (spInput) {
    const rawSp = spInput.value.trim();
    if (rawSp === '') {
      state.scorecardParams.storyPoints = null;
    } else {
      const spVal = parseFloat(rawSp);
      state.scorecardParams.storyPoints = (!isNaN(spVal) && spVal > 0) ? spVal : null;
    }
  }

  saveState();
}

// Render Setup Inputs
function renderSetupForm() {
  document.getElementById('input-sender-name').value = state.introData.senderName || '';
  document.getElementById('input-product-version').value = state.introData.productVersion || '';
  document.getElementById('input-feature-name').value = state.introData.featureName || '';
  document.getElementById('input-start-date').value = state.introData.executionStartDate || '';
  document.getElementById('input-idea-key').value = state.introData.ideaKey || '';
  document.getElementById('input-epic-key').value = state.introData.epicKey || '';
  updateFilterUrl();
  document.getElementById('input-sp').value = (state.scorecardParams.storyPoints !== null && state.scorecardParams.storyPoints !== undefined) ? state.scorecardParams.storyPoints : '';
}

// Area & Zephyr Key Change Handler
window.handleCycleAreaChange = function(index, rawVal, inputEl) {
  const clean = (rawVal || '').trim();
  const defaultProj = (state.introData.epicKey || state.introData.ideaKey || 'BPLAT').split('-')[0] || 'BPLAT';
  const detectedKey = SectionSummary.extractCycleKey(clean, defaultProj);

  let areaTitle = clean;
  let cycleUrl = '';

  if (detectedKey) {
    cycleUrl = SectionSummary.buildZephyrUrl(detectedKey);

    const upperClean = clean.toUpperCase();
    const isBareKey = upperClean === detectedKey || 
                      upperClean === detectedKey.replace(`${defaultProj}-`, '') || 
                      clean.includes('testCycle/');

    if (isBareKey) {
      if (SectionSummary.KNOWN_ZEPHYR_CYCLES && SectionSummary.KNOWN_ZEPHYR_CYCLES[detectedKey]) {
        areaTitle = SectionSummary.KNOWN_ZEPHYR_CYCLES[detectedKey];
      } else {
        areaTitle = `${detectedKey}: QA Execution`;
      }
    }

    state.cycles[index].area = areaTitle;
    state.cycles[index].cycleKey = detectedKey;
    state.cycles[index].cycleUrl = cycleUrl;
  } else {
    state.cycles[index].area = clean;
    state.cycles[index].cycleKey = '';
    state.cycles[index].cycleUrl = '';
  }

  // Update in-place to preserve focus
  if (inputEl) {
    inputEl.value = areaTitle;
    const container = inputEl.closest('.cycle-area-cell');
    if (container) {
      let badge = container.querySelector('.cycle-link-badge');
      if (detectedKey && cycleUrl) {
        if (!badge) {
          badge = document.createElement('a');
          badge.className = 'cycle-link-badge';
          badge.target = '_blank';
          badge.rel = 'noopener noreferrer';
          badge.tabIndex = -1;
          container.appendChild(badge);
        }
        badge.href = cycleUrl;
        badge.title = `Open ${detectedKey} in Zephyr Scale`;
        badge.textContent = `🔗 Zephyr: ${detectedKey}`;
      } else if (badge) {
        badge.remove();
      }
    }
  } else {
    renderCyclesTable();
  }

  saveState();
};

// Numeric Input Handlers (Suppress Spinners & Non-numeric Characters)
window.handleNumericKeyDown = function(event, allowDash = true) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];
  if (allowedKeys.includes(event.key)) {
    return;
  }
  if (event.ctrlKey || event.metaKey) {
    return;
  }
  if (allowDash && event.key === '-') {
    if (!event.target.value.includes('-')) {
      return;
    }
  }
  if (/^[0-9]$/.test(event.key)) {
    return;
  }
  event.preventDefault();
};

window.handleTestCasesKeyDown = function(event, index) {
  if (event.key === 'Tab' && !event.shiftKey) {
    const tbody = document.getElementById('cycles-tbody');
    const nextRow = tbody ? tbody.rows[index + 1] : null;
    if (nextRow) {
      const nextAreaInput = nextRow.querySelector('.cycle-area-cell input');
      if (nextAreaInput) {
        event.preventDefault();
        nextAreaInput.focus();
        nextAreaInput.select();
        return;
      }
    } else {
      const quickAddBtn = document.getElementById('btn-quick-add-cycle');
      if (quickAddBtn) {
        event.preventDefault();
        quickAddBtn.focus();
        return;
      }
    }
  }
  handleNumericKeyDown(event, false);
};

window.handleNumericInput = function(input, allowDash = true) {
  let val = input.value;
  if (allowDash) {
    val = val.replace(/[^0-9\-]/g, '');
    if (val.indexOf('-') > 0) {
      val = val.replace(/-/g, '');
    }
    if ((val.match(/-/g) || []).length > 1) {
      val = '-' + val.replace(/-/g, '');
    }
  } else {
    val = val.replace(/[^0-9]/g, '');
  }
  input.value = val;
};

window.handleNumericCellChange = function(index, field, rawVal, inputEl) {
  const trimmed = (rawVal || '').trim();
  let parsedValue = null;

  if (field === 'testCases') {
    if (trimmed === '' || trimmed === '-') {
      parsedValue = 0;
    } else {
      parsedValue = Math.max(0, parseInt(trimmed, 10) || 0);
    }
    state.cycles[index].testCases = parsedValue;
    if (inputEl) {
      inputEl.value = parsedValue;
    }
  } else if (field === 'progress' || field === 'passed') {
    if (trimmed === '' || trimmed === '-') {
      parsedValue = null;
    } else {
      let num = parseInt(trimmed, 10);
      if (isNaN(num)) num = 0;
      parsedValue = Math.min(100, Math.max(0, num));
    }
    state.cycles[index][field] = parsedValue;
    if (inputEl) {
      inputEl.value = parsedValue !== null ? parsedValue : '-';
    }
  } else if (field === 'retest' || field === 'issues') {
    if (trimmed === '' || trimmed === '-') {
      parsedValue = null;
    } else {
      let num = parseInt(trimmed, 10);
      parsedValue = isNaN(num) ? null : Math.max(0, num);
    }
    state.cycles[index][field] = parsedValue;
    if (inputEl) {
      inputEl.value = parsedValue !== null ? parsedValue : '-';
    }
  }

  // Update only totals in tfoot - do NOT recreate tbody DOM so focus is preserved!
  renderCycleTotals();
  saveState();
};

// Render Cycles Table
function renderCyclesTable() {
  const tbody = document.getElementById('cycles-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (state.cycles.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="10" style="text-align:center;color:var(--text-muted);padding:18px">No test cycles configured. Click <strong>+ Add Test Cycle</strong> below to create your first cycle.</td>`;
    tbody.appendChild(tr);
  } else {
    state.cycles.forEach((c, idx) => {
      // Ensure productVersion mirrors setup productVersion
      c.productVersion = state.introData.productVersion || 'BTC v12.6';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="cycle-area-cell">
            <input type="text" class="form-control" placeholder="Cycle key (e.g. BPLAT-R926) or area name" value="${escapeHtml(c.area || '')}" onchange="handleCycleAreaChange(${idx}, this.value, this)">
            ${c.cycleKey && c.cycleUrl ? `<a href="${c.cycleUrl}" target="_blank" rel="noopener noreferrer" class="cycle-link-badge" tabindex="-1" title="Open ${c.cycleKey} in Zephyr Scale">🔗 Zephyr: ${c.cycleKey}</a>` : ''}
          </div>
        </td>
        <td>
          <input type="text" class="form-control readonly-field" value="${escapeHtml(c.productVersion)}" readonly tabindex="-1" title="Product Version is defined in Setup tab">
        </td>
        <td style="text-align:center">
          <select class="form-control ready-select" onchange="updateCycle(${idx}, 'readyToTest', this.value === 'TRUE')">
            <option value="TRUE" ${c.readyToTest !== false ? 'selected' : ''}>TRUE</option>
            <option value="FALSE" ${c.readyToTest === false ? 'selected' : ''}>FALSE</option>
          </select>
        </td>
        <td>
          <select class="form-control" onchange="updateCycle(${idx}, 'testingStatus', this.value)">
            <option value="IN PROGRESS" ${c.testingStatus === 'IN PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
            <option value="COMPLETED" ${c.testingStatus === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
            <option value="BLOCKED" ${c.testingStatus === 'BLOCKED' ? 'selected' : ''}>BLOCKED</option>
            <option value="-" ${c.testingStatus === '-' ? 'selected' : ''}>-</option>
          </select>
        </td>
        <td><input type="text" inputmode="numeric" class="form-control" style="text-align:right" value="${c.progress !== null && c.progress !== undefined ? c.progress : '-'}" onkeydown="handleNumericKeyDown(event, true)" oninput="handleNumericInput(this, true)" onchange="handleNumericCellChange(${idx}, 'progress', this.value, this)"></td>
        <td><input type="text" inputmode="numeric" class="form-control" style="text-align:right" value="${c.passed !== null && c.passed !== undefined ? c.passed : '-'}" onkeydown="handleNumericKeyDown(event, true)" oninput="handleNumericInput(this, true)" onchange="handleNumericCellChange(${idx}, 'passed', this.value, this)"></td>
        <td><input type="text" inputmode="numeric" class="form-control" style="text-align:right" value="${c.retest !== null && c.retest !== undefined ? c.retest : '-'}" onkeydown="handleNumericKeyDown(event, true)" oninput="handleNumericInput(this, true)" onchange="handleNumericCellChange(${idx}, 'retest', this.value, this)"></td>
        <td><input type="text" inputmode="numeric" class="form-control" style="text-align:right" value="${c.issues !== null && c.issues !== undefined ? c.issues : '-'}" onkeydown="handleNumericKeyDown(event, true)" oninput="handleNumericInput(this, true)" onchange="handleNumericCellChange(${idx}, 'issues', this.value, this)"></td>
        <td><input type="text" inputmode="numeric" class="form-control" style="text-align:right" value="${c.testCases !== null && c.testCases !== undefined ? c.testCases : 0}" onkeydown="handleTestCasesKeyDown(event, ${idx})" oninput="handleNumericInput(this, false)" onchange="handleNumericCellChange(${idx}, 'testCases', this.value, this)"></td>
        <td style="text-align:center"><button class="btn-icon danger" tabindex="-1" title="Delete Cycle" onclick="removeCycleRow(${idx})">&times;</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderCycleTotals();
}

window.updateCycle = function(index, field, value) {
  state.cycles[index][field] = value;
  renderCycleTotals();
  saveState();
};

function renderCycleTotals() {
  const totals = SectionSummary.calculateTotals(state.cycles);
  const totalRow = document.getElementById('cycles-totals-row');
  if (totalRow) {
    totalRow.innerHTML = `
      <td colspan="4"><strong>Total</strong></td>
      <td style="text-align:right"><strong>${totals.progress}</strong></td>
      <td style="text-align:right"><strong>${totals.passed}</strong></td>
      <td style="text-align:right"><strong>${totals.retest}</strong></td>
      <td style="text-align:right"><strong>${totals.issues}</strong></td>
      <td style="text-align:right"><strong>${totals.testCases}</strong></td>
      <td></td>
    `;
  }
}

// Render Bugs Table
function renderBugsTable() {
  const tbody = document.getElementById('bugs-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (state.bugs.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="9" style="text-align:center;color:var(--text-muted);padding:18px;line-height:1.6">No defects logged yet; the quality score is 100! If you want to add bugs, either paste from JIRA, or click 'add bug' to add them manually.</td>`;
    tbody.appendChild(tr);
  } else {
    state.bugs.forEach((b, idx) => {
      const age = SectionBugsList.getBugAge(b);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="form-control" value="${escapeHtml(b.type || 'Bug')}" onchange="updateBug(${idx}, 'type', this.value, this)"></td>
        <td><input type="text" class="form-control" value="${escapeHtml(b.key || '')}" onchange="updateBugKey(${idx}, this.value)"></td>
        <td><input type="text" class="form-control" value="${escapeHtml(b.summary || '')}" onchange="updateBug(${idx}, 'summary', this.value, this)"></td>
        <td><input type="date" class="form-control" value="${b.dateCreated ? b.dateCreated.split('T')[0] : ''}" onchange="updateBug(${idx}, 'dateCreated', this.value, this)"></td>
        <td>
          <select class="form-control" onchange="updateBug(${idx}, 'severity', this.value, this)">
            <option value="SEV 1 (Showstopper)" ${b.severity?.includes('1') ? 'selected' : ''}>SEV 1 (Showstopper)</option>
            <option value="SEV 2 (Critical)" ${b.severity?.includes('2') ? 'selected' : ''}>SEV 2 (Critical)</option>
            <option value="SEV 3 (Major)" ${b.severity?.includes('3') ? 'selected' : ''}>SEV 3 (Major)</option>
            <option value="SEV 4 (Medium)" ${b.severity?.includes('4') ? 'selected' : ''}>SEV 4 (Medium)</option>
            <option value="SEV 5 (Minor)" ${b.severity?.includes('5') ? 'selected' : ''}>SEV 5 (Minor)</option>
          </select>
        </td>
        <td>
          <select class="form-control" onchange="updateBug(${idx}, 'status', this.value, this)">
            <option value="Open" ${b.status === 'Open' ? 'selected' : ''}>Open</option>
            <option value="In Progress" ${b.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Ready for QA" ${b.status === 'Ready for QA' ? 'selected' : ''}>Ready for QA</option>
            <option value="Resolved" ${b.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option value="Closed" ${b.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td><input type="number" class="form-control" style="text-align:right" value="${b.reopened || 0}" oninput="updateBug(${idx}, 'reopened', this.value, this, true)" onchange="updateBug(${idx}, 'reopened', this.value, this, false)"></td>
        <td class="age-cell" style="text-align:right"><input type="text" inputmode="decimal" class="form-control" style="text-align:right" value="${age}" oninput="updateBug(${idx}, 'age', this.value, this, true)" onchange="updateBug(${idx}, 'age', this.value, this, false)" title="Age in days (e.g. 0.8 or 14)"></td>
        <td style="text-align:center"><button class="btn-icon danger" tabindex="-1" title="Delete Bug" onclick="removeBugRow(${idx})">&times;</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderLiveStats();
}

window.updateBug = function(index, field, value, el, isInputEvent = false) {
  if (field === 'age') {
    const cleanStr = String(value).trim().replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleanStr);
    state.bugs[index].age = !isNaN(parsed) ? parsed : 0;
    if (el && !isInputEvent) el.value = state.bugs[index].age;
  } else if (field === 'reopened') {
    const cleanStr = String(value).trim().replace(/[^0-9]/g, '');
    const parsed = parseInt(cleanStr, 10);
    state.bugs[index].reopened = !isNaN(parsed) ? parsed : 0;
    if (el && !isInputEvent) el.value = state.bugs[index].reopened;
  } else {
    state.bugs[index][field] = value;
  }

  if (field === 'dateCreated') {
    const newAge = SectionBugsList.calculateAge(value);
    state.bugs[index].age = newAge;
    const row = el?.closest('tr');
    const ageInput = row?.querySelector('.age-cell input');
    if (ageInput) {
      ageInput.value = newAge;
    }
  }

  renderLiveStats();
  saveState();
};

window.refreshScorecardLive = function() {
  syncInputsToState();
  renderLiveStats();
  showToast('Quality Scorecard recalculated from active defect data!');
};

window.updateBugKey = function(index, value) {
  const cleanKey = (value || '').trim().toUpperCase();
  state.bugs[index].key = cleanKey;
  state.bugs[index].url = cleanKey ? `https://mojixinc.atlassian.net/browse/${cleanKey}` : '';
  saveState();
};

// Open Jira Filter in new tab
window.openJiraFilter = function() {
  syncInputsToState();
  let filterUrl = state.links.filterUrl;
  if (!filterUrl) {
    updateFilterUrl();
    filterUrl = state.links.filterUrl;
  }
  if (!filterUrl) {
    showToast('Please enter an IDEA or Epic Key in Setup to generate the Jira filter.');
    switchTab('setup');
    return;
  }
  window.open(filterUrl, '_blank', 'noopener,noreferrer');
};

let detectedPastedBugs = [];

// Open Jira Paste Modal
window.openJiraPasteModal = function() {
  const modal = document.getElementById('jira-import-modal');
  const input = document.getElementById('jira-paste-input');
  const previewContainer = document.getElementById('jira-paste-preview-container');
  const confirmBtn = document.getElementById('btn-confirm-jira-import');

  if (input) input.value = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (confirmBtn) confirmBtn.disabled = true;
  detectedPastedBugs = [];

  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => input?.focus(), 100);
  }

  // Try reading clipboard directly if permission allows
  readFromClipboardDirectly(true);
};

// Close Jira Paste Modal
window.closeJiraPasteModal = function() {
  const modal = document.getElementById('jira-import-modal');
  if (modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
};

// Read from Clipboard
window.readFromClipboardDirectly = async function(isSilent = false) {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const parsed = JiraImporter.parse(text);
        if (parsed.length > 0) {
          const input = document.getElementById('jira-paste-input');
          if (input) {
            input.value = text;
            previewPastedJiraData();
            if (!isSilent) {
              showToast(`Read ${parsed.length} defect${parsed.length === 1 ? '' : 's'} from clipboard!`);
            }
          }
          return;
        }
      }
    }
  } catch (err) {
    if (!isSilent) {
      console.info("Clipboard direct read not permitted:", err);
      showToast("Clipboard access denied. Please paste directly into the box (Cmd+V / Ctrl+V).");
    }
  }
};

// Preview Pasted Data
window.previewPastedJiraData = function() {
  const input = document.getElementById('jira-paste-input');
  const container = document.getElementById('jira-paste-preview-container');
  const countEl = document.getElementById('jira-paste-preview-count');
  const tbody = document.getElementById('jira-paste-preview-tbody');
  const confirmBtn = document.getElementById('btn-confirm-jira-import');

  const text = input ? input.value : '';
  detectedPastedBugs = JiraImporter.parse(text);

  if (detectedPastedBugs.length > 0) {
    if (countEl) countEl.textContent = `${detectedPastedBugs.length} defect${detectedPastedBugs.length === 1 ? '' : 's'} detected`;
    if (tbody) {
      tbody.innerHTML = detectedPastedBugs.slice(0, 8).map(b => `
        <tr>
          <td>${escapeHtml(b.type)}</td>
          <td><strong>${escapeHtml(b.key)}</strong></td>
          <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(b.summary)}</td>
          <td>${escapeHtml(b.severity)}</td>
          <td>${escapeHtml(b.status)}</td>
          <td style="text-align:right"><strong>${b.age} d</strong></td>
        </tr>
      `).join('') + (detectedPastedBugs.length > 8 ? `<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">...and ${detectedPastedBugs.length - 8} more</td></tr>` : '');
    }
    if (container) container.style.display = 'block';
    if (confirmBtn) confirmBtn.disabled = false;
  } else {
    if (container) container.style.display = 'none';
    if (confirmBtn) confirmBtn.disabled = true;
  }
};

// Confirm Jira Import
window.confirmJiraImport = function() {
  if (detectedPastedBugs.length === 0) return;

  const modeRadio = document.querySelector('input[name="jira-import-mode"]:checked');
  const mode = modeRadio ? modeRadio.value : 'replace';

  if (mode === 'replace') {
    state.bugs = [...detectedPastedBugs];
  } else {
    // Append, deduplicating by key
    const existingKeys = new Set(state.bugs.map(b => (b.key || '').toUpperCase()));
    detectedPastedBugs.forEach(b => {
      if (!existingKeys.has(b.key.toUpperCase())) {
        state.bugs.push(b);
        existingKeys.add(b.key.toUpperCase());
      }
    });
  }

  renderBugsTable();
  renderLiveStats();
  saveState();
  closeJiraPasteModal();
  showToast(`Successfully imported ${detectedPastedBugs.length} defect${detectedPastedBugs.length === 1 ? '' : 's'} from Jira!`);
};

// Render Live Stats Header & Scorecard preview badge
function renderLiveStats() {
  const counts = SectionBugsList.getSeverityCounts(state.bugs, state.referenceDate || new Date());
  let reopenedCount = state.scorecardParams?.reopened || 0;
  let closedCount = state.scorecardParams?.closed || 0;
  (state.bugs || []).forEach(b => {
    if (b.reopened) reopenedCount += Number(b.reopened) || 0;
    if (b.status === 'Closed' || b.status === 'Resolved') closedCount++;
  });

  const scoreMetrics = SectionScorecard.computeQualityScore({
    storyPoints: state.scorecardParams?.storyPoints,
    reopened: reopenedCount,
    closed: closedCount,
    severityCounts: counts
  });

  const badgeEl = document.getElementById('live-scorecard-badge');
  if (badgeEl) {
    const isPlaceholder = scoreMetrics.density === '—';
    const tooltip = scoreMetrics.errorMessage ? ` title="${escapeHtml(scoreMetrics.errorMessage)}"` : '';
    badgeEl.innerHTML = `
      <div class="score-circle" style="border-color:${scoreMetrics.ringColor}"${tooltip}>
        <div class="score-val">${scoreMetrics.score}</div>
        <div class="score-lbl" style="${scoreMetrics.missingStoryPoints ? 'color:#b45309;font-weight:bold;' : ''}">${scoreMetrics.missingStoryPoints ? 'NO SP' : scoreMetrics.grade}</div>
      </div>
      <div${tooltip}>
        <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase">Live Score Preview</div>
        <div style="font-size:12px;color:#374151;margin-top:2px">
          Density: <strong>${scoreMetrics.density}${isPlaceholder ? '' : '/SP'}</strong> &bull; 
          Reopen: <strong>${scoreMetrics.reopen}${isPlaceholder ? '' : '%'}</strong> &bull; 
          S1 rate: <strong>${scoreMetrics.s1Rate}${isPlaceholder ? '' : '%'}</strong> &bull; 
          Avg res: <strong>${scoreMetrics.avgRes}</strong> &bull;
          Bugs: <strong>${counts.total}</strong>
        </div>
      </div>
    `;
  }
}

// Render Preview Tab
function renderPreview() {
  syncInputsToState();
  const subject = SectionIntro.generateSubject(state.introData);
  const subjectInput = document.getElementById('preview-subject-input');
  if (subjectInput) {
    subjectInput.value = subject;
  }
  const html = TemplateMso.assembleEmailHtml(state);
  const previewContainer = document.getElementById('email-preview-frame');
  if (previewContainer) {
    previewContainer.srcdoc = html;
  }
}
window.renderPreview = renderPreview;

window.refreshPreviewManually = function() {
  renderPreview();
  renderLiveStats();
  showToast('Live Email Preview refreshed!');
};

// Export Session State to Downloadable JSON File
window.exportSessionJson = function() {
  syncInputsToState();
  const sessionData = {
    schemaVersion: "1.0",
    appName: "Seagull QA Daily Dispatcher",
    exportedAt: new Date().toISOString(),
    state: {
      introData: state.introData,
      cycles: state.cycles,
      bugs: state.bugs,
      links: state.links,
      scorecardParams: state.scorecardParams,
      referenceDate: state.referenceDate || new Date().toISOString()
    }
  };

  const jsonStr = JSON.stringify(sessionData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const key = (state.introData.ideaKey || state.introData.epicKey || 'DAILY-QA').replace(/[^a-zA-Z0-9_-]/g, '_');
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const filename = `qa-session-${key}-${dateStr}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Session successfully exported as ${filename}!`);
};

// Trigger file input for importing session
window.triggerImportSession = function() {
  const fileInput = document.getElementById('session-file-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
};

// Handle file selected for importing session
window.handleSessionFileSelected = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      // Support either wrapped schema format or raw state object
      const importedState = parsed.state || parsed;

      if (!importedState.introData && !importedState.cycles && !importedState.bugs) {
        throw new Error("Invalid session file structure. Missing required dispatcher fields.");
      }

      // Merge into active state
      if (importedState.introData) state.introData = { ...state.introData, ...importedState.introData };
      if (Array.isArray(importedState.cycles)) state.cycles = importedState.cycles;
      if (Array.isArray(importedState.bugs)) state.bugs = importedState.bugs;
      if (importedState.links) state.links = { ...state.links, ...importedState.links };
      if (importedState.scorecardParams) state.scorecardParams = { ...state.scorecardParams, ...importedState.scorecardParams };
      if (importedState.referenceDate) state.referenceDate = importedState.referenceDate;

      // Persist to local storage
      saveState();

      // Refresh all views & tables
      renderSetupForm();
      renderCyclesTable();
      renderBugsTable();
      renderLiveStats();
      validateKeyGate(false);
      renderPreview();

      showToast(`Session loaded successfully from ${file.name}!`);
    } catch (err) {
      console.error("Session import error:", err);
      alert(`Failed to import session file: ${err.message || 'Invalid JSON format'}`);
    }
  };
  reader.readAsText(file);
};

// Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

// Initialization on DOM load
window.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  renderSetupForm();
  renderCyclesTable();
  renderBugsTable();
  renderLiveStats();
  validateKeyGate(false);

  // Auto-sync on input changes
  document.querySelectorAll('#panel-setup input, #panel-setup textarea').forEach(input => {
    input.addEventListener('input', () => {
      syncInputsToState();
      validateKeyGate(false);
      renderLiveStats();
    });
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeResetModal();
      window.closeJiraPasteModal();
    }
  });

  // CSV Drag and drop on bugs panel
  const bugsPanel = document.getElementById('panel-bugs');
  if (bugsPanel) {
    bugsPanel.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    bugsPanel.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          window.openJiraPasteModal();
          const input = document.getElementById('jira-paste-input');
          if (input) {
            input.value = content;
            window.previewPastedJiraData();
          }
        };
        reader.readAsText(file);
      }
    });
  }
});
