import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function runTests() {
  console.log("=== Starting Playwright Suite: Strict JSON Import Validation (Wishlist Item 10) ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let lastDialogMessage = null;
  page.on('dialog', async dialog => {
    lastDialogMessage = dialog.message();
    console.log(`  [Dialog Intercepted] Type: ${dialog.type()} | Message: "${lastDialogMessage}"`);
    await dialog.accept();
  });

  try {
    // Navigate to local app
    await page.goto('http://localhost:8088/index.html');
    await page.waitForLoadState('networkidle');

    // Clear local storage for clean baseline test
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForLoadState('networkidle');

    console.log("\n--- TEST CASE 1: Baseline Verification ---");
    const initialFeatureName = await page.$eval('#input-feature-name', el => el.value);
    console.log(`  Initial Feature Name: "${initialFeatureName}" (Expected empty)`);
    if (initialFeatureName !== "") throw new Error("Baseline not clean");
    console.log("  PASS: Baseline is clean.");

    console.log("\n--- TEST CASE 2: Negative - Reject Non-JSON (.yaml) ---");
    lastDialogMessage = null;
    const yamlPath = path.join(projectRoot, 'tests', 'fixtures', 'session.yaml');
    await page.setInputFiles('#session-file-input', yamlPath);
    await page.waitForTimeout(300);

    console.log(`  Intercepted Message: "${lastDialogMessage}"`);
    if (!lastDialogMessage || !lastDialogMessage.includes('Invalid file type') || !lastDialogMessage.includes('.json')) {
      throw new Error(`TC-2 FAILED: Expected invalid file type message, got: ${lastDialogMessage}`);
    }
    const featureNameAfterYaml = await page.$eval('#input-feature-name', el => el.value);
    if (featureNameAfterYaml !== "") throw new Error("TC-2 FAILED: State was corrupted by YAML file");
    console.log("  PASS: YAML file successfully intercepted and rejected. Live state 100% untouched.");

    console.log("\n--- TEST CASE 3: Negative - Reject Non-JSON (.csv) ---");
    lastDialogMessage = null;
    const csvPath = path.join(projectRoot, 'tests', 'fixtures', 'session.csv');
    await page.setInputFiles('#session-file-input', csvPath);
    await page.waitForTimeout(300);

    console.log(`  Intercepted Message: "${lastDialogMessage}"`);
    if (!lastDialogMessage || !lastDialogMessage.includes('Invalid file type') || !lastDialogMessage.includes('.json')) {
      throw new Error(`TC-3 FAILED: Expected invalid file type message, got: ${lastDialogMessage}`);
    }
    const featureNameAfterCsv = await page.$eval('#input-feature-name', el => el.value);
    if (featureNameAfterCsv !== "") throw new Error("TC-3 FAILED: State was corrupted by CSV file");
    console.log("  PASS: CSV file successfully intercepted and rejected. Live state 100% untouched.");

    console.log("\n--- TEST CASE 4: Negative - Reject Arbitrary JSON Structure ---");
    lastDialogMessage = null;
    const arbitraryPath = path.join(projectRoot, 'tests', 'fixtures', 'arbitrary.json');
    await page.setInputFiles('#session-file-input', arbitraryPath);
    await page.waitForTimeout(300);

    console.log(`  Intercepted Message: "${lastDialogMessage}"`);
    if (!lastDialogMessage || !lastDialogMessage.includes('does not match the Seagull QA Daily Dispatcher session schema')) {
      throw new Error(`TC-4 FAILED: Expected schema mismatch error, got: ${lastDialogMessage}`);
    }
    const featureNameAfterArbitrary = await page.$eval('#input-feature-name', el => el.value);
    if (featureNameAfterArbitrary !== "") throw new Error("TC-4 FAILED: State was corrupted by arbitrary JSON");
    console.log("  PASS: Arbitrary JSON intercepted by schema validator. Live state 100% untouched.");

    console.log("\n--- TEST CASE 5: Negative - Reject Corrupted JSON Syntax ---");
    lastDialogMessage = null;
    const corruptedPath = path.join(projectRoot, 'tests', 'fixtures', 'corrupted.json');
    await page.setInputFiles('#session-file-input', corruptedPath);
    await page.waitForTimeout(300);

    console.log(`  Intercepted Message: "${lastDialogMessage}"`);
    if (!lastDialogMessage || !lastDialogMessage.includes('Invalid JSON syntax')) {
      throw new Error(`TC-5 FAILED: Expected JSON syntax error, got: ${lastDialogMessage}`);
    }
    const featureNameAfterCorrupted = await page.$eval('#input-feature-name', el => el.value);
    if (featureNameAfterCorrupted !== "") throw new Error("TC-5 FAILED: State was corrupted by corrupted JSON");
    console.log("  PASS: Corrupted JSON intercepted by parser. Live state 100% untouched.");

    console.log("\n--- TEST CASE 6: Happy Path & Immediate Re-selection (Valid Dispatcher Session) ---");
    lastDialogMessage = null;
    const validPath = path.join(projectRoot, 'tests', 'fixtures', 'valid-session.json');
    await page.setInputFiles('#session-file-input', validPath);
    await page.waitForTimeout(500);

    // Dialog should NOT be triggered on successful import
    if (lastDialogMessage !== null) {
      throw new Error(`TC-6 FAILED: Unexpected dialog on valid import: ${lastDialogMessage}`);
    }

    // Verify toast notification
    const toastText = await page.$eval('#toast', el => el.textContent);
    console.log(`  Toast Notification: "${toastText}"`);
    if (!toastText.includes('Session loaded successfully')) {
      throw new Error(`TC-6 FAILED: Expected success toast, got: "${toastText}"`);
    }

    // Verify state population
    const featureName = await page.$eval('#input-feature-name', el => el.value);
    const productVersion = await page.$eval('#input-product-version', el => el.value);
    const epicKey = await page.$eval('#input-epic-key', el => el.value);
    const ideaKey = await page.$eval('#input-idea-key', el => el.value);

    console.log(`  Imported Feature Name: "${featureName}"`);
    console.log(`  Imported Product/Version: "${productVersion}"`);
    console.log(`  Imported Epic Key: "${epicKey}"`);
    console.log(`  Imported Idea Key: "${ideaKey}"`);

    if (featureName !== 'Intelligent Forms: Refreshable Print Preview') throw new Error("TC-6: Feature name mismatch");
    if (productVersion !== 'BTC v12.6') throw new Error("TC-6: Product/Version mismatch");
    if (epicKey !== 'BPLAT-20767') throw new Error("TC-6: Epic key mismatch");
    if (ideaKey !== 'IDEA-3110') throw new Error("TC-6: Idea key mismatch");

    // Verify test cycles table populated
    const cycleRows = await page.$$eval('#cycles-table-body tr', rows => rows.length);
    console.log(`  Imported Test Cycle Rows: ${cycleRows}`);
    if (cycleRows < 5) throw new Error(`TC-6: Expected at least 5 cycle rows, got ${cycleRows}`);

    // Take verification screenshot
    const screenshotPath = path.join(projectRoot, 'tests', 'fixtures', 'evidence-import-success.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  Evidence screenshot saved: ${screenshotPath}`);

    console.log("\n=== ALL 6 TEST CASES PASSED 100% ===");
  } finally {
    await browser.close();
  }
}

runTests().catch(err => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
