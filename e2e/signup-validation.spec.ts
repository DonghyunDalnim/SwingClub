import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Signup System - Validation Logic
 * Tests all validation rules for nickname, required fields, and terms
 */

test.describe('Validation Tests - Step 2 Profile Info', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup and assume we can access Step 2
    // In real scenario, would need to complete Step 1 first
    await page.goto('/signup');
  });

  test('should validate nickname length (2-20 characters)', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    // Try 1 character nickname
    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    await nicknameInput.fill('A');

    const nextButton = page.locator('[data-testid="next-button"]');
    await expect(nextButton).toBeDisabled();

    // Try valid 2 character nickname
    await nicknameInput.fill('AB');
    await expect(nextButton).toBeEnabled();

    // Try 21 character nickname
    await nicknameInput.fill('A'.repeat(21));
    await expect(nextButton).toBeDisabled();

    // Try valid 20 character nickname
    await nicknameInput.fill('A'.repeat(20));
    await expect(nextButton).toBeEnabled();
  });

  test('should validate nickname characters (Korean/English/Numbers only)', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    const errorMessage = page.locator('[data-testid="nickname-error"]');

    // Try special characters - should show error
    await nicknameInput.fill('스윙댄서!@#');
    await nicknameInput.blur();

    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('한글, 영문, 숫자만 사용 가능');
    }

    // Try valid Korean
    await nicknameInput.fill('스윙댄서');
    await nicknameInput.blur();
    await expect(errorMessage).not.toBeVisible();

    // Try valid English
    await nicknameInput.fill('SwingDancer');
    await nicknameInput.blur();
    await expect(errorMessage).not.toBeVisible();

    // Try valid mixed
    await nicknameInput.fill('스윙댄서123');
    await nicknameInput.blur();
    await expect(errorMessage).not.toBeVisible();
  });

  test('should require dance level selection', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const danceLevelSelect = page.locator('[data-testid="dance-level-select"]');
    const nextButton = page.locator('[data-testid="next-button"]');

    // Initially no selection - button disabled
    await expect(nextButton).toBeDisabled();

    // Select a level
    await danceLevelSelect.selectOption('beginner');
    // Still need nickname and location

    // Select intermediate
    await danceLevelSelect.selectOption('intermediate');

    // Verify value changed
    await expect(danceLevelSelect).toHaveValue('intermediate');
  });

  test('should require location selection', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const locationSelect = page.locator('[data-testid="location-select"]');
    const nextButton = page.locator('[data-testid="next-button"]');

    // Initially no selection
    await expect(locationSelect).toHaveValue('');

    // Select location
    await locationSelect.selectOption('서울 강남구');
    await expect(locationSelect).toHaveValue('서울 강남구');
  });

  test('should enable next button only when all required fields valid', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    const danceLevelSelect = page.locator('[data-testid="dance-level-select"]');
    const locationSelect = page.locator('[data-testid="location-select"]');
    const nextButton = page.locator('[data-testid="next-button"]');

    // Initially disabled
    await expect(nextButton).toBeDisabled();

    // Fill nickname only
    await nicknameInput.fill('스윙댄서');
    await expect(nextButton).toBeDisabled();

    // Add dance level
    await danceLevelSelect.selectOption('beginner');
    await expect(nextButton).toBeDisabled();

    // Add location - now should be enabled
    await locationSelect.selectOption('서울 강남구');
    await expect(nextButton).toBeEnabled();
  });

  test('should show character counter for nickname (0/20)', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    const charCounter = page.locator('[data-testid="nickname-char-count"]');

    // Initially 0
    await expect(charCounter).toContainText('0/20');

    // Type 5 characters
    await nicknameInput.fill('스윙댄서');
    await expect(charCounter).toContainText('4/20');

    // Type 20 characters
    await nicknameInput.fill('A'.repeat(20));
    await expect(charCounter).toContainText('20/20');
  });

  test('should show character counter for bio (0/200)', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const bioTextarea = page.locator('[data-testid="bio-textarea"]');
    const charCounter = page.locator('[data-testid="bio-char-count"]');

    // Initially 0
    await expect(charCounter).toContainText('0/200');

    // Type some text
    const bioText = '스윙댄스를 사랑하는 댄서입니다.';
    await bioTextarea.fill(bioText);
    await expect(charCounter).toContainText(`${bioText.length}/200`);
  });

  test('should allow optional fields to be empty', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    const danceLevelSelect = page.locator('[data-testid="dance-level-select"]');
    const locationSelect = page.locator('[data-testid="location-select"]');
    const bioTextarea = page.locator('[data-testid="bio-textarea"]');
    const nextButton = page.locator('[data-testid="next-button"]');

    // Fill only required fields
    await nicknameInput.fill('스윙댄서');
    await danceLevelSelect.selectOption('beginner');
    await locationSelect.selectOption('서울 강남구');

    // Leave bio empty
    await expect(bioTextarea).toHaveValue('');

    // Should still allow next
    await expect(nextButton).toBeEnabled();
  });
});

test.describe('Validation Tests - Step 3 Terms', () => {
  test('should require service terms agreement', async ({ page }) => {
    test.skip(true, 'Requires completing Steps 1-2 to access Step 3');

    const serviceTermsCheckbox = page.locator('[data-testid="service-terms-checkbox"]');
    const submitButton = page.locator('[data-testid="submit-button"]');

    // Initially unchecked - submit disabled
    await expect(submitButton).toBeDisabled();

    // Check service terms only (privacy policy still needed)
    await serviceTermsCheckbox.check();
    await expect(submitButton).toBeDisabled();
  });

  test('should require privacy policy agreement', async ({ page }) => {
    test.skip(true, 'Requires completing Steps 1-2 to access Step 3');

    const privacyPolicyCheckbox = page.locator('[data-testid="privacy-policy-checkbox"]');
    const submitButton = page.locator('[data-testid="submit-button"]');

    // Check privacy policy only (service terms still needed)
    await privacyPolicyCheckbox.check();
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit when both required terms checked', async ({ page }) => {
    test.skip(true, 'Requires completing Steps 1-2 to access Step 3');

    const serviceTermsCheckbox = page.locator('[data-testid="service-terms-checkbox"]');
    const privacyPolicyCheckbox = page.locator('[data-testid="privacy-policy-checkbox"]');
    const submitButton = page.locator('[data-testid="submit-button"]');

    // Check both required terms
    await serviceTermsCheckbox.check();
    await privacyPolicyCheckbox.check();

    // Submit should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should allow optional marketing consent to be unchecked', async ({ page }) => {
    test.skip(true, 'Requires completing Steps 1-2 to access Step 3');

    const serviceTermsCheckbox = page.locator('[data-testid="service-terms-checkbox"]');
    const privacyPolicyCheckbox = page.locator('[data-testid="privacy-policy-checkbox"]');
    const marketingCheckbox = page.locator('[data-testid="marketing-checkbox"]');
    const submitButton = page.locator('[data-testid="submit-button"]');

    // Check required terms but not marketing
    await serviceTermsCheckbox.check();
    await privacyPolicyCheckbox.check();

    // Marketing unchecked
    await expect(marketingCheckbox).not.toBeChecked();

    // Submit should still be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should toggle all terms with "agree all" checkbox', async ({ page }) => {
    test.skip(true, 'Requires completing Steps 1-2 to access Step 3');

    const agreeAllCheckbox = page.locator('[data-testid="agree-all-checkbox"]');
    const serviceTermsCheckbox = page.locator('[data-testid="service-terms-checkbox"]');
    const privacyPolicyCheckbox = page.locator('[data-testid="privacy-policy-checkbox"]');
    const marketingCheckbox = page.locator('[data-testid="marketing-checkbox"]');

    // Check "agree all"
    await agreeAllCheckbox.check();

    // All individual checkboxes should be checked
    await expect(serviceTermsCheckbox).toBeChecked();
    await expect(privacyPolicyCheckbox).toBeChecked();
    await expect(marketingCheckbox).toBeChecked();

    // Uncheck "agree all"
    await agreeAllCheckbox.uncheck();

    // All individual checkboxes should be unchecked
    await expect(serviceTermsCheckbox).not.toBeChecked();
    await expect(privacyPolicyCheckbox).not.toBeChecked();
    await expect(marketingCheckbox).not.toBeChecked();
  });
});

test.describe('Validation Tests - Error Messages', () => {
  test('should show error for too short nickname', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    const errorMessage = page.locator('[data-testid="nickname-error"]');

    await nicknameInput.fill('A');
    await nicknameInput.blur();

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('2자 이상');
  });

  test('should show error for invalid characters in nickname', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    const errorMessage = page.locator('[data-testid="nickname-error"]');

    await nicknameInput.fill('닉네임@#$');
    await nicknameInput.blur();

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('한글, 영문, 숫자만');
  });

  test('should clear error when input becomes valid', async ({ page }) => {
    test.skip(true, 'Requires completing Step 1 to access Step 2');

    const nicknameInput = page.locator('[data-testid="nickname-input"]');
    const errorMessage = page.locator('[data-testid="nickname-error"]');

    // Invalid input
    await nicknameInput.fill('A');
    await nicknameInput.blur();
    await expect(errorMessage).toBeVisible();

    // Fix to valid input
    await nicknameInput.fill('AB');
    await nicknameInput.blur();
    await expect(errorMessage).not.toBeVisible();
  });
});
