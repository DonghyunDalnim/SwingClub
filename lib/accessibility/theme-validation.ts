/**
 * Theme validation script for Soomgo theme accessibility compliance
 */

import { theme } from '../theme';
import { validateThemeColors, generateAccessibilityReport, generateAccessibleCSSVars } from './color-contrast';

/**
 * Validate current theme and generate comprehensive report
 */
export function validateSoomgoTheme() {
  console.log('🔍 Validating Soomgo theme for WCAG 2.1 AA compliance...\n');

  // Run validation
  const report = validateThemeColors(theme);

  // Generate and display report
  const reportText = generateAccessibilityReport(report);
  console.log(reportText);

  // Generate CSS variables for accessible alternatives
  const cssVars = generateAccessibleCSSVars(theme);
  console.log('\n📝 CSS Variables for accessible alternatives:');
  console.log(cssVars);

  return {
    report,
    reportText,
    cssVars,
    isCompliant: report.summary.complianceRate >= 95
  };
}

/**
 * Get specific color recommendations for common use cases
 */
export function getColorRecommendations() {
  const recommendations = {
    // Improved text colors for better contrast
    textOnWhite: {
      primary: '#1E293B', // Darker than current #293341 for better contrast
      secondary: '#475569', // Darker than current #6A7685
      accent: '#5B21B6' // Darker purple that maintains brand while improving contrast
    },

    // Alternative primary colors that maintain brand identity
    primaryAlternatives: {
      darker: '#5B2FD9', // Current hover color as primary
      accessible: '#4F46E5', // Indigo-600, good contrast while staying purple
      contrast: '#3730A3' // Indigo-700, high contrast option
    },

    // Enhanced accent colors
    accents: {
      errorAccessible: '#DC2626', // Red-600, good contrast
      warningAccessible: '#D97706', // Amber-600
      successAccessible: '#059669', // Emerald-600
      infoAccessible: '#0284C7' // Sky-600
    }
  };

  return recommendations;
}

/**
 * Enhanced theme with accessibility improvements
 */
export function createAccessibleTheme() {
  const recommendations = getColorRecommendations();

  const accessibleTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      // Enhanced neutral colors for better contrast
      neutral: {
        ...theme.colors.neutral,
        // Slightly darker for better contrast
        darkest: '#1E293B',
        medium: '#475569', // Better contrast than original #6A7685
        // Keep light colors as they work well
        light: theme.colors.neutral.light,
        lightest: theme.colors.neutral.lightest,
        background: theme.colors.neutral.background,
      },
      // Enhanced accent colors for accessibility
      accent: {
        red: '#DC2626', // Better contrast red
        blue: '#0284C7', // Better contrast blue
        warning: '#D97706', // Accessible warning color
        success: '#059669', // Accessible success color
      },
      // Alternative primary for high contrast mode
      primaryAccessible: {
        main: '#4F46E5', // More accessible purple
        hover: '#3730A3', // High contrast hover
      }
    },
    // Updated typography colors
    typography: {
      ...theme.typography,
      headings: {
        ...theme.typography.headings,
        h1: {
          ...theme.typography.headings.h1,
          color: '#1E293B', // Enhanced contrast
        },
        h2: {
          ...theme.typography.headings.h2,
          color: '#1E293B', // Enhanced contrast
        },
        h4: {
          ...theme.typography.headings.h4,
          color: '#1E293B', // Enhanced contrast
        },
      },
      body: {
        ...theme.typography.body,
        color: '#1E293B', // Enhanced contrast
      },
    },
    // Updated component styles for better accessibility
    components: {
      ...theme.components,
      buttons: {
        ...theme.components.buttons,
        primary: {
          ...theme.components.buttons.primary,
          // Keep original primary color as it passes with white text
          backgroundColor: theme.colors.primary.main,
          color: theme.colors.white,
        },
        secondary: {
          ...theme.components.buttons.secondary,
          color: '#1E293B', // Enhanced contrast
        },
        ghost: {
          ...theme.components.buttons.ghost,
          // Keep original as it passes accessibility tests
          color: theme.colors.primary.main,
        }
      },
      searchInput: {
        ...theme.components.searchInput,
        placeholder: {
          color: '#6B7280', // Better contrast for placeholder
        }
      }
    }
  };

  return accessibleTheme;
}

// Export for use in components
export { theme as originalTheme };
export const accessibleTheme = createAccessibleTheme();