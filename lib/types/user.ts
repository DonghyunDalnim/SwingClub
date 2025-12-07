/**
 * User-related type definitions for Swing Connect
 * Includes dance style tracking and proficiency levels
 */

/**
 * Dance style with proficiency level
 */
export interface DanceStyle {
  /** Name of the dance style */
  style: DanceStyleName
  /** Proficiency level from 1 (beginner) to 5 (expert) */
  level: number
}

/**
 * Allowed dance style names
 */
export type DanceStyleName =
  | 'Lindy Hop'
  | 'Charleston'
  | 'Balboa'
  | 'Shag'
  | 'Blues'
  | 'Collegiate Shag'
  | 'St. Louis Shag'
  | 'Slow Drag'
  | 'Authentic Jazz'

/**
 * Constant array of allowed dance styles for validation
 */
export const ALLOWED_DANCE_STYLES: readonly DanceStyleName[] = [
  'Lindy Hop',
  'Charleston',
  'Balboa',
  'Shag',
  'Blues',
  'Collegiate Shag',
  'St. Louis Shag',
  'Slow Drag',
  'Authentic Jazz'
] as const

/**
 * Validation constants for dance styles
 */
export const DANCE_STYLE_CONSTRAINTS = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 5,
  MAX_STYLES: 10
} as const

/**
 * Extended user profile with dance styles
 */
export interface ExtendedUserProfile {
  /** User's dance styles with proficiency levels */
  danceStyles?: DanceStyle[]
}
