/**
 * User Data Fixtures for E2E Tests
 *
 * Provides test user data with different dance style configurations
 */

// TODO: Import from @/lib/types/auth when available in main branch
// import type { DanceStyle } from '@/lib/types/auth'

/**
 * Temporary DanceStyle type definition
 * Remove this when lib/types/auth is available in main branch
 */
export interface DanceStyle {
  name: string
  level: number
}

export interface TestUser {
  uid: string
  email: string
  displayName: string
  danceStyles?: DanceStyle[]
}

/**
 * User with dance styles configured
 */
export const userWithDanceStyles: TestUser = {
  uid: 'test-user-with-styles',
  email: 'user-with-styles@test.com',
  displayName: '댄스 스타일 사용자',
  danceStyles: [
    { name: 'Lindy Hop', level: 4 },
    { name: 'Charleston', level: 3 },
    { name: 'Balboa', level: 2 },
  ],
}

/**
 * User without dance styles (empty array)
 */
export const userWithoutDanceStyles: TestUser = {
  uid: 'test-user-without-styles',
  email: 'user-without-styles@test.com',
  displayName: '스타일 없는 사용자',
  danceStyles: [],
}

/**
 * Legacy user (danceStyles field undefined - backward compatibility test)
 */
export const legacyUser: TestUser = {
  uid: 'legacy-user',
  email: 'legacy@test.com',
  displayName: '레거시 사용자',
  // danceStyles field is intentionally undefined
}

/**
 * User with maximum dance styles (10)
 */
export const userWithMaxDanceStyles: TestUser = {
  uid: 'test-user-max-styles',
  email: 'user-max@test.com',
  displayName: '최대 스타일 사용자',
  danceStyles: [
    { name: 'Lindy Hop', level: 5 },
    { name: 'Charleston', level: 4 },
    { name: 'Balboa', level: 3 },
    { name: 'Shag', level: 2 },
    { name: 'Blues', level: 1 },
    { name: 'Collegiate Shag', level: 5 },
    { name: 'St. Louis Shag', level: 4 },
    { name: 'Slow Drag', level: 3 },
    { name: 'Authentic Jazz', level: 2 },
    { name: 'Solo Jazz', level: 1 },
  ],
}

/**
 * User with various level configurations
 */
export const userWithMixedLevels: TestUser = {
  uid: 'test-user-mixed',
  email: 'user-mixed@test.com',
  displayName: '다양한 레벨 사용자',
  danceStyles: [
    { name: 'Lindy Hop', level: 1 }, // Minimum level
    { name: 'Charleston', level: 5 }, // Maximum level
    { name: 'Balboa', level: 3 }, // Middle level
  ],
}
