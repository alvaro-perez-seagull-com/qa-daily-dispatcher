/**
 * Seagull QA Daily Dispatcher — Internationalization (i18n) Engine
 * Supported Locales:
 *  - 'en': English (US)
 *  - 'es-MX': Español (México)
 *  - 'es-BO': Español (Bolivia / Cochabamba QA Team)
 */

export const I18N = {
  activeLocale: 'en',
  emailLocale: 'en',

  translations: {
    'en': {
      'brand.title': 'Seagull QA Daily Dispatcher',
      'brand.subtitle': 'Automated Outlook Daily Status Generator',
      'tabs.setup': '1. Project Setup & Links',
      'tabs.summary': '2. Test Cycles Summary',
      'tabs.bugs': '3. List of Bugs (Jira)',
      'tabs.preview': '4. Live Email Preview',

      'setup.validationBanner': 'Please provide a valid <strong>Jira Key</strong> (IDEA or Epic) and enter <strong>Feature Story Points (SP)</strong> before proceeding.',
      'setup.cardProject': 'Project & Feature Identification',
      'setup.featureName': 'Feature Initiative Name',
      'setup.featureNamePlaceholder': 'e.g. Intelligent Forms: Refreshable Print Preview',
      'setup.productVersion': 'Product and Version',
      'setup.productVersionPlaceholder': 'e.g. BTC v12.6',
      'setup.ideaKey': 'Primary Jira Key (IDEA or Epic)',
      'setup.ideaKeyPlaceholder': 'e.g. IDEA-3110 or BPLAT-20767',
      'setup.ideaKeyHelper': 'Jira Issue Key must match IDEA-XXXX or BPLAT-XXXX format',
      'setup.epicKey': 'Secondary Epic Key (Optional)',
      'setup.epicKeyPlaceholder': 'e.g. BPLAT-20767',
      'setup.epicKeyHelper': 'Secondary Jira Key must match IDEA-XXXX or BPLAT-XXXX format',
      'setup.storyPoints': 'Feature Story Points (SP)',
      'setup.storyPointsPlaceholder': 'e.g. 5',
      'setup.storyPointsHelper': 'Story Points must be greater than 0 to calculate QA Health Score',
      'setup.startDate': 'Execution Start Date',
      'setup.startDatePlaceholder': 'MM/DD/YYYY',
      'setup.cardDistribution': 'Distribution Lists',
      'setup.qaEngineer': 'QA Engineer Name',
      'setup.qaEngineerPlaceholder': 'e.g. Alvaro Perez',
      'setup.qaEmail': 'QA Engineer Email',
      'setup.qaEmailPlaceholder': 'e.g. aperez@seagullsoftware.com',
      'setup.toRecipients': 'To: Primary Stakeholders (semicolon separated)',
      'setup.toRecipientsPlaceholder': 'e.g. pm@seagullsoftware.com; dev-lead@seagullsoftware.com',
      'setup.ccRecipients': 'CC: Extended Team & Leads (semicolon separated)',
      'setup.ccRecipientsPlaceholder': 'e.g. qa-team@seagullsoftware.com',
      'setup.cardLinks': 'Jira Quick Links',
      'setup.confluencePlan': 'Confluence Test Plan URL',
      'setup.confluencePlanPlaceholder': 'https://mojixinc.atlassian.net/wiki/...',
      'setup.testCycleUrl': 'Jira Test Cycle URL',
      'setup.testCycleUrlPlaceholder': 'https://mojixinc.atlassian.net/...',
      'setup.bugFilterUrl': 'Jira Bug Filter JQL URL',
      'setup.bugFilterUrlPlaceholder': 'Auto-generated or paste Jira filter URL...',
      'setup.btnReset': 'Reset Form',
      'setup.btnImport': 'Import Session',
      'setup.btnContinue': 'Continue to Cycles →',

      'cycles.title': 'Test Cycles Summary Table',
      'cycles.thArea': 'Area / Test Cycle',
      'cycles.thProductVersion': 'Product Version',
      'cycles.thReady': 'Ready To Test',
      'cycles.thStatus': 'Status',
      'cycles.thProgress': 'Progress',
      'cycles.thPassed': 'Passed',
      'cycles.thRetest': 'Retest',
      'cycles.thIssues': '# Issues',
      'cycles.thTestCases': '# TestCases',
      'cycles.thDel': 'Del',
      'cycles.emptyNotice': 'No test cycles configured. Click <strong>+ Add Test Cycle</strong> below to create your first cycle.',
      'cycles.btnAdd': '+ Add Test Cycle',
      'cycles.btnBack': '← Back to Setup',
      'cycles.btnContinue': 'Continue to Bugs →',

      'bugs.title': 'List of Bugs Found',
      'bugs.thType': 'Type',
      'bugs.thKey': 'Issue Key',
      'bugs.thSummary': 'Summary / Title',
      'bugs.thDateCreated': 'Date Created',
      'bugs.thSeverity': 'Severity',
      'bugs.thStatus': 'Status',
      'bugs.thReopen': '# ReOpen',
      'bugs.thAge': 'Age',
      'bugs.thDel': 'Del',
      'bugs.btnOpenFilter': 'Open Filter in Jira ↗',
      'bugs.btnRefreshScorecard': '🔄 Refresh Scorecard',
      'bugs.emptyNotice': 'No defects logged yet; the quality score is 100! If you want to add bugs, either paste from JIRA, or click \'add bug\' to add them manually.',
      'bugs.btnImport': 'Import from Jira',
      'bugs.btnAdd': '+ Add Bug',
      'bugs.btnBack': '← Back to Cycles',
      'bugs.btnContinue': 'Generate Email Preview →',

      'preview.title': 'Live Email Preview',
      'preview.staleBannerTitle': 'Stale Session Date Detected',
      'preview.staleBannerText': 'This session\'s date is from a previous day. Would you like to refresh it to today\'s date?',
      'preview.btnRefresh': 'Refresh Preview',
      'preview.emailLangLabel': 'Email Language:',
      'preview.btnBack': '← Back to Bugs',
      'preview.btnExport': 'Export Session',
      'preview.btnCopy': 'Copy Formatted Email',

      'modalReset.title': 'Reset Project Form?',
      'modalReset.body': 'This will reset all form fields, test cycles, and defect lists back to clean initial values. Are you sure you want to proceed?',
      'modalReset.cancel': 'Cancel',
      'modalReset.confirm': 'Reset All Data',

      'modalJira.title': 'Import Defects from Jira',
      'modalJira.step1': '1. Open your defect list in Jira.',
      'modalJira.step2': '2. Select and copy (Ctrl+C / Cmd+C) the issue rows from Jira.',
      'modalJira.step3': '3. Click \'Read Clipboard\' or paste below:',
      'modalJira.pastePlaceholder': 'Paste Jira tab-separated table rows here...',
      'modalJira.modeReplace': 'Replace existing bugs',
      'modalJira.modeAppend': 'Append to existing bugs',
      'modalJira.cancel': 'Cancel',
      'modalJira.readClipboard': '📋 Read Clipboard',
      'modalJira.confirm': 'Import Defects',

      'stats.score': 'Quality Score',
      'stats.excellent': 'Excellent',
      'stats.good': 'Good',
      'stats.fair': 'Fair',
      'stats.needsAttention': 'Needs Attention',

      'email.greeting': 'Team,',
      'email.placeholder': '<your message here!>',
      'email.statusSummary': 'Daily Status'
    },

    'es-MX': {
      'brand.title': 'Seagull QA Daily Dispatcher',
      'brand.subtitle': 'Generador automatizado de estado diario de Outlook',
      'tabs.setup': '1. Configuración del proyecto y enlaces',
      'tabs.summary': '2. Resumen de ciclos de prueba',
      'tabs.bugs': '3. Lista de defectos (Jira)',
      'tabs.preview': '4. Vista previa del correo',

      'setup.validationBanner': 'Por favor ingrese una <strong>clave de Jira</strong> válida (IDEA o Epic) y los <strong>puntos de historia (SP)</strong> antes de continuar.',
      'setup.cardProject': 'Identificación del proyecto y funcionalidad',
      'setup.featureName': 'Nombre de la iniciativa de funcionalidad',
      'setup.featureNamePlaceholder': 'ej. Formularios inteligentes: Vista previa actualizable',
      'setup.productVersion': 'Producto y versión',
      'setup.productVersionPlaceholder': 'ej. BTC v12.6',
      'setup.ideaKey': 'Clave principal de Jira (IDEA o Epic)',
      'setup.ideaKeyPlaceholder': 'ej. IDEA-3110 o BPLAT-20767',
      'setup.ideaKeyHelper': 'La clave de Jira debe cumplir con el formato IDEA-XXXX o BPLAT-XXXX',
      'setup.epicKey': 'Clave secundaria de Epic (Opcional)',
      'setup.epicKeyPlaceholder': 'ej. BPLAT-20767',
      'setup.epicKeyHelper': 'La clave secundaria de Jira debe cumplir con el formato IDEA-XXXX o BPLAT-XXXX',
      'setup.storyPoints': 'Puntos de historia (SP)',
      'setup.storyPointsPlaceholder': 'ej. 5',
      'setup.storyPointsHelper': 'Los puntos de historia deben ser mayores a 0 para calcular la puntuación de calidad',
      'setup.startDate': 'Fecha de inicio de ejecución',
      'setup.startDatePlaceholder': 'DD/MM/AAAA',
      'setup.cardDistribution': 'Listas de distribución',
      'setup.qaEngineer': 'Nombre del ingeniero de QA',
      'setup.qaEngineerPlaceholder': 'ej. Alvaro Perez',
      'setup.qaEmail': 'Correo del ingeniero de QA',
      'setup.qaEmailPlaceholder': 'ej. aperez@seagullsoftware.com',
      'setup.toRecipients': 'Para: Interesados principales (separados por punto y coma)',
      'setup.toRecipientsPlaceholder': 'ej. pm@seagullsoftware.com; dev-lead@seagullsoftware.com',
      'setup.ccRecipients': 'CC: Equipo extendido y líderes (separados por punto y coma)',
      'setup.ccRecipientsPlaceholder': 'ej. qa-team@seagullsoftware.com',
      'setup.cardLinks': 'Enlaces rápidos de Jira',
      'setup.confluencePlan': 'URL del plan de pruebas en Confluence',
      'setup.confluencePlanPlaceholder': 'https://mojixinc.atlassian.net/wiki/...',
      'setup.testCycleUrl': 'URL del ciclo de pruebas en Jira',
      'setup.testCycleUrlPlaceholder': 'https://mojixinc.atlassian.net/...',
      'setup.bugFilterUrl': 'URL del filtro de defectos en Jira (JQL)',
      'setup.bugFilterUrlPlaceholder': 'Generado automáticamente o pegue URL de filtro...',
      'setup.btnReset': 'Restablecer formulario',
      'setup.btnImport': 'Importar sesión',
      'setup.btnContinue': 'Continuar a ciclos →',

      'cycles.title': 'Tabla de resumen de ciclos de prueba',
      'cycles.thArea': 'Área / Ciclo de prueba',
      'cycles.thProductVersion': 'Versión del producto',
      'cycles.thReady': 'Listo para probar',
      'cycles.thStatus': 'Estado',
      'cycles.thProgress': 'Progreso',
      'cycles.thPassed': 'Aprobados',
      'cycles.thRetest': 'Reevaluar',
      'cycles.thIssues': 'Nº Problemas',
      'cycles.thTestCases': 'Nº Casos de prueba',
      'cycles.thDel': 'Elim.',
      'cycles.emptyNotice': 'No hay ciclos de prueba configurados. Haga clic en <strong>+ Agregar ciclo de prueba</strong> abajo para crear su primer ciclo.',
      'cycles.btnAdd': '+ Agregar ciclo de prueba',
      'cycles.btnBack': '← Volver a configuración',
      'cycles.btnContinue': 'Continuar a defectos →',

      'bugs.title': 'Lista de defectos encontrados',
      'bugs.thType': 'Tipo',
      'bugs.thKey': 'Clave de defecto',
      'bugs.thSummary': 'Resumen / Título',
      'bugs.thDateCreated': 'Fecha de creación',
      'bugs.thSeverity': 'Severidad',
      'bugs.thStatus': 'Estado',
      'bugs.thReopen': 'Nº Reabierto',
      'bugs.thAge': 'Antigüedad',
      'bugs.thDel': 'Elim.',
      'bugs.btnOpenFilter': 'Abrir filtro en Jira ↗',
      'bugs.btnRefreshScorecard': '🔄 Actualizar puntuación',
      'bugs.emptyNotice': '¡No hay defectos registrados aún; la puntuación de calidad es 100! Si desea agregar defectos, pegue desde JIRA o haga clic en \'+ Agregar defecto\' para añadirlos manualmente.',
      'bugs.btnImport': 'Importar desde Jira',
      'bugs.btnAdd': '+ Agregar defecto',
      'bugs.btnBack': '← Volver a ciclos',
      'bugs.btnContinue': 'Generar vista previa de correo →',

      'preview.title': 'Vista previa en vivo del correo',
      'preview.staleBannerTitle': 'Fecha de sesión desactualizada detectada',
      'preview.staleBannerText': 'La fecha de esta sesión corresponde a un día anterior. ¿Desea actualizarla a la fecha de hoy?',
      'preview.btnRefresh': 'Actualizar vista previa',
      'preview.emailLangLabel': 'Idioma del correo:',
      'preview.btnBack': '← Volver a defectos',
      'preview.btnExport': 'Exportar sesión',
      'preview.btnCopy': 'Copiar correo con formato',

      'modalReset.title': '¿Restablecer formulario del proyecto?',
      'modalReset.body': 'Esto restablecerá todos los campos del formulario, ciclos de prueba y listas de defectos a sus valores iniciales. ¿Está seguro de que desea continuar?',
      'modalReset.cancel': 'Cancelar',
      'modalReset.confirm': 'Restablecer todos los datos',

      'modalJira.title': 'Importar defectos desde Jira',
      'modalJira.step1': '1. Abra su lista de defectos en Jira.',
      'modalJira.step2': '2. Seleccione y copie (Ctrl+C / Cmd+C) las filas de incidencias de Jira.',
      'modalJira.step3': '3. Haga clic en \'Leer portapapeles\' o pegue a continuación:',
      'modalJira.pastePlaceholder': 'Pegue las filas de la tabla de Jira aquí...',
      'modalJira.modeReplace': 'Reemplazar defectos existentes',
      'modalJira.modeAppend': 'Agregar a defectos existentes',
      'modalJira.cancel': 'Cancelar',
      'modalJira.readClipboard': '📋 Leer portapapeles',
      'modalJira.confirm': 'Importar defectos',

      'stats.score': 'Puntuación de calidad',
      'stats.excellent': 'Excelente',
      'stats.good': 'Bueno',
      'stats.fair': 'Aceptable',
      'stats.needsAttention': 'Requiere atención',

      'email.greeting': 'Estimado equipo,',
      'email.placeholder': '<¡escriba su mensaje aquí!>',
      'email.statusSummary': 'Estado Diario'
    },

    'es-BO': {
      'brand.title': 'Seagull QA Daily Dispatcher',
      'brand.subtitle': 'Generador automatizado de reporte diario de Outlook',
      'tabs.setup': '1. Configuración del proyecto y enlaces',
      'tabs.summary': '2. Resumen de ciclos de prueba',
      'tabs.bugs': '3. Lista de defectos (Jira)',
      'tabs.preview': '4. Vista previa del correo',

      'setup.validationBanner': 'Por favor ingrese una <strong>clave de Jira</strong> válida (IDEA o Epic) y los <strong>puntos de historia (SP)</strong> antes de continuar.',
      'setup.cardProject': 'Identificación del proyecto y módulo',
      'setup.featureName': 'Nombre del módulo / iniciativa',
      'setup.featureNamePlaceholder': 'ej. Formularios inteligentes: Vista previa de impresión actualizable',
      'setup.productVersion': 'Producto y versión',
      'setup.productVersionPlaceholder': 'ej. BTC v12.6',
      'setup.ideaKey': 'Clave principal de Jira (IDEA o Epic)',
      'setup.ideaKeyPlaceholder': 'ej. IDEA-3110 o BPLAT-20767',
      'setup.ideaKeyHelper': 'La clave de Jira debe cumplir con el formato IDEA-XXXX o BPLAT-XXXX',
      'setup.epicKey': 'Clave secundaria de Epic (Opcional)',
      'setup.epicKeyPlaceholder': 'ej. BPLAT-20767',
      'setup.epicKeyHelper': 'La clave secundaria de Jira debe cumplir con el formato IDEA-XXXX o BPLAT-XXXX',
      'setup.storyPoints': 'Puntos de historia (SP)',
      'setup.storyPointsPlaceholder': 'ej. 5',
      'setup.storyPointsHelper': 'Los puntos de historia deben ser mayores a 0 para calcular la puntuación de salud de QA',
      'setup.startDate': 'Fecha de inicio de ejecución',
      'setup.startDatePlaceholder': 'DD/MM/AAAA',
      'setup.cardDistribution': 'Listas de distribución',
      'setup.qaEngineer': 'Nombre del ingeniero de QA',
      'setup.qaEngineerPlaceholder': 'ej. Alvaro Perez',
      'setup.qaEmail': 'Correo del ingeniero de QA',
      'setup.qaEmailPlaceholder': 'ej. aperez@seagullsoftware.com',
      'setup.toRecipients': 'Para: Interesados principales (separados por punto y coma)',
      'setup.toRecipientsPlaceholder': 'ej. pm@seagullsoftware.com; dev-lead@seagullsoftware.com',
      'setup.ccRecipients': 'CC: Equipo extendido y líderes (separados por punto y coma)',
      'setup.ccRecipientsPlaceholder': 'ej. qa-team@seagullsoftware.com',
      'setup.cardLinks': 'Enlaces rápidos de Jira',
      'setup.confluencePlan': 'URL del plan de pruebas en Confluence',
      'setup.confluencePlanPlaceholder': 'https://mojixinc.atlassian.net/wiki/...',
      'setup.testCycleUrl': 'URL del ciclo de pruebas en Jira',
      'setup.testCycleUrlPlaceholder': 'https://mojixinc.atlassian.net/...',
      'setup.bugFilterUrl': 'URL del filtro de defectos en Jira (JQL)',
      'setup.bugFilterUrlPlaceholder': 'Generado automáticamente o pegue URL de filtro...',
      'setup.btnReset': 'Reiniciar formulario',
      'setup.btnImport': 'Importar sesión',
      'setup.btnContinue': 'Continuar a ciclos →',

      'cycles.title': 'Tabla de resumen de ciclos de prueba',
      'cycles.thArea': 'Área / Ciclo de prueba',
      'cycles.thProductVersion': 'Versión de producto',
      'cycles.thReady': 'Listo para pruebas',
      'cycles.thStatus': 'Estado',
      'cycles.thProgress': 'Progreso',
      'cycles.thPassed': 'Aprobados',
      'cycles.thRetest': 'Reevaluar',
      'cycles.thIssues': 'Nº Defectos',
      'cycles.thTestCases': 'Nº Casos de prueba',
      'cycles.thDel': 'Elim.',
      'cycles.emptyNotice': 'No hay ciclos de prueba configurados. Haga clic en <strong>+ Agregar ciclo de prueba</strong> abajo para crear su primer ciclo.',
      'cycles.btnAdd': '+ Agregar ciclo de prueba',
      'cycles.btnBack': '← Volver a configuración',
      'cycles.btnContinue': 'Continuar a defectos →',

      'bugs.title': 'Lista de defectos encontrados',
      'bugs.thType': 'Tipo',
      'bugs.thKey': 'Clave de defecto',
      'bugs.thSummary': 'Resumen / Título',
      'bugs.thDateCreated': 'Fecha de creación',
      'bugs.thSeverity': 'Severidad',
      'bugs.thStatus': 'Estado',
      'bugs.thReopen': 'Nº Reabierto',
      'bugs.thAge': 'Antigüedad',
      'bugs.thDel': 'Elim.',
      'bugs.btnOpenFilter': 'Abrir filtro en Jira ↗',
      'bugs.btnRefreshScorecard': '🔄 Actualizar puntuación',
      'bugs.emptyNotice': '¡No hay defectos registrados aún; la puntuación de calidad es 100! Si desea agregar defectos, pegue desde JIRA o haga clic en \'+ Agregar defecto\' para añadirlos manualmente.',
      'bugs.btnImport': 'Importar desde Jira',
      'bugs.btnAdd': '+ Agregar defecto',
      'bugs.btnBack': '← Volver a ciclos',
      'bugs.btnContinue': 'Generar vista previa de correo →',

      'preview.title': 'Vista previa en vivo del correo',
      'preview.staleBannerTitle': 'Fecha de sesión desactualizada detectada',
      'preview.staleBannerText': 'La fecha de esta sesión corresponde a un día anterior. ¿Desea actualizarla a la fecha de hoy?',
      'preview.btnRefresh': 'Actualizar vista previa',
      'preview.emailLangLabel': 'Idioma del correo:',
      'preview.btnBack': '← Volver a defectos',
      'preview.btnExport': 'Exportar sesión',
      'preview.btnCopy': 'Copiar correo con formato',

      'modalReset.title': '¿Reiniciar formulario del proyecto?',
      'modalReset.body': 'Esto restablecerá todos los campos del formulario, ciclos de prueba y listas de defectos a sus valores iniciales. ¿Está seguro de que desea continuar?',
      'modalReset.cancel': 'Cancelar',
      'modalReset.confirm': 'Reiniciar todos los datos',

      'modalJira.title': 'Importar defectos desde Jira',
      'modalJira.step1': '1. Abra su lista de defectos en Jira.',
      'modalJira.step2': '2. Seleccione y copie (Ctrl+C / Cmd+C) las filas de incidencias de Jira.',
      'modalJira.step3': '3. Haga clic en \'Leer portapapeles\' o pegue a continuación:',
      'modalJira.pastePlaceholder': 'Pegue las filas de la tabla de Jira aquí...',
      'modalJira.modeReplace': 'Reemplazar defectos existentes',
      'modalJira.modeAppend': 'Agregar a defectos existentes',
      'modalJira.cancel': 'Cancelar',
      'modalJira.readClipboard': '📋 Leer portapapeles',
      'modalJira.confirm': 'Importar defectos',

      'stats.score': 'Puntuación de calidad',
      'stats.excellent': 'Excelente',
      'stats.good': 'Bueno',
      'stats.fair': 'Aceptable',
      'stats.needsAttention': 'Requiere atención',

      'email.greeting': 'Saludos cordiales equipo,',
      'email.placeholder': '<¡escriba su mensaje aquí!>',
      'email.statusSummary': 'Estado Diario'
    }
  },

  /**
   * Translates a key for the given or active locale
   */
  t(key, locale = null) {
    const loc = locale || this.activeLocale || 'en';
    const dict = this.translations[loc] || this.translations['en'];
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English
    return this.translations['en'][key] || key;
  },

  /**
   * Returns current active UI locale
   */
  getLocale() {
    return this.activeLocale;
  },

  /**
   * Sets UI locale, saves preference, and updates DOM in-place
   */
  setLocale(locale) {
    if (!this.translations[locale]) {
      console.warn(`Locale ${locale} not supported, falling back to en`);
      locale = 'en';
    }
    this.activeLocale = locale;
    try {
      localStorage.setItem('seagull_qa_lang', locale);
    } catch (e) {
      console.warn('Could not persist language to localStorage:', e);
    }
    this.applyTranslations();
  },

  /**
   * Sets email output locale for Tab 4
   */
  setEmailLocale(locale) {
    this.emailLocale = locale === 'es' ? 'es-MX' : 'en';
  },

  getEmailLocale() {
    return this.emailLocale;
  },

  /**
   * Detects preferred language from localStorage or navigator
   */
  detectLocale() {
    try {
      const saved = localStorage.getItem('seagull_qa_lang');
      if (saved && this.translations[saved]) return saved;
    } catch (e) {}

    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.includes('bo')) return 'es-BO';
    if (nav.startsWith('es')) return 'es-MX';
    return 'en';
  },

  /**
   * In-place DOM text updater (preserves user inputs and focus)
   */
  applyTranslations(root = document) {
    // 1. Text elements with data-i18n
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        // If element has HTML tags in translation, support innerHTML, else textContent
        if (translation.includes('<') && translation.includes('>')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // 2. Input placeholders
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation) {
        el.setAttribute('placeholder', translation);
      }
    });

    // 3. Tooltip titles
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation) {
        el.setAttribute('title', translation);
      }
    });

    // 4. Synchronize Language Selector dropdown value if present
    const langSelect = document.getElementById('lang-select');
    if (langSelect && langSelect.value !== this.activeLocale) {
      langSelect.value = this.activeLocale;
    }

    // 5. Dispatch custom event for modules that need to re-render dynamic tables
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale: this.activeLocale } }));
  },

  /**
   * Initializes language on startup
   */
  init() {
    this.activeLocale = this.detectLocale();
    this.applyTranslations();
  }
};
