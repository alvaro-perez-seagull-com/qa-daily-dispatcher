import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runLocalizationTests() {
  console.log("=== Starting Playwright Suite: Spanish Multi-Locale Localization (en, es-MX, es-BO) ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Navigate to app
    await page.goto('http://localhost:8088/index.html');
    await page.waitForLoadState('networkidle');

    // Clean baseline
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForLoadState('networkidle');

    console.log("\n--- TEST CASE 1: Baseline Load & English Default ---");
    const langSelectVal = await page.$eval('#lang-select', el => el.value);
    console.log(`  Initial Language Selector Value: "${langSelectVal}" (Expected: "en")`);
    if (langSelectVal !== 'en') throw new Error(`TC-1 FAILED: Expected 'en', got '${langSelectVal}'`);

    const brandSubtitle = await page.$eval('.brand-subtitle', el => el.textContent.trim());
    console.log(`  Brand Subtitle: "${brandSubtitle}"`);
    if (!brandSubtitle.includes("Automated Outlook Daily Status Generator")) {
      throw new Error(`TC-1 FAILED: Subtitle not in English: ${brandSubtitle}`);
    }

    const tab1Text = await page.$eval('[data-tab="setup"]', el => el.textContent.trim());
    console.log(`  Tab 1 Label: "${tab1Text}"`);
    if (tab1Text !== '1. Project Setup & Links') throw new Error(`TC-1 FAILED: Tab 1 label incorrect: ${tab1Text}`);

    const featureLabel = await page.$eval('label[data-i18n="setup.featureName"]', el => el.textContent.trim());
    console.log(`  Feature Label: "${featureLabel}"`);
    if (featureLabel !== 'Feature Initiative Name') throw new Error(`TC-1 FAILED: Feature label incorrect: ${featureLabel}`);
    console.log("  PASS: Baseline is English by default.");

    console.log("\n--- TEST CASE 2: Switch to Spanish (Mexico - es-MX) & Verify In-Place Translation Without Data Loss ---");
    // Enter user input in form fields
    await page.fill('#input-feature-name', 'Intelligent Forms Preview');
    await page.fill('#input-sender-name', 'Alvaro Perez');
    await page.fill('#input-idea-key', 'IDEA-3110');
    await page.fill('#input-sp', '5');

    // Change language to es-MX via select dropdown
    await page.selectOption('#lang-select', 'es-MX');
    await page.waitForTimeout(200);

    const langAfterMx = await page.$eval('#lang-select', el => el.value);
    if (langAfterMx !== 'es-MX') throw new Error(`TC-2 FAILED: Selector value not updated: ${langAfterMx}`);

    const subtitleMx = await page.$eval('.brand-subtitle', el => el.textContent.trim());
    console.log(`  Subtitle (es-MX): "${subtitleMx}"`);
    if (!subtitleMx.includes("Generador automatizado de estado diario")) {
      throw new Error(`TC-2 FAILED: Subtitle not translated to es-MX: ${subtitleMx}`);
    }

    const tab1Mx = await page.$eval('[data-tab="setup"]', el => el.textContent.trim());
    console.log(`  Tab 1 (es-MX): "${tab1Mx}"`);
    if (tab1Mx !== '1. Configuración del proyecto y enlaces') {
      throw new Error(`TC-2 FAILED: Tab 1 not translated to es-MX: ${tab1Mx}`);
    }

    const featureLabelMx = await page.$eval('label[data-i18n="setup.featureName"]', el => el.textContent.trim());
    console.log(`  Feature Label (es-MX): "${featureLabelMx}"`);
    if (featureLabelMx !== 'Nombre de la iniciativa de funcionalidad') {
      throw new Error(`TC-2 FAILED: Feature label not translated to es-MX: ${featureLabelMx}`);
    }

    // VERIFY ZERO DATA LOSS on user inputs
    const typedFeatureName = await page.$eval('#input-feature-name', el => el.value);
    const typedSenderName = await page.$eval('#input-sender-name', el => el.value);
    const typedIdeaKey = await page.$eval('#input-idea-key', el => el.value);
    const typedSp = await page.$eval('#input-sp', el => el.value);
    console.log(`  Preserved Inputs: Feature="${typedFeatureName}", Sender="${typedSenderName}", Key="${typedIdeaKey}", SP="${typedSp}"`);
    if (typedFeatureName !== 'Intelligent Forms Preview' || typedSenderName !== 'Alvaro Perez' || typedIdeaKey !== 'IDEA-3110' || typedSp !== '5') {
      throw new Error("TC-2 FAILED: User input was lost or corrupted during language switch!");
    }
    console.log("  PASS: es-MX translations applied in-place with 100% input data preservation.");

    console.log("\n--- TEST CASE 3: Dynamic Table Headers in Tab 2 & Tab 3 (es-MX) ---");
    // Switch to Tab 2
    await page.click('[data-tab="summary"]');
    await page.waitForTimeout(200);

    const cyclesThArea = await page.$eval('th[data-i18n="cycles.thArea"]', el => el.textContent.trim());
    const cyclesThReady = await page.$eval('th[data-i18n="cycles.thReady"]', el => el.textContent.trim());
    const cyclesThProgress = await page.$eval('th[data-i18n="cycles.thProgress"]', el => el.textContent.trim());
    console.log(`  Cycles Headers: Area="${cyclesThArea}", Ready="${cyclesThReady}", Progress="${cyclesThProgress}"`);
    if (cyclesThArea !== 'Área / Ciclo de prueba' || cyclesThReady !== 'Listo para probar' || cyclesThProgress !== 'Progreso') {
      throw new Error("TC-3 FAILED: Cycles table headers not properly translated in es-MX");
    }

    // Switch to Tab 3
    await page.click('[data-tab="bugs"]');
    await page.waitForTimeout(200);

    const bugsThKey = await page.$eval('th[data-i18n="bugs.thKey"]', el => el.textContent.trim());
    const bugsThSeverity = await page.$eval('th[data-i18n="bugs.thSeverity"]', el => el.textContent.trim());
    const bugsThReopen = await page.$eval('th[data-i18n="bugs.thReopen"]', el => el.textContent.trim());
    const bugsBtnImport = await page.$eval('[data-i18n="bugs.btnImport"]', el => el.textContent.trim());
    console.log(`  Bugs Headers & Buttons: Key="${bugsThKey}", Sev="${bugsThSeverity}", Reopen="${bugsThReopen}", Import="${bugsBtnImport}"`);
    if (bugsThKey !== 'Clave de defecto' || bugsThSeverity !== 'Severidad' || bugsThReopen !== 'Nº Reabierto' || !bugsBtnImport.includes('Importar desde Jira')) {
      throw new Error("TC-3 FAILED: Bugs table headers or buttons not properly translated in es-MX");
    }
    console.log("  PASS: Table headers and buttons across execution tabs accurately localized in es-MX.");

    console.log("\n--- TEST CASE 4: Switch to Spanish (Bolivia - es-BO) & Verify Regional Nuances ---");
    await page.selectOption('#lang-select', 'es-BO');
    await page.waitForTimeout(200);

    const subtitleBo = await page.$eval('.brand-subtitle', el => el.textContent.trim());
    console.log(`  Subtitle (es-BO): "${subtitleBo}"`);
    if (!subtitleBo.includes("Generador automatizado de reporte diario")) {
      throw new Error(`TC-4 FAILED: Subtitle not translated to es-BO: ${subtitleBo}`);
    }

    // Switch to Tab 1 to verify Bolivian nuance: "Nombre del módulo / iniciativa"
    await page.click('[data-tab="setup"]');
    await page.waitForTimeout(200);
    const featureLabelBo = await page.$eval('label[data-i18n="setup.featureName"]', el => el.textContent.trim());
    const btnResetBo = await page.$eval('[data-i18n="setup.btnReset"]', el => el.textContent.trim());
    console.log(`  Feature Label (es-BO): "${featureLabelBo}", Reset Btn="${btnResetBo}"`);
    if (featureLabelBo !== 'Nombre del módulo / iniciativa' || btnResetBo !== 'Reiniciar formulario') {
      throw new Error(`TC-4 FAILED: Bolivian nuances not reflected: Feature="${featureLabelBo}", Reset="${btnResetBo}"`);
    }
    console.log("  PASS: es-BO nuances correctly rendered.");

    console.log("\n--- TEST CASE 5: Persistence Across Page Reload ---");
    const storedLang = await page.evaluate(() => localStorage.getItem('seagull_qa_lang'));
    console.log(`  localStorage['seagull_qa_lang']: "${storedLang}"`);
    if (storedLang !== 'es-BO') throw new Error(`TC-5 FAILED: localStorage has wrong lang: ${storedLang}`);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    const selectAfterReload = await page.$eval('#lang-select', el => el.value);
    const subtitleAfterReload = await page.$eval('.brand-subtitle', el => el.textContent.trim());
    console.log(`  After Reload: Selector="${selectAfterReload}", Subtitle="${subtitleAfterReload}"`);
    if (selectAfterReload !== 'es-BO' || !subtitleAfterReload.includes("Generador automatizado de reporte diario")) {
      throw new Error("TC-5 FAILED: Language preference did not persist across reload");
    }
    console.log("  PASS: Language preference persisted across browser reload.");

    console.log("\n--- TEST CASE 6: Tab 4 Email Preview & Email Language Toggle ---");
    // Navigate to Tab 4
    await page.click('[data-tab="preview"]');
    await page.waitForTimeout(300);

    // Verify Subject line date format is strictly YYYY-MM-DD
    const subjectLine = await page.$eval('#preview-subject-input', el => el.value);
    console.log(`  Subject Line: "${subjectLine}"`);
    const dateMatch = subjectLine.match(/\d{4}-\d{2}-\d{2}$/);
    if (!dateMatch) {
      throw new Error(`TC-6 FAILED: Subject line date does not match YYYY-MM-DD format: ${subjectLine}`);
    }
    console.log(`  Subject line date constraint verified: ends with "${dateMatch[0]}"`);

    // Verify default email template content (English)
    let iframeContent = await page.$eval('#email-preview-frame', el => el.srcdoc || '');
    if (!iframeContent.includes('Team,') || !iframeContent.includes('Summary') || !iframeContent.includes('Quality Scorecard')) {
      throw new Error("TC-6 FAILED: Default email template is not English");
    }
    console.log("  Default email template verified: English headings and greeting.");

    // Toggle Email Language to Spanish
    console.log("  Clicking Email Language Toggle: ES...");
    await page.click('#btn-email-lang-es');
    await page.waitForTimeout(300);

    const isEsActive = await page.$eval('#btn-email-lang-es', el => el.classList.contains('active'));
    const isEnActive = await page.$eval('#btn-email-lang-en', el => el.classList.contains('active'));
    if (!isEsActive || isEnActive) {
      throw new Error("TC-6 FAILED: Email language toggle buttons did not update active classes");
    }

    // Verify email template content updated to Spanish
    iframeContent = await page.$eval('#email-preview-frame', el => el.srcdoc || '');
    if (!iframeContent.includes('Hola a todos,') || 
        !iframeContent.includes('Resumen de ciclos de prueba') || 
        !iframeContent.includes('Puntuación de calidad') || 
        !iframeContent.includes('Defectos por severidad') || 
        !iframeContent.includes('Lista de defectos encontrados') || 
        !iframeContent.includes('Enlaces rápidos')) {
      throw new Error("TC-6 FAILED: Email template inside iframe was not translated to Spanish");
    }
    console.log("  Spanish email template verified: All headings, table headers, and greetings translated.");

    // Verify subject line date format STILL DOES NOT CHANGE
    const subjectLineAfterEmailToggle = await page.$eval('#preview-subject-input', el => el.value);
    console.log(`  Subject Line After Spanish Toggle: "${subjectLineAfterEmailToggle}"`);
    const dateMatchAfter = subjectLineAfterEmailToggle.match(/\d{4}-\d{2}-\d{2}$/);
    if (!dateMatchAfter) {
      throw new Error(`TC-6 FAILED: Subject line date changed or corrupted: ${subjectLineAfterEmailToggle}`);
    }
    if (dateMatch[0] !== dateMatchAfter[0]) {
      throw new Error(`TC-6 FAILED: Subject line date shifted from ${dateMatch[0]} to ${dateMatchAfter[0]}`);
    }
    console.log("  PASS: Subject line YYYY-MM-DD date format was 100% preserved.");

    console.log("\n--- TEST CASE 7: Switch Back to English ---");
    await page.selectOption('#lang-select', 'en');
    await page.waitForTimeout(200);

    const finalLangVal = await page.$eval('#lang-select', el => el.value);
    const finalSubtitle = await page.$eval('.brand-subtitle', el => el.textContent.trim());
    if (finalLangVal !== 'en' || !finalSubtitle.includes("Automated Outlook Daily Status Generator")) {
      throw new Error("TC-7 FAILED: Could not restore English language");
    }
    console.log("  PASS: Clean restoration back to English.");

    console.log("\n=================================================================");
    console.log("🎉 ALL LOCALIZATION TESTS PASSED WITH 100% SUCCESS!");
    console.log("=================================================================\n");
  } finally {
    await browser.close();
  }
}

runLocalizationTests().catch(err => {
  console.error("❌ TEST RUNNER FATAL ERROR:", err);
  process.exit(1);
});
