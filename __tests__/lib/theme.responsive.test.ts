/**
 * Comprehensive unit tests for theme.ts responsive design system
 * Tests responsive tokens, breakpoints, touch optimization, and type safety
 * Target coverage: 80%+
 */

import { theme, type Theme } from '@/lib/theme';

describe('Theme Responsive Design System', () => {
  describe('Layout Breakpoints', () => {
    test('should have correct breakpoint values', () => {
      expect(theme.layout.breakpoints.mobile).toBe('375px');
      expect(theme.layout.breakpoints.tablet).toBe('768px');
      expect(theme.layout.breakpoints.desktop).toBe('1200px');
    });

    test('should have breakpoints in ascending order', () => {
      const mobile = parseInt(theme.layout.breakpoints.mobile);
      const tablet = parseInt(theme.layout.breakpoints.tablet);
      const desktop = parseInt(theme.layout.breakpoints.desktop);

      expect(mobile).toBeLessThan(tablet);
      expect(tablet).toBeLessThan(desktop);
    });

    test('should use px units for all breakpoints', () => {
      const breakpoints = theme.layout.breakpoints;

      Object.values(breakpoints).forEach(breakpoint => {
        expect(breakpoint).toMatch(/^\d+px$/);
      });
    });

    test('should follow mobile-first design principles', () => {
      // Mobile breakpoint should be the smallest (mobile-first)
      const mobile = parseInt(theme.layout.breakpoints.mobile);
      expect(mobile).toBe(375); // Standard mobile breakpoint
    });
  });

  describe('Responsive Typography', () => {
    test('should have device-specific font sizes', () => {
      expect(theme.responsive.mobile.fontSize).toBe('14px');
      expect(theme.responsive.tablet.fontSize).toBe('16px');
      expect(theme.responsive.desktop.fontSize).toBe('16px');
    });

    test('should scale typography appropriately across devices', () => {
      const mobileFontSize = parseInt(theme.responsive.mobile.fontSize);
      const tabletFontSize = parseInt(theme.responsive.tablet.fontSize);
      const desktopFontSize = parseInt(theme.responsive.desktop.fontSize);

      // Mobile should be smaller than tablet/desktop
      expect(mobileFontSize).toBeLessThan(tabletFontSize);
      expect(tabletFontSize).toBeLessThanOrEqual(desktopFontSize);
    });

    test('should use px units for font sizes', () => {
      expect(theme.responsive.mobile.fontSize).toMatch(/^\d+px$/);
      expect(theme.responsive.tablet.fontSize).toMatch(/^\d+px$/);
      expect(theme.responsive.desktop.fontSize).toMatch(/^\d+px$/);
    });
  });

  describe('Responsive Padding System', () => {
    test('should have progressive padding values', () => {
      expect(theme.responsive.mobile.padding).toBe('12px');
      expect(theme.responsive.tablet.padding).toBe('16px');
      expect(theme.responsive.desktop.padding).toBe('20px');
    });

    test('should scale padding progressively', () => {
      const mobilePadding = parseInt(theme.responsive.mobile.padding);
      const tabletPadding = parseInt(theme.responsive.tablet.padding);
      const desktopPadding = parseInt(theme.responsive.desktop.padding);

      expect(mobilePadding).toBeLessThan(tabletPadding);
      expect(tabletPadding).toBeLessThan(desktopPadding);
    });

    test('should have appropriate container padding for each device', () => {
      expect(theme.responsive.mobile.containerPadding).toBe('12px');
      expect(theme.responsive.tablet.containerPadding).toBe('16px');
      expect(theme.responsive.desktop.containerPadding).toBe('20px');
    });

    test('should have progressive section padding', () => {
      const mobileSectionPadding = parseInt(theme.responsive.mobile.sectionPadding);
      const tabletSectionPadding = parseInt(theme.responsive.tablet.sectionPadding);
      const desktopSectionPadding = parseInt(theme.responsive.desktop.sectionPadding);

      expect(mobileSectionPadding).toBe(20);
      expect(tabletSectionPadding).toBe(32);
      expect(desktopSectionPadding).toBe(40);

      // Should increase progressively
      expect(mobileSectionPadding).toBeLessThan(tabletSectionPadding);
      expect(tabletSectionPadding).toBeLessThan(desktopSectionPadding);
    });
  });

  describe('Responsive Grid Columns', () => {
    test('should have appropriate grid column configurations', () => {
      expect(theme.responsive.mobile.gridColumns).toBe('repeat(2, 1fr)');
      expect(theme.responsive.tablet.gridColumns).toBe('repeat(3, 1fr)');
      expect(theme.responsive.desktop.gridColumns).toBe('repeat(6, 1fr)');
    });

    test('should increase column count progressively', () => {
      // Extract column count from repeat(n, 1fr) pattern
      const extractColumnCount = (gridColumns: string): number => {
        const match = gridColumns.match(/repeat\((\d+),\s*1fr\)/);
        return match ? parseInt(match[1]) : 0;
      };

      const mobileColumns = extractColumnCount(theme.responsive.mobile.gridColumns);
      const tabletColumns = extractColumnCount(theme.responsive.tablet.gridColumns);
      const desktopColumns = extractColumnCount(theme.responsive.desktop.gridColumns);

      expect(mobileColumns).toBe(2);
      expect(tabletColumns).toBe(3);
      expect(desktopColumns).toBe(6);

      expect(mobileColumns).toBeLessThan(tabletColumns);
      expect(tabletColumns).toBeLessThan(desktopColumns);
    });

    test('should use CSS grid repeat syntax', () => {
      const gridColumnPattern = /^repeat\(\d+,\s*1fr\)$/;

      expect(theme.responsive.mobile.gridColumns).toMatch(gridColumnPattern);
      expect(theme.responsive.tablet.gridColumns).toMatch(gridColumnPattern);
      expect(theme.responsive.desktop.gridColumns).toMatch(gridColumnPattern);
    });

    test('should provide reasonable column counts for content layout', () => {
      const extractColumnCount = (gridColumns: string): number => {
        const match = gridColumns.match(/repeat\((\d+),\s*1fr\)/);
        return match ? parseInt(match[1]) : 0;
      };

      const mobileColumns = extractColumnCount(theme.responsive.mobile.gridColumns);
      const tabletColumns = extractColumnCount(theme.responsive.tablet.gridColumns);
      const desktopColumns = extractColumnCount(theme.responsive.desktop.gridColumns);

      // Mobile: 2 columns for cards/content
      expect(mobileColumns).toBeGreaterThanOrEqual(2);
      expect(mobileColumns).toBeLessThanOrEqual(3);

      // Tablet: 3-4 columns for medium screens
      expect(tabletColumns).toBeGreaterThanOrEqual(3);
      expect(tabletColumns).toBeLessThanOrEqual(4);

      // Desktop: 4-8 columns for wide layouts
      expect(desktopColumns).toBeGreaterThanOrEqual(4);
      expect(desktopColumns).toBeLessThanOrEqual(8);
    });
  });

  describe('Touch Optimization Settings', () => {
    test('should have consistent touch target across all devices', () => {
      expect(theme.responsive.mobile.touchTarget).toBe('44px');
      expect(theme.responsive.tablet.touchTarget).toBe('44px');
      expect(theme.responsive.desktop.touchTarget).toBe('44px');
    });

    test('should meet accessibility guidelines for touch targets', () => {
      // WCAG guidelines recommend minimum 44px touch targets
      const minTouchSize = 44;

      const mobileTouchSize = parseInt(theme.responsive.mobile.touchTarget);
      const tabletTouchSize = parseInt(theme.responsive.tablet.touchTarget);
      const desktopTouchSize = parseInt(theme.responsive.desktop.touchTarget);

      expect(mobileTouchSize).toBeGreaterThanOrEqual(minTouchSize);
      expect(tabletTouchSize).toBeGreaterThanOrEqual(minTouchSize);
      expect(desktopTouchSize).toBeGreaterThanOrEqual(minTouchSize);
    });

    test('should have proper touch optimization configuration', () => {
      const touchOpt = theme.responsive.touchOptimization;

      expect(touchOpt.minTouchTarget).toBe('44px');
      expect(touchOpt.tapHighlight).toBe('transparent');
      expect(touchOpt.userSelect).toBe('none');
    });

    test('should have consistent touch optimization values', () => {
      const touchOpt = theme.responsive.touchOptimization;

      // minTouchTarget should match individual device touchTarget values
      expect(touchOpt.minTouchTarget).toBe(theme.responsive.mobile.touchTarget);
      expect(touchOpt.minTouchTarget).toBe(theme.responsive.tablet.touchTarget);
      expect(touchOpt.minTouchTarget).toBe(theme.responsive.desktop.touchTarget);
    });

    test('should disable unwanted touch behaviors', () => {
      const touchOpt = theme.responsive.touchOptimization;

      // Should disable tap highlight for clean mobile experience
      expect(touchOpt.tapHighlight).toBe('transparent');

      // Should prevent text selection for interactive elements
      expect(touchOpt.userSelect).toBe('none');
    });
  });

  describe('Grid Layout Configuration', () => {
    test('should have standard 12-column grid system', () => {
      expect(theme.layout.grid.columns).toBe(12);
    });

    test('should have appropriate gutter spacing', () => {
      expect(theme.layout.grid.gutter).toBe('16px');
      expect(theme.layout.grid.gutter).toMatch(/^\d+px$/);
    });

    test('should have consistent max width with container', () => {
      expect(theme.layout.grid.maxWidth).toBe('1200px');
      expect(theme.spacing.container.maxWidth).toBe('1200px');
    });

    test('should align with desktop breakpoint', () => {
      expect(theme.layout.grid.maxWidth).toBe(theme.layout.breakpoints.desktop);
    });
  });

  describe('Type Safety and Structure Validation', () => {
    test('should have readonly theme type', () => {
      // TypeScript compilation test - this will fail if theme isn't properly typed
      const testTheme: Theme = theme;
      expect(testTheme).toBeDefined();
    });

    test('should have all required responsive properties', () => {
      const requiredProps = ['fontSize', 'padding', 'gridColumns', 'touchTarget', 'containerPadding', 'sectionPadding'];

      requiredProps.forEach(prop => {
        expect(theme.responsive.mobile).toHaveProperty(prop);
        expect(theme.responsive.tablet).toHaveProperty(prop);
        expect(theme.responsive.desktop).toHaveProperty(prop);
      });
    });

    test('should have all required breakpoint properties', () => {
      const requiredBreakpoints = ['mobile', 'tablet', 'desktop'];

      requiredBreakpoints.forEach(breakpoint => {
        expect(theme.layout.breakpoints).toHaveProperty(breakpoint);
      });
    });

    test('should have all required touch optimization properties', () => {
      const requiredTouchProps = ['minTouchTarget', 'tapHighlight', 'userSelect'];

      requiredTouchProps.forEach(prop => {
        expect(theme.responsive.touchOptimization).toHaveProperty(prop);
      });
    });

    test('should have consistent property types across devices', () => {
      const devices = ['mobile', 'tablet', 'desktop'] as const;

      devices.forEach(device => {
        const deviceTheme = theme.responsive[device];

        expect(typeof deviceTheme.fontSize).toBe('string');
        expect(typeof deviceTheme.padding).toBe('string');
        expect(typeof deviceTheme.gridColumns).toBe('string');
        expect(typeof deviceTheme.touchTarget).toBe('string');
        expect(typeof deviceTheme.containerPadding).toBe('string');
        expect(typeof deviceTheme.sectionPadding).toBe('string');
      });
    });
  });

  describe('Cross-Device Consistency', () => {
    test('should maintain logical progression in all scaling properties', () => {
      const properties = [
        { prop: 'fontSize', mobile: 14, tablet: 16, desktop: 16 },
        { prop: 'padding', mobile: 12, tablet: 16, desktop: 20 },
        { prop: 'containerPadding', mobile: 12, tablet: 16, desktop: 20 },
        { prop: 'sectionPadding', mobile: 20, tablet: 32, desktop: 40 }
      ];

      properties.forEach(({ prop, mobile, tablet, desktop }) => {
        const mobileValue = parseInt(theme.responsive.mobile[prop as keyof typeof theme.responsive.mobile]);
        const tabletValue = parseInt(theme.responsive.tablet[prop as keyof typeof theme.responsive.tablet]);
        const desktopValue = parseInt(theme.responsive.desktop[prop as keyof typeof theme.responsive.desktop]);

        expect(mobileValue).toBe(mobile);
        expect(tabletValue).toBe(tablet);
        expect(desktopValue).toBe(desktop);

        // Ensure logical progression (mobile <= tablet <= desktop)
        expect(mobileValue).toBeLessThanOrEqual(tabletValue);
        expect(tabletValue).toBeLessThanOrEqual(desktopValue);
      });
    });

    test('should have consistent touch targets across all devices', () => {
      const touchTargets = [
        theme.responsive.mobile.touchTarget,
        theme.responsive.tablet.touchTarget,
        theme.responsive.desktop.touchTarget,
        theme.responsive.touchOptimization.minTouchTarget
      ];

      const uniqueTargets = new Set(touchTargets);
      expect(uniqueTargets.size).toBe(1); // All should be the same
      expect(Array.from(uniqueTargets)[0]).toBe('44px');
    });

    test('should maintain grid column scaling relationship', () => {
      // Should roughly double columns from mobile to desktop for better space usage
      const mobileColumns = parseInt(theme.responsive.mobile.gridColumns.match(/\d+/)?.[0] || '0');
      const desktopColumns = parseInt(theme.responsive.desktop.gridColumns.match(/\d+/)?.[0] || '0');

      expect(desktopColumns).toBeGreaterThanOrEqual(mobileColumns * 2);
      expect(desktopColumns).toBeLessThanOrEqual(mobileColumns * 4); // Not too many columns
    });
  });

  describe('Integration with Design System', () => {
    test('should align responsive padding with component spacing', () => {
      // Container padding should align with responsive system
      const containerPadding = parseInt(theme.spacing.container.padding.split(' ')[1]); // Extract horizontal padding
      const desktopContainerPadding = parseInt(theme.responsive.desktop.containerPadding);

      // Should be close or related values
      expect(Math.abs(containerPadding - desktopContainerPadding)).toBeLessThanOrEqual(4);
    });

    test('should have touch targets compatible with component design', () => {
      const touchTargetSize = parseInt(theme.responsive.touchOptimization.minTouchTarget);
      const searchInputHeight = parseInt(theme.components.searchInput.height);

      // Search input should meet or exceed touch target requirements
      expect(searchInputHeight).toBeGreaterThanOrEqual(touchTargetSize);
    });

    test('should maintain design consistency with navigation height', () => {
      const navHeight = parseInt(theme.components.navigation.height);
      const touchTargetSize = parseInt(theme.responsive.touchOptimization.minTouchTarget);

      // Navigation should accommodate touch targets comfortably
      expect(navHeight).toBeGreaterThanOrEqual(touchTargetSize + 8); // Some padding
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid breakpoint parsing gracefully', () => {
      // Test that breakpoint values are always valid
      const breakpoints = Object.values(theme.layout.breakpoints);

      breakpoints.forEach(breakpoint => {
        const numericValue = parseInt(breakpoint);
        expect(numericValue).toBeGreaterThan(0);
        expect(isNaN(numericValue)).toBeFalsy();
      });
    });

    test('should have reasonable bounds for all numeric values', () => {
      // Font sizes should be readable (12px-24px range)
      const fontSizes = [
        theme.responsive.mobile.fontSize,
        theme.responsive.tablet.fontSize,
        theme.responsive.desktop.fontSize
      ].map(size => parseInt(size));

      fontSizes.forEach(size => {
        expect(size).toBeGreaterThanOrEqual(12);
        expect(size).toBeLessThanOrEqual(24);
      });

      // Padding should be reasonable (8px-32px range)
      const paddings = [
        theme.responsive.mobile.padding,
        theme.responsive.tablet.padding,
        theme.responsive.desktop.padding
      ].map(padding => parseInt(padding));

      paddings.forEach(padding => {
        expect(padding).toBeGreaterThanOrEqual(8);
        expect(padding).toBeLessThanOrEqual(32);
      });
    });

    test('should handle grid column extraction without errors', () => {
      const gridColumns = [
        theme.responsive.mobile.gridColumns,
        theme.responsive.tablet.gridColumns,
        theme.responsive.desktop.gridColumns
      ];

      gridColumns.forEach(columns => {
        expect(columns).toMatch(/repeat\(\d+,\s*1fr\)/);
        const match = columns.match(/repeat\((\d+),\s*1fr\)/);
        expect(match).not.toBeNull();
        expect(parseInt(match![1])).toBeGreaterThan(0);
      });
    });

    test('should validate CSS property values', () => {
      // Touch optimization should use valid CSS values
      const touchOpt = theme.responsive.touchOptimization;

      expect(['transparent', 'none']).toContain(touchOpt.tapHighlight);
      expect(['none', 'auto', 'text']).toContain(touchOpt.userSelect);
    });
  });

  describe('Performance and Optimization', () => {
    test('should have efficient CSS values', () => {
      // Grid columns should use efficient CSS grid syntax
      const gridValues = [
        theme.responsive.mobile.gridColumns,
        theme.responsive.tablet.gridColumns,
        theme.responsive.desktop.gridColumns
      ];

      gridValues.forEach(value => {
        // Should use repeat() function for efficiency
        expect(value).toContain('repeat(');
        expect(value).toContain('1fr');
      });
    });

    test('should use consistent units throughout', () => {
      // All size values should use px for consistency and performance
      const sizeProperties = [
        theme.responsive.mobile.fontSize,
        theme.responsive.mobile.padding,
        theme.responsive.mobile.touchTarget,
        theme.responsive.mobile.containerPadding,
        theme.responsive.mobile.sectionPadding,
        theme.responsive.touchOptimization.minTouchTarget
      ];

      sizeProperties.forEach(prop => {
        if (prop.includes('px')) {
          expect(prop).toMatch(/^\d+px$/);
        }
      });
    });

    test('should minimize property variations for caching', () => {
      // Touch targets should be consistent for CSS optimization
      const touchTargets = [
        theme.responsive.mobile.touchTarget,
        theme.responsive.tablet.touchTarget,
        theme.responsive.desktop.touchTarget
      ];

      const uniqueTouchTargets = new Set(touchTargets);
      expect(uniqueTouchTargets.size).toBe(1); // All the same for CSS caching
    });
  });
});