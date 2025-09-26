/**
 * Lighthouse Performance Testing Script
 * Tests Core Web Vitals and performance metrics
 *
 * GitHub Issue #47: [테스트] 브라우저 호환성 및 성능 테스트
 * Requirements: Lighthouse score 90+, loading time < 3 seconds
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Performance thresholds based on issue requirements
const PERFORMANCE_THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
  pwa: 80,
  'first-contentful-paint': 2000,
  'largest-contentful-paint': 3000,
  'cumulative-layout-shift': 0.1,
  'total-blocking-time': 300
};

// Pages to test
const TEST_PAGES = [
  { url: 'http://localhost:3000/', name: 'Home' },
  { url: 'http://localhost:3000/home', name: 'Dashboard' },
  { url: 'http://localhost:3000/community', name: 'Community' },
  { url: 'http://localhost:3000/location', name: 'Location' },
  { url: 'http://localhost:3000/marketplace', name: 'Marketplace' },
  { url: 'http://localhost:3000/profile', name: 'Profile' }
];

// Lighthouse configuration
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  }
};

async function launchChromeAndRunLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});

  const config = {
    ...LIGHTHOUSE_CONFIG,
    ...options,
    port: chrome.port
  };

  try {
    const runnerResult = await lighthouse(url, config);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function checkPerformanceThresholds(lhr) {
  const results = {
    passed: true,
    failures: [],
    scores: {}
  };

  // Check category scores
  const categories = lhr.categories;
  Object.keys(PERFORMANCE_THRESHOLDS).forEach(key => {
    if (categories[key]) {
      const score = categories[key].score * 100;
      results.scores[key] = score;

      if (score < PERFORMANCE_THRESHOLDS[key]) {
        results.passed = false;
        results.failures.push(`${key}: ${score} < ${PERFORMANCE_THRESHOLDS[key]}`);
      }
    }
  });

  // Check Core Web Vitals
  const audits = lhr.audits;

  // First Contentful Paint
  if (audits['first-contentful-paint']) {
    const fcp = audits['first-contentful-paint'].numericValue;
    results.scores['first-contentful-paint'] = fcp;
    if (fcp > PERFORMANCE_THRESHOLDS['first-contentful-paint']) {
      results.passed = false;
      results.failures.push(`FCP: ${fcp}ms > ${PERFORMANCE_THRESHOLDS['first-contentful-paint']}ms`);
    }
  }

  // Largest Contentful Paint
  if (audits['largest-contentful-paint']) {
    const lcp = audits['largest-contentful-paint'].numericValue;
    results.scores['largest-contentful-paint'] = lcp;
    if (lcp > PERFORMANCE_THRESHOLDS['largest-contentful-paint']) {
      results.passed = false;
      results.failures.push(`LCP: ${lcp}ms > ${PERFORMANCE_THRESHOLDS['largest-contentful-paint']}ms`);
    }
  }

  // Cumulative Layout Shift
  if (audits['cumulative-layout-shift']) {
    const cls = audits['cumulative-layout-shift'].numericValue;
    results.scores['cumulative-layout-shift'] = cls;
    if (cls > PERFORMANCE_THRESHOLDS['cumulative-layout-shift']) {
      results.passed = false;
      results.failures.push(`CLS: ${cls} > ${PERFORMANCE_THRESHOLDS['cumulative-layout-shift']}`);
    }
  }

  // Total Blocking Time
  if (audits['total-blocking-time']) {
    const tbt = audits['total-blocking-time'].numericValue;
    results.scores['total-blocking-time'] = tbt;
    if (tbt > PERFORMANCE_THRESHOLDS['total-blocking-time']) {
      results.passed = false;
      results.failures.push(`TBT: ${tbt}ms > ${PERFORMANCE_THRESHOLDS['total-blocking-time']}ms`);
    }
  }

  return results;
}

function generateReport(results) {
  const timestamp = new Date().toISOString();
  let report = `# Lighthouse Performance Test Report\n`;
  report += `Generated: ${timestamp}\n\n`;

  let allPassed = true;

  results.forEach(result => {
    report += `## ${result.pageName} (${result.url})\n\n`;

    if (result.error) {
      report += `❌ **Error**: ${result.error}\n\n`;
      allPassed = false;
      return;
    }

    const { passed, failures, scores } = result.analysis;

    if (passed) {
      report += `✅ **All thresholds passed**\n\n`;
    } else {
      report += `❌ **Failed thresholds**:\n`;
      failures.forEach(failure => {
        report += `- ${failure}\n`;
      });
      report += `\n`;
      allPassed = false;
    }

    // Performance Scores
    report += `### Performance Scores\n`;
    report += `| Metric | Score | Threshold |\n`;
    report += `|--------|-------|----------|\n`;

    Object.keys(scores).forEach(metric => {
      const score = scores[metric];
      const threshold = PERFORMANCE_THRESHOLDS[metric];
      const status = score >= threshold ? '✅' : '❌';

      if (metric.includes('paint') || metric.includes('blocking')) {
        report += `| ${metric} | ${score}ms | ${threshold}ms ${status} |\n`;
      } else if (metric === 'cumulative-layout-shift') {
        report += `| ${metric} | ${score.toFixed(3)} | ${threshold} ${status} |\n`;
      } else {
        report += `| ${metric} | ${score} | ${threshold} ${status} |\n`;
      }
    });

    report += `\n`;

    // Core Web Vitals Summary
    if (scores['first-contentful-paint'] || scores['largest-contentful-paint']) {
      report += `### Core Web Vitals\n`;
      if (scores['first-contentful-paint']) {
        report += `- **FCP**: ${scores['first-contentful-paint']}ms\n`;
      }
      if (scores['largest-contentful-paint']) {
        report += `- **LCP**: ${scores['largest-contentful-paint']}ms\n`;
      }
      if (scores['cumulative-layout-shift']) {
        report += `- **CLS**: ${scores['cumulative-layout-shift'].toFixed(3)}\n`;
      }
      if (scores['total-blocking-time']) {
        report += `- **TBT**: ${scores['total-blocking-time']}ms\n`;
      }
      report += `\n`;
    }
  });

  // Overall Summary
  report += `## Overall Summary\n\n`;
  if (allPassed) {
    report += `🎉 **All pages passed performance thresholds!**\n\n`;
  } else {
    report += `⚠️ **Some pages failed to meet performance thresholds.**\n\n`;
  }

  const passedCount = results.filter(r => !r.error && r.analysis.passed).length;
  const totalCount = results.filter(r => !r.error).length;
  report += `**Results**: ${passedCount}/${totalCount} pages passed\n\n`;

  return { report, allPassed };
}

async function runPerformanceTests() {
  console.log('🚀 Starting Lighthouse performance tests...\n');

  const results = [];

  for (const page of TEST_PAGES) {
    console.log(`Testing: ${page.name} (${page.url})`);

    try {
      const runnerResult = await launchChromeAndRunLighthouse(page.url);
      const analysis = checkPerformanceThresholds(runnerResult.lhr);

      results.push({
        pageName: page.name,
        url: page.url,
        analysis,
        lhr: runnerResult.lhr
      });

      console.log(`✅ ${page.name}: ${analysis.passed ? 'PASSED' : 'FAILED'}`);
      if (!analysis.passed) {
        console.log(`   Failures: ${analysis.failures.join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ ${page.name}: ERROR - ${error.message}`);
      results.push({
        pageName: page.name,
        url: page.url,
        error: error.message
      });
    }
  }

  // Generate and save report
  const { report, allPassed } = generateReport(results);

  const reportsDir = path.join(__dirname, '..', 'test-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'lighthouse-performance-report.md');
  fs.writeFileSync(reportPath, report);

  console.log(`\n📊 Report saved to: ${reportPath}`);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed!'}`);

  // Exit with appropriate code for CI/CD
  process.exit(allPassed ? 0 : 1);
}

// CLI execution
if (require.main === module) {
  runPerformanceTests().catch(error => {
    console.error('❌ Performance test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runPerformanceTests,
  launchChromeAndRunLighthouse,
  checkPerformanceThresholds,
  PERFORMANCE_THRESHOLDS
};