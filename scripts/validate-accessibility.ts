#!/usr/bin/env ts-node

/**
 * Accessibility validation script for Soomgo theme
 * Run with: npx ts-node scripts/validate-accessibility.ts
 */

import { validateSoomgoTheme } from '../lib/accessibility/theme-validation';
import { writeFileSync } from 'fs';
import { join } from 'path';

function main() {
  console.log('🎨 Soomgo Theme Accessibility Validation\n');
  console.log('=' .repeat(50));

  try {
    const validation = validateSoomgoTheme();

    // Write report to file
    const reportPath = join(process.cwd(), 'accessibility-report.md');
    writeFileSync(reportPath, validation.reportText);

    // Write CSS variables to file
    const cssPath = join(process.cwd(), 'accessibility-vars.css');
    writeFileSync(cssPath, validation.cssVars);

    console.log(`\n📁 Files generated:`);
    console.log(`  - Accessibility Report: ${reportPath}`);
    console.log(`  - CSS Variables: ${cssPath}`);

    if (validation.isCompliant) {
      console.log('\n✅ Theme is WCAG 2.1 AA compliant!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Theme needs accessibility improvements.');
      console.log(`Compliance rate: ${validation.report.summary.complianceRate}%`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error during validation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}