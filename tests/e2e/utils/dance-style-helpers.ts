import { Page, expect } from '@playwright/test'
import type { DanceStyle } from '../fixtures/users'

/**
 * Helper functions for Dance Style E2E tests
 */

/**
 * Navigate to profile edit page
 */
export async function navigateToProfileEdit(page: Page) {
  await page.goto('/profile/edit')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to profile view page
 */
export async function navigateToProfile(page: Page, userId?: string) {
  const url = userId ? `/profile?uid=${userId}` : '/profile'
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

/**
 * Add a dance style with specified level
 */
export async function addDanceStyle(page: Page, styleName: string, level: number = 1) {
  // Click "Add Style" button
  await page.click('button:has-text("스타일 추가")')

  // Wait for dropdown to appear
  await page.waitForSelector(`button[aria-label="${styleName} 추가"]`, { state: 'visible' })

  // Click the dance style to add
  await page.click(`button[aria-label="${styleName} 추가"]`)

  // Adjust level if not 1
  if (level !== 1) {
    const slider = page.locator(`input[aria-label="${styleName} 레벨 선택"]`)
    await slider.fill(String(level))
  }
}

/**
 * Remove a dance style
 */
export async function removeDanceStyle(page: Page, styleName: string) {
  const removeButton = page.locator(`button[aria-label="${styleName} 제거"]`)
  await removeButton.click()
}

/**
 * Change dance style level
 */
export async function changeDanceStyleLevel(page: Page, styleName: string, newLevel: number) {
  const slider = page.locator(`input[aria-label="${styleName} 레벨 선택"]`)
  await slider.fill(String(newLevel))
}

/**
 * Save dance styles (submit form)
 */
export async function saveDanceStyles(page: Page) {
  const saveButton = page.locator('button[type="submit"]:has-text("저장")')
  await saveButton.click()

  // Wait for save operation to complete
  // Look for success toast message
  await page.waitForSelector('text=저장되었습니다', { timeout: 5000 })
}

/**
 * Verify dance styles are displayed in profile
 */
export async function verifyDanceStylesInProfile(page: Page, expectedStyles: DanceStyle[]) {
  for (const style of expectedStyles) {
    // Check if dance style name is visible
    await expect(page.locator(`text=${style.name}`)).toBeVisible()

    // Check if level is displayed correctly
    await expect(page.locator(`text=Level ${style.level}/5`)).toBeVisible()

    // Check star visualization
    const listItem = page.locator(`[role="listitem"][aria-label="${style.name}, 레벨 ${style.level}/5"]`)
    await expect(listItem).toBeVisible()
  }
}

/**
 * Verify empty state is displayed
 */
export async function verifyEmptyState(page: Page, isOwnProfile: boolean = false) {
  if (isOwnProfile) {
    await expect(page.locator('text=아직 댄스 스타일을 설정하지 않았습니다')).toBeVisible()
    await expect(page.locator('text=프로필을 편집하여 선호하는 댄스 스타일을 추가해보세요')).toBeVisible()
  } else {
    await expect(page.locator('text=댄스 스타일이 없습니다')).toBeVisible()
    await expect(page.locator('text=이 사용자는 아직 댄스 스타일을 설정하지 않았습니다')).toBeVisible()
  }
}

/**
 * Verify dance style counter
 */
export async function verifyDanceStyleCounter(page: Page, count: number) {
  await expect(page.locator(`text=최대 10개까지 선택할 수 있습니다 (${count}/10)`)).toBeVisible()
}

/**
 * Verify maximum limit badge is shown
 */
export async function verifyMaxLimitBadge(page: Page) {
  await expect(page.locator('text=최대 개수 도달')).toBeVisible()
}

/**
 * Verify add button is not visible (when at max)
 */
export async function verifyAddButtonNotVisible(page: Page) {
  await expect(page.locator('button:has-text("스타일 추가")')).not.toBeVisible()
}

/**
 * Get all displayed dance styles
 */
export async function getDisplayedDanceStyles(page: Page): Promise<string[]> {
  const styleCards = page.locator('[role="listitem"]')
  const count = await styleCards.count()

  const styles: string[] = []
  for (let i = 0; i < count; i++) {
    const text = await styleCards.nth(i).getAttribute('aria-label')
    if (text) {
      // Extract style name from aria-label like "Lindy Hop, 레벨 3/5"
      const styleName = text.split(',')[0].trim()
      styles.push(styleName)
    }
  }

  return styles
}

/**
 * Verify star rating matches level
 */
export async function verifyStarRating(page: Page, styleName: string, level: number) {
  const listItem = page.locator(`[role="listitem"]:has-text("${styleName}")`)

  // Count filled stars (opacity-100 class)
  const stars = listItem.locator('span:has-text("⭐")')
  const totalStars = await stars.count()
  expect(totalStars).toBe(5) // Should always have 5 stars

  // Verify filled stars based on level
  for (let i = 0; i < totalStars; i++) {
    const star = stars.nth(i)
    if (i < level) {
      await expect(star).toHaveClass(/opacity-100/)
    } else {
      await expect(star).toHaveClass(/opacity-30/)
    }
  }
}
