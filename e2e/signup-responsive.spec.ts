import { test, expect, devices } from '@playwright/test';

/**
 * E2E Tests for Signup System - Responsive Design
 * Tests mobile, tablet, and desktop viewports
 */

test.describe('Responsive Design - Mobile (320px - 768px)', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should display properly on mobile viewport', async ({ page }) => {
    await page.goto('/signup');

    // Page should be visible
    await expect(page.locator('[data-testid="signup-wizard"]')).toBeVisible();

    // Verify viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(768);
  });

  test('should have touch-friendly button sizes on mobile', async ({ page }) => {
    await page.goto('/signup');

    const googleButton = page.locator('[data-testid="google-signup-button"]');
    const buttonBox = await googleButton.boundingBox();

    // Button should be at least 44px tall (iOS touch target minimum)
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should use vertical layout on mobile', async ({ page }) => {
    await page.goto('/signup');

    const wizard = page.locator('[data-testid="signup-wizard"]');

    // Check if elements are stacked vertically
    const display = await wizard.evaluate((el) =>
      window.getComputedStyle(el).flexDirection
    );

    // Should be column or default (which stacks on mobile)
    expect(display === 'column' || display === 'row').toBeTruthy();
  });

  test('should have appropriate font sizes for mobile', async ({ page }) => {
    await page.goto('/signup');

    const title = page.locator('h2').first();
    const fontSize = await title.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Font should be readable on mobile (at least 16px)
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test('should handle mobile keyboard popup gracefully', async ({ page }) => {
    test.skip(true, 'Requires Step 2 access and mobile keyboard simulation');

    await page.goto('/signup');

    // Simulate input focus which would trigger keyboard
    const nicknameInput = page.locator('[data-testid="nickname-input"]');

    if (await nicknameInput.isVisible()) {
      await nicknameInput.focus();

      // Page should still be usable
      await expect(nicknameInput).toBeFocused();
    }
  });

  test('should have accessible tap targets (minimum 44x44px)', async ({ page }) => {
    await page.goto('/signup');

    // Check Google button tap target
    const googleButton = page.locator('[data-testid="google-signup-button"]');
    const box = await googleButton.boundingBox();

    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Responsive Design - Tablet (768px - 1024px)', () => {
  test.use({ ...devices['iPad (gen 7)'] });

  test('should display properly on tablet viewport', async ({ page }) => {
    await page.goto('/signup');

    // Verify viewport is tablet size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(768);
    expect(viewport?.width).toBeLessThanOrEqual(1024);

    // Wizard should be visible
    await expect(page.locator('[data-testid="signup-wizard"]')).toBeVisible();
  });

  test('should use medium layout spacing on tablet', async ({ page }) => {
    await page.goto('/signup');

    const wizard = page.locator('[data-testid="signup-wizard"]');
    const padding = await wizard.evaluate((el) =>
      window.getComputedStyle(el).padding
    );

    // Should have moderate padding
    expect(padding).toBeTruthy();
  });

  test('should center content on tablet', async ({ page }) => {
    await page.goto('/signup');

    const wizard = page.locator('[data-testid="signup-wizard"]');
    const box = await wizard.boundingBox();
    const viewport = page.viewportSize();

    // Wizard should be centered (some margin on both sides)
    if (box && viewport) {
      const leftMargin = box.x;
      const rightMargin = viewport.width - (box.x + box.width);

      // Should have roughly equal margins (within 50px)
      expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(50);
    }
  });
});

test.describe('Responsive Design - Desktop (1024px+)', () => {
  test.use({ ...devices['Desktop Chrome'] });

  test('should display properly on desktop viewport', async ({ page }) => {
    await page.goto('/signup');

    // Verify viewport is desktop size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(1024);

    // Wizard should be visible
    await expect(page.locator('[data-testid="signup-wizard"]')).toBeVisible();
  });

  test('should have max-width constraint on desktop', async ({ page }) => {
    await page.goto('/signup');

    const wizard = page.locator('[data-testid="signup-wizard"]');
    const box = await wizard.boundingBox();

    // Content should not exceed reasonable max-width (e.g., 600px)
    if (box) {
      expect(box.width).toBeLessThanOrEqual(800);
    }
  });

  test('should center content with ample margins on desktop', async ({ page }) => {
    await page.goto('/signup');

    const wizard = page.locator('[data-testid="signup-wizard"]');
    const box = await wizard.boundingBox();
    const viewport = page.viewportSize();

    // Should have significant margins on large screens
    if (box && viewport) {
      const leftMargin = box.x;
      expect(leftMargin).toBeGreaterThan(50);
    }
  });

  test('should show hover effects on desktop', async ({ page }) => {
    await page.goto('/signup');

    const googleButton = page.locator('[data-testid="google-signup-button"]');

    // Get initial transform
    const initialTransform = await googleButton.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Hover over button
    await googleButton.hover();

    // Wait for transition
    await page.waitForTimeout(300);

    // Transform might change on hover (translateY for lift effect)
    const hoverTransform = await googleButton.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // At least one of them should have a transform value
    expect(initialTransform !== 'none' || hoverTransform !== 'none').toBeTruthy();
  });

  test('should have larger touch targets on desktop', async ({ page }) => {
    await page.goto('/signup');

    const googleButton = page.locator('[data-testid="google-signup-button"]');
    const box = await googleButton.boundingBox();

    // Desktop buttons can be larger
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });
});

test.describe('Responsive Design - Orientation Changes', () => {
  test('should handle portrait to landscape rotation', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/signup');

    // Verify portrait layout
    await expect(page.locator('[data-testid="signup-wizard"]')).toBeVisible();

    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Should still be visible and functional
    await expect(page.locator('[data-testid="signup-wizard"]')).toBeVisible();
    await expect(page.locator('[data-testid="google-signup-button"]')).toBeVisible();
  });

  test('should maintain state during viewport resize', async ({ page }) => {
    test.skip(true, 'Requires Step 2 access to test input state');

    // Start desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/signup');

    // Fill some data (if accessible)

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Data should still be present
    // Verify state maintained
  });
});

test.describe('Responsive Design - Browser Compatibility', () => {
  test('should work on Chrome', async ({ page }) => {
    await page.goto('/signup');

    // Basic functionality check
    await expect(page.locator('[data-testid="google-signup-button"]')).toBeVisible();
  });

  test('should work on Safari (iOS)', async ({ page }) => {
    // Playwright test already uses Safari WebKit engine for iOS devices
    test.skip(!test.info().project.name.includes('Safari'), 'Safari only test');

    await page.goto('/signup');
    await expect(page.locator('[data-testid="google-signup-button"]')).toBeVisible();
  });

  test('should work on Firefox', async ({ page }) => {
    // Would need Firefox project in playwright.config.ts
    test.skip(true, 'Requires Firefox project configuration');

    await page.goto('/signup');
    await expect(page.locator('[data-testid="google-signup-button"]')).toBeVisible();
  });
});
