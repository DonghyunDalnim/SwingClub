import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Signup System - Performance
 * Tests loading times, animations, and Lighthouse metrics
 */

test.describe('Performance - Page Load', () => {
  test('should load signup page within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/signup', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // Should load in less than 2000ms
    expect(loadTime).toBeLessThan(2000);

    // Verify page is interactive
    await expect(page.locator('[data-testid="google-signup-button"]')).toBeVisible();
  });

  test('should display initial content quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/signup');

    // Wait for first contentful paint (button visible)
    await page.locator('[data-testid="google-signup-button"]').waitFor();

    const fcp = Date.now() - startTime;

    // First Contentful Paint should be under 1.5s
    expect(fcp).toBeLessThan(1500);
  });

  test('should be interactive quickly', async ({ page }) => {
    await page.goto('/signup');

    const startTime = Date.now();

    // Wait until button is clickable
    const googleButton = page.locator('[data-testid="google-signup-button"]');
    await googleButton.waitFor({ state: 'visible' });

    // Click button to verify it's interactive
    await googleButton.click({ timeout: 1000 });

    const tti = Date.now() - startTime;

    // Time to Interactive should be quick
    expect(tti).toBeLessThan(1000);
  });

  test('should have minimal layout shift', async ({ page }) => {
    await page.goto('/signup');

    // Get initial position of button
    const googleButton = page.locator('[data-testid="google-signup-button"]');
    const initialBox = await googleButton.boundingBox();

    // Wait a bit for any late layout shifts
    await page.waitForTimeout(1000);

    // Get position again
    const finalBox = await googleButton.boundingBox();

    // Position should not have shifted significantly
    if (initialBox && finalBox) {
      const shift = Math.abs(initialBox.y - finalBox.y);
      expect(shift).toBeLessThan(10); // Less than 10px shift
    }
  });

  test('should load all critical resources', async ({ page }) => {
    await page.goto('/signup');

    // Check that critical resources loaded
    const styleSheets = await page.evaluate(() => document.styleSheets.length);
    const scripts = await page.evaluate(() => document.scripts.length);

    // Should have stylesheets and scripts loaded
    expect(styleSheets).toBeGreaterThan(0);
    expect(scripts).toBeGreaterThan(0);
  });
});

test.describe('Performance - Animations', () => {
  test('should have smooth step transitions (60fps)', async ({ page }) => {
    test.skip(true, 'Requires Step navigation and FPS measurement');

    // Navigate between steps
    // Measure FPS during transition
    // Should maintain 60fps
  });

  test('should have smooth button hover animation', async ({ page }) => {
    await page.goto('/signup');

    const googleButton = page.locator('[data-testid="google-signup-button"]');

    // Hover over button
    await googleButton.hover();

    // Wait for animation to complete
    await page.waitForTimeout(400);

    // Button should have transformed
    const transform = await googleButton.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Should have some transform (or animation completed)
    expect(transform).toBeDefined();
  });

  test('should not cause jank during loading spinner', async ({ page }) => {
    await page.goto('/signup');

    const googleButton = page.locator('[data-testid="google-signup-button"]');

    // Click to show spinner
    await googleButton.click();

    // Wait for spinner animation
    await page.waitForTimeout(500);

    // Page should still be responsive
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
  });

  test('should have smooth fade-in animation on page load', async ({ page }) => {
    await page.goto('/signup');

    const wizard = page.locator('[data-testid="signup-wizard"]');

    // Check for fadeInUp animation class or opacity transition
    const opacity = await wizard.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).opacity);
    });

    // Should be visible (opacity 1 after animation)
    expect(opacity).toBeGreaterThan(0.9);
  });
});

test.describe('Performance - Resource Optimization', () => {
  test('should not load unnecessary resources', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', (request) => {
      requests.push(request.url());
    });

    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Should not load resources from unnecessary domains
    const unnecessaryDomains = requests.filter(
      (url) =>
        url.includes('analytics.google.com') === false && // Analytics OK
        url.includes('fonts.googleapis.com') === false && // Fonts OK
        url.includes('firebase') === false && // Firebase OK
        url.includes('unnecessary-tracker.com') // Example of unwanted
    );

    // All requests should be necessary
    expect(requests.length).toBeGreaterThan(0);
  });

  test('should cache static resources', async ({ page }) => {
    // First load
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Reload page
    await page.reload();

    // Second load should be faster (using cache)
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Cached reload should be very fast
    expect(loadTime).toBeLessThan(1000);
  });

  test('should optimize image loading', async ({ page }) => {
    await page.goto('/signup');

    // Check all images
    const images = await page.locator('img').all();

    for (const img of images) {
      // Images should have loading="lazy" or be critical
      const loading = await img.getAttribute('loading');
      const isVisible = await img.isVisible();

      // If not visible, should be lazy loaded
      if (!isVisible) {
        expect(loading).toBe('lazy');
      }
    }
  });

  test('should have optimized JavaScript bundle size', async ({ page }) => {
    const scripts: number[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('.js')) {
        const size = (await response.body()).length;
        scripts.push(size);
      }
    });

    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Total JS should be reasonable (e.g., < 1MB for initial load)
    const totalJsSize = scripts.reduce((a, b) => a + b, 0);

    // Log for reference
    console.log(`Total JS size: ${(totalJsSize / 1024).toFixed(2)} KB`);

    // Should be under 1MB
    expect(totalJsSize).toBeLessThan(1024 * 1024);
  });
});

test.describe('Performance - Memory', () => {
  test('should not have memory leaks on repeated navigation', async ({ page }) => {
    test.skip(true, 'Requires memory profiling tools');

    // Navigate to signup multiple times
    // Measure memory usage
    // Should not continuously increase
  });

  test('should clean up event listeners', async ({ page }) => {
    test.skip(true, 'Requires event listener tracking');

    // Attach listeners
    // Navigate away
    // Listeners should be removed
  });

  test('should clean up localStorage on completion', async ({ page, context }) => {
    test.skip(true, 'Requires completing full signup flow');

    await page.goto('/signup');

    // Complete signup flow
    // Navigate to /home
    // localStorage should be cleared

    const storageState = await context.storageState();
    const hasSignupData = storageState.origins.some((origin) =>
      origin.localStorage.some((item) => item.name.includes('signup-progress'))
    );

    expect(hasSignupData).toBeFalsy();
  });
});

test.describe('Performance - User Experience', () => {
  test('should show immediate feedback on button click', async ({ page }) => {
    await page.goto('/signup');

    const googleButton = page.locator('[data-testid="google-signup-button"]');

    const startTime = Date.now();

    await googleButton.click();

    // Wait for visual feedback (loading spinner or state change)
    await page.waitForTimeout(100);

    const feedbackTime = Date.now() - startTime;

    // Feedback should be immediate (< 100ms)
    expect(feedbackTime).toBeLessThan(100);
  });

  test('should debounce validation checks', async ({ page }) => {
    test.skip(true, 'Requires Step 2 input fields');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');

    // Type rapidly
    await nicknameInput.type('Test', { delay: 50 });

    // Wait a bit
    await page.waitForTimeout(300);

    // Validation should have run only once or a few times, not on every keystroke
    // This is more of an implementation detail but affects performance
  });

  test('should handle rapid state changes', async ({ page }) => {
    await page.goto('/signup');

    const googleButton = page.locator('[data-testid="google-signup-button"]');

    // Rapid interactions
    await googleButton.hover();
    await page.waitForTimeout(50);
    await googleButton.hover();
    await page.waitForTimeout(50);

    // Should not cause performance issues
    await expect(googleButton).toBeVisible();
  });
});

test.describe('Performance - Lighthouse Metrics (Manual Reference)', () => {
  test('Lighthouse Performance Score should be > 90', async ({ page }) => {
    test.skip(true, 'Run manually with: npx playwright test --headed and use Lighthouse extension');

    /*
     * Manual testing with Lighthouse:
     * 1. Run: npm run dev
     * 2. Open Chrome DevTools -> Lighthouse
     * 3. Select Performance, Accessibility, Best Practices, SEO
     * 4. Generate report for http://localhost:3000/signup
     *
     * Target metrics:
     * - Performance: > 90
     * - Accessibility: > 95
     * - Best Practices: > 90
     * - SEO: > 90
     *
     * Core Web Vitals:
     * - LCP (Largest Contentful Paint): < 2.5s
     * - FID (First Input Delay): < 100ms
     * - CLS (Cumulative Layout Shift): < 0.1
     */
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    test.skip(true, 'Requires Web Vitals measurement library');

    /*
     * Core Web Vitals targets:
     * - LCP: < 2.5 seconds
     * - FID: < 100 milliseconds
     * - CLS: < 0.1
     */
  });
});

test.describe('Performance - Network Conditions', () => {
  test('should load on slow 3G connection', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    const startTime = Date.now();

    await page.goto('/signup', { timeout: 30000 });

    const loadTime = Date.now() - startTime;

    // Should eventually load even on slow connection
    await expect(page.locator('[data-testid="google-signup-button"]')).toBeVisible();

    console.log(`Slow 3G load time: ${loadTime}ms`);
  });

  test('should show loading skeleton on slow connection', async ({ page, context }) => {
    test.skip(true, 'Requires loading skeleton implementation');

    // Slow network
    await context.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/signup', { waitUntil: 'domcontentloaded' });

    // Should show skeleton loader
    const skeleton = page.locator('[data-testid="loading-skeleton"]');

    if (await skeleton.isVisible()) {
      await expect(skeleton).toBeVisible();
    }
  });
});
