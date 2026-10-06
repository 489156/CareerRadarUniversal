import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localHtmlPath = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const liveUrl = 'https://489156.github.io/CareerRadarUniversal/';

async function runAudit(url, label) {
  console.log(`\n======================================================`);
  console.log(`🔍 STARTING CHROME DEVTOOLS HARD-TEST: [${label}]`);
  console.log(`Target URL: ${url}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs = [];
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });

  page.on('requestfailed', req => {
    requestFailures.push({
      url: req.url(),
      errorText: req.failure()?.errorText || 'Unknown failure'
    });
  });

  const testResults = {
    label,
    url,
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const status = response ? response.status() : 200;
    if (status >= 400) {
      testResults.failed.push(`HTTP status error: ${status}`);
    } else {
      testResults.passed.push(`Page loaded successfully with status ${status}`);
    }

    // 1. Initial Console & Runtime Error Check
    if (pageErrors.length > 0) {
      testResults.failed.push(`Runtime uncaught exceptions: ${pageErrors.join('; ')}`);
    } else {
      testResults.passed.push(`Zero uncaught page errors on load`);
    }

    // Filter out favicon 404 from fatal console errors if any
    const realErrors = consoleErrors.filter(e => !e.includes('favicon.ico'));
    if (realErrors.length > 0) {
      testResults.warnings.push(`Console error messages (${realErrors.length}): ${realErrors.join('; ')}`);
    } else {
      testResults.passed.push(`Zero console.error calls on load`);
    }

    // 2. Visual & SVG Guard Test
    const svgAudit = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'));
      const oversized = [];
      svgs.forEach((s, idx) => {
        const rect = s.getBoundingClientRect();
        if (rect.width > 80 || rect.height > 80) {
          oversized.push({ idx, tag: s.className.baseVal, width: rect.width, height: rect.height });
        }
      });
      return { total: svgs.length, oversized };
    });

    if (svgAudit.oversized.length > 0) {
      testResults.failed.push(`Found ${svgAudit.oversized.length} oversized SVGs (>80px): ${JSON.stringify(svgAudit.oversized)}`);
    } else {
      testResults.passed.push(`All ${svgAudit.total} SVGs properly constrained in dimensions`);
    }

    // 3. Modal Initial Hidden State Test
    const modalAudit = await page.evaluate(() => {
      const modalIds = ['resumeModal', 'jobDetailModal', 'marketValueModal', 'detailedSearchModal', 'skillGapModal', 'crawlerModal'];
      const openModals = [];
      modalIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none') {
            openModals.push({ id, display: style.display });
          }
        }
      });
      return openModals;
    });

    if (modalAudit.length > 0) {
      testResults.failed.push(`Modals visible on initial load: ${JSON.stringify(modalAudit)}`);
    } else {
      testResults.passed.push(`All modal dialogs correctly hidden (display: none) by default`);
    }

    // 4. Tab Switching Functional Test
    const tabs = ['radar', 'scanner', 'calculator', 'matrix', 'ledger', 'passport'];
    for (const tab of tabs) {
      const switchSuccess = await page.evaluate(t => {
        if (typeof window.switchTab === 'function') {
          window.switchTab(t);
          const activeSec = document.getElementById(`tab-${t}`);
          if (!activeSec) return false;
          const style = window.getComputedStyle(activeSec);
          return style.display !== 'none';
        }
        return false;
      }, tab);

      if (switchSuccess) {
        testResults.passed.push(`Tab [${tab}] activated and displayed correctly`);
      } else {
        testResults.failed.push(`Tab [${tab}] failed to activate or display`);
      }
    }

    // 5. Career Passport Input & Search Functional Test
    await page.evaluate(() => window.switchTab('passport'));
    
    // Test selecting FINANCE
    const financeSearchResult = await page.evaluate(() => {
      const occSelect = document.getElementById('p_occupation');
      const roleInput = document.getElementById('p_role');
      if (!occSelect || !roleInput) return null;
      occSelect.value = 'FINANCE';
      roleInput.value = '재무자문 / M&A';
      if (typeof window.executePassportSearch === 'function') {
        window.executePassportSearch();
        const topJob = document.querySelector('#radarJobsContainer h3');
        return {
          currentTab: document.getElementById('tab-radar') ? !document.getElementById('tab-radar').classList.contains('hidden') : false,
          topJobText: topJob ? topJob.innerText : 'None'
        };
      }
      return null;
    });

    if (financeSearchResult && financeSearchResult.currentTab) {
      testResults.passed.push(`executePassportSearch() for FINANCE switched to Radar and ranked top job: "${financeSearchResult.topJobText}"`);
    } else {
      testResults.failed.push(`executePassportSearch() failed for FINANCE`);
    }

    // Test selecting HR
    const hrSearchResult = await page.evaluate(() => {
      const occSelect = document.getElementById('p_occupation');
      const roleInput = document.getElementById('p_role');
      occSelect.value = 'HR';
      roleInput.value = '인사기획 / 평가보상';
      window.executePassportSearch();
      const topJob = document.querySelector('#radarJobsContainer h3');
      return {
        topJobText: topJob ? topJob.innerText : 'None'
      };
    });

    if (hrSearchResult && (hrSearchResult.topJobText.includes('HRM') || hrSearchResult.topJobText.includes('인사') || hrSearchResult.topJobText.includes('조직문화') || hrSearchResult.topJobText.includes('Talent'))) {
      testResults.passed.push(`executePassportSearch() for HR accurately ranked top HR job: "${hrSearchResult.topJobText}"`);
    } else {
      testResults.warnings.push(`HR search top job: "${hrSearchResult?.topJobText}"`);
    }

    // 6. Modal Open & Close Lifecycle Test
    const modalTestResult = await page.evaluate(() => {
      const results = {};
      
      // Test Crawler Modal
      if (typeof window.openCrawlerModal === 'function') {
        window.openCrawlerModal();
        const m = document.getElementById('crawlerModal');
        const openOk = m && window.getComputedStyle(m).display !== 'none';
        window.closeCrawlerModal();
        const closeOk = m && window.getComputedStyle(m).display === 'none';
        results.crawlerModal = openOk && closeOk;
      }
      
      // Test Resume Modal
      if (typeof window.openResumeParserModal === 'function') {
        window.openResumeParserModal();
        const m = document.getElementById('resumeModal');
        const openOk = m && window.getComputedStyle(m).display !== 'none';
        window.closeResumeParserModal();
        const closeOk = m && window.getComputedStyle(m).display === 'none';
        results.resumeModal = openOk && closeOk;
      }

      // Test Detailed Search Modal
      if (typeof window.openDetailedSearchModal === 'function') {
        window.openDetailedSearchModal();
        const m = document.getElementById('detailedSearchModal');
        const openOk = m && window.getComputedStyle(m).display !== 'none';
        window.closeDetailedSearchModal();
        const closeOk = m && window.getComputedStyle(m).display === 'none';
        results.detailedSearchModal = openOk && closeOk;
      }

      return results;
    });

    Object.entries(modalTestResult).forEach(([name, ok]) => {
      if (ok) {
        testResults.passed.push(`Modal lifecycle test for [${name}]: OPEN & CLOSE verified`);
      } else {
        testResults.failed.push(`Modal lifecycle test for [${name}] failed`);
      }
    });

    // 7. Labor Risk Scanner Interactive Test
    const scannerResult = await page.evaluate(() => {
      window.switchTab('scanner');
      if (typeof window.loadSampleText === 'function') {
        window.loadSampleText('sample1');
        if (typeof window.runLaborScan === 'function') {
          window.runLaborScan();
          const rep = document.getElementById('scanResultCard');
          return {
            hasReport: rep && window.getComputedStyle(rep).display !== 'none',
            reportText: rep ? rep.innerText.slice(0, 100) : ''
          };
        }
      }
      return null;
    });

    if (scannerResult && scannerResult.hasReport) {
      testResults.passed.push(`Labor Risk Scanner: executed diagnostic scan successfully`);
    } else {
      testResults.failed.push(`Labor Risk Scanner execution failed`);
    }

    // 8. Life-Adjusted Calculator Interactive Test
    const calcResult = await page.evaluate(() => {
      window.switchTab('calculator');
      const cashInput = document.getElementById('c_cash');
      const commuteInput = document.getElementById('c_commute');
      if (cashInput && commuteInput) {
        cashInput.value = '6000';
        commuteInput.value = '60';
        if (typeof window.updateCalculator === 'function') {
          window.updateCalculator();
          const wageElem = document.getElementById('res_realWage');
          return { wage: wageElem ? wageElem.innerText : '0' };
        }
      }
      return null;
    });

    if (calcResult && calcResult.wage && calcResult.wage !== '0') {
      testResults.passed.push(`Life-Adjusted Calculator: recalculation verified (Wage: ${calcResult.wage})`);
    } else {
      testResults.failed.push(`Life-Adjusted Calculator failed`);
    }

    // 9. Accessibility Form Inputs Audit (Orphaned Inputs)
    const a11yInputs = await page.evaluate(() => {
      const orphaned = [];
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      inputs.forEach(i => {
        const hasId = i.id && document.querySelector(`label[for="${i.id}"]`);
        const hasAria = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
        const hasParentLabel = i.closest('label');
        if (!hasId && !hasAria && !hasParentLabel && i.type !== 'hidden') {
          orphaned.push({ tag: i.tagName, id: i.id || '(no id)', type: i.type, placeholder: i.placeholder || '' });
        }
      });
      return orphaned;
    });

    if (a11yInputs.length > 0) {
      testResults.warnings.push(`Accessibility: Found ${a11yInputs.length} inputs without label or aria-label: ${JSON.stringify(a11yInputs.slice(0, 5))}`);
    } else {
      testResults.passed.push(`Accessibility: 100% of form inputs properly linked to labels or aria attributes`);
    }

    // 10. Performance / DOM Node Count
    const metrics = await page.metrics();
    testResults.passed.push(`Performance Metrics: DOM Nodes = ${metrics.Nodes}, JS Heap = ${(metrics.JSHeapUsedSize / (1024 * 1024)).toFixed(2)} MB`);

  } catch (err) {
    testResults.failed.push(`Test execution fatal error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log(`\n--- RESULTS FOR [${label}] ---`);
  console.log(`✅ PASSED (${testResults.passed.length}):`);
  testResults.passed.forEach(p => console.log(`   + ${p}`));
  if (testResults.warnings.length > 0) {
    console.log(`⚠️ WARNINGS (${testResults.warnings.length}):`);
    testResults.warnings.forEach(w => console.log(`   * ${w}`));
  }
  if (testResults.failed.length > 0) {
    console.log(`❌ FAILED (${testResults.failed.length}):`);
    testResults.failed.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log(`🎉 ALL TESTS PASSED WITH ZERO FAILURES!`);
  }

  return testResults;
}

async function main() {
  console.log('Starting Dual-Target Chrome DevTools Hard-Test...');
  const localResults = await runAudit(localHtmlPath, 'LOCAL STANDALONE (index.html)');
  
  if (localResults.failed.length > 0) {
    console.log(`\n[ALERT] Local audit found ${localResults.failed.length} failures.`);
    process.exit(1);
  } else {
    console.log('\n[SUCCESS] Local index.html passed all Hard-Tests cleanly!');
  }

  // Also verify live GitHub Pages URL
  try {
    const liveResults = await runAudit(liveUrl, 'LIVE PRODUCTION (GitHub Pages)');
    if (liveResults.failed.length > 0) {
      console.log(`\n[ALERT] Live audit found ${liveResults.failed.length} failures.`);
    } else {
      console.log('\n[SUCCESS] Live GitHub Pages passed all Hard-Tests cleanly!');
    }
  } catch (err) {
    console.warn(`\n[WARNING] Live audit skipped or timed out: ${err.message}`);
  }
}

main().catch(err => {
  console.error('Hard-test runner failed:', err);
  process.exit(1);
});
