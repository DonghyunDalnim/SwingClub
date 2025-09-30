/**
 * Color Contrast Validation Utilities for WCAG 2.1 AA Compliance
 *
 * This module provides utilities to:
 * - Calculate color contrast ratios
 * - Validate WCAG compliance
 * - Suggest accessible color alternatives
 * - Generate accessibility reports
 */

export interface ContrastResult {
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
  };
  level: 'fail' | 'aa' | 'aaa';
}

export interface ColorPair {
  foreground: string;
  background: string;
  context: string;
  usage: string;
}

export interface AccessibilityReport {
  colorPairs: Array<ColorPair & { result: ContrastResult; recommendations?: string[] }>;
  summary: {
    total: number;
    passing: number;
    failing: number;
    complianceRate: number;
  };
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;

  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    throw new Error('Invalid color format. Please use hex colors (e.g., #693BF2)');
  }

  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG contrast requirements
 */
export function checkContrastCompliance(
  foreground: string,
  background: string,
  textSize: 'normal' | 'large' = 'normal'
): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  // WCAG 2.1 requirements
  const requirements = {
    normal: { aa: 4.5, aaa: 7 },
    large: { aa: 3, aaa: 4.5 }
  };

  const thresholds = requirements[textSize];

  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: {
      aa: ratio >= thresholds.aa,
      aaa: ratio >= thresholds.aaa
    },
    level: ratio >= thresholds.aaa ? 'aaa' : ratio >= thresholds.aa ? 'aa' : 'fail'
  };
}

/**
 * Generate darker or lighter variants of a color for better contrast
 */
export function generateAccessibleVariant(
  baseColor: string,
  targetBackground: string,
  targetRatio: number = 4.5
): string[] {
  const baseRgb = hexToRgb(baseColor);
  if (!baseRgb) return [];

  const variants: string[] = [];

  // Try different luminance adjustments
  for (let adjustment = 0.1; adjustment <= 0.9; adjustment += 0.1) {
    // Darker variant
    const darkerRgb = {
      r: Math.max(0, Math.round(baseRgb.r * adjustment)),
      g: Math.max(0, Math.round(baseRgb.g * adjustment)),
      b: Math.max(0, Math.round(baseRgb.b * adjustment))
    };

    // Lighter variant
    const lighterRgb = {
      r: Math.min(255, Math.round(baseRgb.r + (255 - baseRgb.r) * adjustment)),
      g: Math.min(255, Math.round(baseRgb.g + (255 - baseRgb.g) * adjustment)),
      b: Math.min(255, Math.round(baseRgb.b + (255 - baseRgb.b) * adjustment))
    };

    const darkerHex = `#${darkerRgb.r.toString(16).padStart(2, '0')}${darkerRgb.g.toString(16).padStart(2, '0')}${darkerRgb.b.toString(16).padStart(2, '0')}`;
    const lighterHex = `#${lighterRgb.r.toString(16).padStart(2, '0')}${lighterRgb.g.toString(16).padStart(2, '0')}${lighterRgb.b.toString(16).padStart(2, '0')}`;

    // Check if variants meet target ratio
    if (calculateContrastRatio(darkerHex, targetBackground) >= targetRatio) {
      variants.push(darkerHex);
    }
    if (calculateContrastRatio(lighterHex, targetBackground) >= targetRatio) {
      variants.push(lighterHex);
    }
  }

  // Remove duplicates and sort by contrast ratio
  const uniqueVariants = Array.from(new Set(variants));
  return uniqueVariants
    .map(color => ({
      color,
      ratio: calculateContrastRatio(color, targetBackground)
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .map(item => item.color)
    .slice(0, 3); // Return top 3 suggestions
}

/**
 * Validate all color combinations in the theme
 */
export function validateThemeColors(theme: any): AccessibilityReport {
  const colorPairs: Array<ColorPair & { result: ContrastResult; recommendations?: string[] }> = [];

  // Define color combinations to test
  const testCombinations = [
    // Primary button
    {
      foreground: theme.colors.white,
      background: theme.colors.primary.main,
      context: 'Primary Button',
      usage: 'Button text on primary background'
    },
    {
      foreground: theme.colors.white,
      background: theme.colors.primary.hover,
      context: 'Primary Button Hover',
      usage: 'Button text on primary hover background'
    },

    // Secondary button
    {
      foreground: theme.colors.neutral.darkest,
      background: theme.colors.white,
      context: 'Secondary Button',
      usage: 'Button text on white background'
    },

    // Ghost button
    {
      foreground: theme.colors.primary.main,
      background: theme.colors.white,
      context: 'Ghost Button',
      usage: 'Primary color text on white background'
    },
    {
      foreground: theme.colors.primary.main,
      background: theme.colors.secondary.light,
      context: 'Ghost Button Hover',
      usage: 'Primary color text on light secondary background'
    },

    // Body text
    {
      foreground: theme.colors.neutral.darkest,
      background: theme.colors.white,
      context: 'Body Text',
      usage: 'Main content text on white background'
    },
    {
      foreground: theme.colors.neutral.darkest,
      background: theme.colors.neutral.background,
      context: 'Body Text on Background',
      usage: 'Main content text on page background'
    },

    // Secondary text
    {
      foreground: theme.colors.neutral.medium,
      background: theme.colors.white,
      context: 'Secondary Text',
      usage: 'Secondary information text'
    },
    {
      foreground: theme.colors.neutral.medium,
      background: theme.colors.neutral.background,
      context: 'Secondary Text on Background',
      usage: 'Secondary text on page background'
    },

    // Badges
    {
      foreground: theme.colors.white,
      background: theme.colors.primary.main,
      context: 'Rating Badge',
      usage: 'White text on primary background badge'
    },
    {
      foreground: theme.colors.primary.main,
      background: theme.colors.secondary.light,
      context: 'Category Badge',
      usage: 'Primary color text on light secondary background'
    },

    // Accent colors
    {
      foreground: theme.colors.white,
      background: theme.colors.accent.red,
      context: 'Error/Warning Text',
      usage: 'White text on red accent background'
    },
    {
      foreground: theme.colors.accent.red,
      background: theme.colors.white,
      context: 'Error Text',
      usage: 'Red error text on white background'
    },
    {
      foreground: theme.colors.white,
      background: theme.colors.accent.blue,
      context: 'Info Text',
      usage: 'White text on blue accent background'
    },
    {
      foreground: theme.colors.accent.blue,
      background: theme.colors.white,
      context: 'Link Text',
      usage: 'Blue link text on white background'
    },

    // Headings
    {
      foreground: theme.typography.headings.h1.color,
      background: theme.colors.white,
      context: 'H1 Heading',
      usage: 'Large heading text'
    },
    {
      foreground: theme.typography.headings.h2.color,
      background: theme.colors.white,
      context: 'H2 Heading',
      usage: 'Section heading text'
    },
    {
      foreground: theme.typography.headings.h3.color,
      background: theme.colors.primary.main,
      context: 'H3 Heading',
      usage: 'White heading on primary background'
    },
    {
      foreground: theme.typography.headings.h4.color,
      background: theme.colors.white,
      context: 'H4 Heading',
      usage: 'Small heading text'
    },

    // Form elements
    {
      foreground: theme.components.searchInput.placeholder.color,
      background: theme.components.searchInput.backgroundColor,
      context: 'Placeholder Text',
      usage: 'Input placeholder text'
    },
    {
      foreground: theme.colors.neutral.darkest,
      background: theme.components.searchInput.backgroundColor,
      context: 'Input Text',
      usage: 'Input field text'
    }
  ];

  // Test each combination
  testCombinations.forEach(combination => {
    const result = checkContrastCompliance(combination.foreground, combination.background);
    const recommendations: string[] = [];

    if (!result.passes.aa) {
      // Generate suggestions for failing combinations
      const suggestions = generateAccessibleVariant(
        combination.foreground,
        combination.background,
        4.5
      );

      if (suggestions.length > 0) {
        recommendations.push(`Consider using: ${suggestions.slice(0, 2).join(' or ')}`);
      }

      // Provide specific guidance based on context
      if (combination.context.includes('Button')) {
        recommendations.push('Consider increasing font weight or adding a border for better visibility');
      } else if (combination.context.includes('Text')) {
        recommendations.push('Consider using a darker text color or lighter background');
      }
    }

    colorPairs.push({
      ...combination,
      result,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    });
  });

  // Generate summary
  const passing = colorPairs.filter(pair => pair.result.passes.aa).length;
  const total = colorPairs.length;

  return {
    colorPairs,
    summary: {
      total,
      passing,
      failing: total - passing,
      complianceRate: Math.round((passing / total) * 100)
    }
  };
}

/**
 * Generate accessibility report in a readable format
 */
export function generateAccessibilityReport(report: AccessibilityReport): string {
  const { colorPairs, summary } = report;

  let output = `# WCAG 2.1 AA Color Contrast Accessibility Report\n\n`;
  output += `## Summary\n`;
  output += `- **Total color combinations tested**: ${summary.total}\n`;
  output += `- **Passing WCAG AA**: ${summary.passing}\n`;
  output += `- **Failing WCAG AA**: ${summary.failing}\n`;
  output += `- **Compliance rate**: ${summary.complianceRate}%\n\n`;

  // Group by compliance status
  const failing = colorPairs.filter(pair => !pair.result.passes.aa);
  const passingAA = colorPairs.filter(pair => pair.result.passes.aa && !pair.result.passes.aaa);
  const passingAAA = colorPairs.filter(pair => pair.result.passes.aaa);

  if (failing.length > 0) {
    output += `## ❌ Failing WCAG AA (${failing.length})\n\n`;
    failing.forEach(pair => {
      output += `### ${pair.context}\n`;
      output += `- **Usage**: ${pair.usage}\n`;
      output += `- **Colors**: ${pair.foreground} on ${pair.background}\n`;
      output += `- **Contrast ratio**: ${pair.result.ratio}:1 (requires 4.5:1)\n`;
      if (pair.recommendations) {
        output += `- **Recommendations**:\n`;
        pair.recommendations.forEach(rec => output += `  - ${rec}\n`);
      }
      output += `\n`;
    });
  }

  if (passingAA.length > 0) {
    output += `## ✅ Passing WCAG AA (${passingAA.length})\n\n`;
    passingAA.forEach(pair => {
      output += `- **${pair.context}**: ${pair.result.ratio}:1 - ${pair.foreground} on ${pair.background}\n`;
    });
    output += `\n`;
  }

  if (passingAAA.length > 0) {
    output += `## 🏆 Passing WCAG AAA (${passingAAA.length})\n\n`;
    passingAAA.forEach(pair => {
      output += `- **${pair.context}**: ${pair.result.ratio}:1 - ${pair.foreground} on ${pair.background}\n`;
    });
    output += `\n`;
  }

  output += `## Recommendations\n\n`;

  if (summary.complianceRate < 80) {
    output += `⚠️ **Critical**: Compliance rate is below 80%. Immediate action required.\n\n`;
  } else if (summary.complianceRate < 95) {
    output += `🔍 **Good**: Compliance rate is good but can be improved.\n\n`;
  } else {
    output += `✨ **Excellent**: High compliance rate achieved!\n\n`;
  }

  output += `### General Guidelines:\n`;
  output += `- Normal text requires 4.5:1 contrast ratio\n`;
  output += `- Large text (18pt+ or 14pt+ bold) requires 3:1 contrast ratio\n`;
  output += `- UI components and graphics require 3:1 contrast ratio\n`;
  output += `- Consider user preferences for high contrast modes\n`;
  output += `- Test with actual users who have visual impairments\n`;

  return output;
}

/**
 * CSS Custom Properties for accessible colors
 */
export function generateAccessibleCSSVars(theme: any): string {
  const report = validateThemeColors(theme);

  let css = `:root {\n`;
  css += `  /* Original Soomgo theme colors */\n`;
  css += `  --color-primary: ${theme.colors.primary.main};\n`;
  css += `  --color-primary-hover: ${theme.colors.primary.hover};\n`;
  css += `  --color-white: ${theme.colors.white};\n`;
  css += `  --color-neutral-darkest: ${theme.colors.neutral.darkest};\n`;
  css += `  --color-neutral-medium: ${theme.colors.neutral.medium};\n`;
  css += `  --color-neutral-background: ${theme.colors.neutral.background};\n`;
  css += `  \n`;
  css += `  /* Accessibility-enhanced colors for failing combinations */\n`;

  // Add enhanced colors for failing combinations
  const failing = report.colorPairs.filter(pair => !pair.result.passes.aa);
  failing.forEach(pair => {
    const suggestions = generateAccessibleVariant(pair.foreground, pair.background, 4.5);
    if (suggestions.length > 0) {
      const safeName = pair.context.toLowerCase().replace(/[^a-z0-9]/g, '-');
      css += `  --color-${safeName}-accessible: ${suggestions[0]};\n`;
    }
  });

  css += `}\n`;

  return css;
}