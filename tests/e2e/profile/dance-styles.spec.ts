/**
 * E2E Tests for Dance Styles Feature
 *
 * ⚠️ IMPORTANT: These tests are currently skipped because they depend on:
 * - Issue #100: Profile edit page integration
 * - Issue #102: Profile page dance style display
 * - Issue #103: Server actions and validation
 *
 * To run these tests, first merge PRs #108, #109, #110 and then remove .skip from test blocks
 */

import { test, expect } from '@playwright/test'
import {
  navigateToProfileEdit,
  navigateToProfile,
  addDanceStyle,
  removeDanceStyle,
  changeDanceStyleLevel,
  saveDanceStyles,
  verifyDanceStylesInProfile,
  verifyEmptyState,
  verifyDanceStyleCounter,
  verifyMaxLimitBadge,
  verifyAddButtonNotVisible,
  getDisplayedDanceStyles,
  verifyStarRating,
} from '../utils/dance-style-helpers'

test.describe.skip('Dance Styles - Complete User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authentication when auth is implemented
    // await setupAuthentication(page)
  })

  test('should complete full flow: login → edit → add styles → save → view', async ({ page }) => {
    // 1. Navigate to profile edit
    await navigateToProfileEdit(page)

    // 2. Verify empty state initially
    await expect(page.locator('text=아직 선택된 댄스 스타일이 없습니다')).toBeVisible()
    await verifyDanceStyleCounter(page, 0)

    // 3. Add dance styles
    await addDanceStyle(page, 'Lindy Hop', 4)
    await addDanceStyle(page, 'Charleston', 5)
    await addDanceStyle(page, 'Balboa', 3)

    // 4. Verify counter updated
    await verifyDanceStyleCounter(page, 3)

    // 5. Save changes
    await saveDanceStyles(page)

    // 6. Navigate to profile view
    await navigateToProfile(page)

    // 7. Verify dance styles are displayed
    await verifyDanceStylesInProfile(page, [
      { name: 'Lindy Hop', level: 4 },
      { name: 'Charleston', level: 5 },
      { name: 'Balboa', level: 3 },
    ])

    // 8. Verify star ratings
    await verifyStarRating(page, 'Lindy Hop', 4)
    await verifyStarRating(page, 'Charleston', 5)
    await verifyStarRating(page, 'Balboa', 3)
  })
})

test.describe.skip('Dance Styles - Modification Flow', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup user with existing dance styles
    // await setupUserWithDanceStyles(page)
  })

  test('should modify existing dance style level', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Change Lindy Hop level from 3 to 5
    await changeDanceStyleLevel(page, 'Lindy Hop', 5)

    // Save and verify
    await saveDanceStyles(page)
    await navigateToProfile(page)

    await verifyStarRating(page, 'Lindy Hop', 5)
  })

  test('should add new dance style to existing ones', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Get initial count
    const initialStyles = await getDisplayedDanceStyles(page)
    const initialCount = initialStyles.length

    // Add new style
    await addDanceStyle(page, 'Blues', 2)

    // Verify count increased
    await verifyDanceStyleCounter(page, initialCount + 1)

    // Save and verify
    await saveDanceStyles(page)
    await navigateToProfile(page)

    await expect(page.locator('text=Blues')).toBeVisible()
    await verifyStarRating(page, 'Blues', 2)
  })

  test('should remove dance style', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Get initial count
    const initialStyles = await getDisplayedDanceStyles(page)
    const initialCount = initialStyles.length

    // Remove first style
    await removeDanceStyle(page, initialStyles[0])

    // Verify count decreased
    await verifyDanceStyleCounter(page, initialCount - 1)

    // Save and verify
    await saveDanceStyles(page)
    await navigateToProfile(page)

    // Removed style should not be visible
    await expect(page.locator(`text=${initialStyles[0]}`)).not.toBeVisible()
  })

  test('should remove all dance styles', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Get all styles
    const styles = await getDisplayedDanceStyles(page)

    // Remove all styles
    for (const styleName of styles) {
      await removeDanceStyle(page, styleName)
    }

    // Verify empty state
    await expect(page.locator('text=아직 선택된 댄스 스타일이 없습니다')).toBeVisible()
    await verifyDanceStyleCounter(page, 0)

    // Save and verify
    await saveDanceStyles(page)
    await navigateToProfile(page)

    await verifyEmptyState(page, true)
  })
})

test.describe.skip('Dance Styles - Maximum Limit (10 styles)', () => {
  test('should enforce maximum limit of 10 dance styles', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Add 10 dance styles
    const danceStyles = [
      'Lindy Hop',
      'Charleston',
      'Balboa',
      'Shag',
      'Blues',
      'Collegiate Shag',
      'St. Louis Shag',
      'Slow Drag',
      'Authentic Jazz',
      'Solo Jazz',
    ]

    for (let i = 0; i < 10; i++) {
      await addDanceStyle(page, danceStyles[i], i % 5 + 1)
      await verifyDanceStyleCounter(page, i + 1)
    }

    // Verify max limit badge is shown
    await verifyMaxLimitBadge(page)

    // Verify add button is not visible
    await verifyAddButtonNotVisible(page)

    // Save and verify
    await saveDanceStyles(page)
    await navigateToProfile(page)

    // All 10 styles should be visible
    for (const styleName of danceStyles) {
      await expect(page.locator(`text=${styleName}`)).toBeVisible()
    }
  })

  test('should allow removing and adding when at limit', async ({ page }) => {
    // TODO: Setup user with 10 dance styles
    await navigateToProfileEdit(page)

    // Verify at max initially
    await verifyMaxLimitBadge(page)
    await verifyDanceStyleCounter(page, 10)

    // Remove one style
    await removeDanceStyle(page, 'Lindy Hop')
    await verifyDanceStyleCounter(page, 9)

    // Add button should now be visible
    await expect(page.locator('button:has-text("스타일 추가")')).toBeVisible()

    // Add different style
    await addDanceStyle(page, 'Lindy Hop', 5)
    await verifyDanceStyleCounter(page, 10)

    // Should be at max again
    await verifyMaxLimitBadge(page)
  })
})

test.describe.skip('Dance Styles - Backward Compatibility', () => {
  test('should handle legacy user without danceStyles field', async ({ page }) => {
    // TODO: Setup legacy user (danceStyles field is undefined)
    await navigateToProfile(page)

    // Should show empty state gracefully
    await verifyEmptyState(page, false)

    // No errors should occur
    await expect(page.locator('text=오류')).not.toBeVisible()
    await expect(page.locator('text=Error')).not.toBeVisible()
  })

  test('should handle legacy user adding first dance style', async ({ page }) => {
    // TODO: Setup legacy user
    await navigateToProfileEdit(page)

    // Should show empty state
    await expect(page.locator('text=아직 선택된 댄스 스타일이 없습니다')).toBeVisible()

    // Add first dance style
    await addDanceStyle(page, 'Lindy Hop', 3)
    await verifyDanceStyleCounter(page, 1)

    // Save
    await saveDanceStyles(page)
    await navigateToProfile(page)

    // Should display correctly
    await verifyDanceStylesInProfile(page, [{ name: 'Lindy Hop', level: 3 }])
  })

  test('should handle user with empty danceStyles array', async ({ page }) => {
    // TODO: Setup user with danceStyles = []
    await navigateToProfile(page)

    // Should show empty state
    await verifyEmptyState(page, false)

    // Navigate to edit
    await navigateToProfileEdit(page)

    // Should allow adding styles
    await addDanceStyle(page, 'Charleston', 4)
    await saveDanceStyles(page)

    await navigateToProfile(page)
    await verifyDanceStylesInProfile(page, [{ name: 'Charleston', level: 4 }])
  })
})

test.describe.skip('Dance Styles - Error Scenarios', () => {
  test('should handle network error gracefully', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Add dance style
    await addDanceStyle(page, 'Lindy Hop', 3)

    // Simulate network error
    await page.route('**/api/**', (route) => route.abort('failed'))

    // Try to save
    const saveButton = page.locator('button[type="submit"]:has-text("저장")')
    await saveButton.click()

    // Should show error message
    await expect(page.locator('text=오류')).toBeVisible({ timeout: 5000 })

    // Restore network
    await page.unroute('**/api/**')
  })

  test('should prevent invalid level values', async ({ page }) => {
    await navigateToProfileEdit(page)

    await addDanceStyle(page, 'Lindy Hop', 1)

    // Try to set invalid level (above 5)
    const slider = page.locator('input[aria-label="Lindy Hop 레벨 선택"]')
    await slider.fill('10')

    // Level should be clamped to 5
    const value = await slider.inputValue()
    expect(Number(value)).toBeLessThanOrEqual(5)
  })

  test('should handle validation errors from server', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Mock server validation error
    await page.route('**/api/profile/update', (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Invalid dance style data' }),
      })
    })

    await addDanceStyle(page, 'Lindy Hop', 3)
    await saveDanceStyles(page)

    // Should show validation error
    await expect(page.locator('text=유효하지 않은')).toBeVisible({ timeout: 5000 })
  })
})

test.describe.skip('Dance Styles - UI Responsiveness', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await navigateToProfile(page)

    // Should show grid layout with single column on mobile
    const grid = page.locator('[role="list"][aria-label="댄스 스타일 목록"]')
    await expect(grid).toHaveClass(/grid-cols-1/)
  })

  test('should display correctly on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    await navigateToProfile(page)

    // Should show multi-column grid on desktop
    const grid = page.locator('[role="list"][aria-label="댄스 스타일 목록"]')
    await expect(grid).toHaveClass(/lg:grid-cols-3/)
  })
})

test.describe.skip('Dance Styles - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Tab to add button
    await page.keyboard.press('Tab')
    const addButton = page.locator('button:has-text("스타일 추가")')
    await expect(addButton).toBeFocused()

    // Press Enter to open dropdown
    await page.keyboard.press('Enter')

    // Should show available styles
    await expect(page.locator('text=Lindy Hop')).toBeVisible()
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    await navigateToProfile(page)

    // Check role="list"
    const list = page.locator('[role="list"][aria-label="댄스 스타일 목록"]')
    await expect(list).toBeVisible()

    // Check role="listitem" on cards
    const listItems = page.locator('[role="listitem"]')
    await expect(listItems.first()).toBeVisible()
  })

  test('should announce changes to screen readers', async ({ page }) => {
    await navigateToProfileEdit(page)

    // Add dance style
    await addDanceStyle(page, 'Lindy Hop', 3)

    // Counter should be updated (aria-live region would announce this)
    await verifyDanceStyleCounter(page, 1)
  })
})
