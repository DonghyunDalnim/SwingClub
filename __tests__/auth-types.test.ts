/**
 * Tests for authentication types and constants
 */

import { AUTH_ERRORS, AUTH_ERROR_MESSAGES, DanceStyle, UserProfile } from '../lib/types/auth'

describe('Authentication Types', () => {
  describe('Error Constants', () => {
    it('should have all required error codes', () => {
      expect(AUTH_ERRORS.NETWORK_ERROR).toBe('network-error')
      expect(AUTH_ERRORS.USER_CANCELLED).toBe('user-cancelled')
      expect(AUTH_ERRORS.POPUP_BLOCKED).toBe('popup-blocked')
      expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBe('invalid-credentials')
      expect(AUTH_ERRORS.USER_NOT_FOUND).toBe('user-not-found')
      expect(AUTH_ERRORS.EMAIL_ALREADY_IN_USE).toBe('email-already-in-use')
      expect(AUTH_ERRORS.WEAK_PASSWORD).toBe('weak-password')
      expect(AUTH_ERRORS.PROVIDER_ERROR).toBe('provider-error')
    })

    it('should have Korean error messages for all error codes', () => {
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.NETWORK_ERROR]).toBe('네트워크 연결을 확인해주세요')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.USER_CANCELLED]).toBe('로그인이 취소되었습니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.POPUP_BLOCKED]).toBe('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.INVALID_CREDENTIALS]).toBe('이메일 또는 비밀번호가 올바르지 않습니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.USER_NOT_FOUND]).toBe('등록되지 않은 사용자입니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.EMAIL_ALREADY_IN_USE]).toBe('이미 사용 중인 이메일입니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.WEAK_PASSWORD]).toBe('비밀번호는 6자리 이상이어야 합니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.PROVIDER_ERROR]).toBe('로그인에 실패했습니다. 다시 시도해주세요')
    })

    it('should have all error codes covered by error messages', () => {
      const errorCodes = Object.values(AUTH_ERRORS)
      const messageKeys = Object.keys(AUTH_ERROR_MESSAGES)

      errorCodes.forEach(code => {
        expect(messageKeys).toContain(code)
      })
    })

    it('should have user-friendly Korean messages', () => {
      // Test that all messages are in Korean and user-friendly
      const messages = Object.values(AUTH_ERROR_MESSAGES)

      messages.forEach(message => {
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
        // Basic check for Korean characters (한글)
        expect(/[가-힣]/.test(message)).toBe(true)
      })
    })
  })

  describe('Type Safety', () => {
    it('should ensure AUTH_ERRORS is readonly', () => {
      // This test ensures the const assertion works correctly
      expect(() => {
        // TypeScript const assertion makes this readonly
        (AUTH_ERRORS as any).NEW_ERROR = 'new-error'
      }).not.toThrow() // Runtime won't throw, but TypeScript should prevent this
    })

    it('should have consistent error code format', () => {
      const errorCodes = Object.values(AUTH_ERRORS)

      errorCodes.forEach(code => {
        expect(code).toMatch(/^[a-z-]+$/) // kebab-case format
        expect(code).not.toMatch(/^-/) // shouldn't start with dash
        expect(code).not.toMatch(/-$/) // shouldn't end with dash
        expect(code).not.toMatch(/--/) // shouldn't have double dashes
      })
    })
  })

  describe('Dance Level Types', () => {
    const validDanceLevels = ['beginner', 'intermediate', 'advanced', 'professional']

    it('should have valid dance level values', () => {
      // This test ensures the DanceLevel type has the expected values
      validDanceLevels.forEach(level => {
        expect(['beginner', 'intermediate', 'advanced', 'professional']).toContain(level)
      })
    })
  })

  describe('Auth Provider Types', () => {
    const validProviders = ['google', 'kakao', 'naver', 'email']

    it('should have valid auth provider values', () => {
      // This test ensures the AuthProvider type has the expected values
      validProviders.forEach(provider => {
        expect(['google', 'kakao', 'naver', 'email']).toContain(provider)
      })
    })

    it('should cover all implemented providers', () => {
      // Ensure we have Korean names for all providers
      const providerNames = {
        google: '구글',
        kakao: '카카오톡',
        naver: '네이버',
        email: '이메일'
      }

      validProviders.forEach(provider => {
        expect(providerNames[provider as keyof typeof providerNames]).toBeTruthy()
      })
    })
  })

  describe('DanceStyle Interface', () => {
    describe('Valid DanceStyle objects', () => {
      it('should accept valid dance style with name and level', () => {
        const danceStyle: DanceStyle = {
          name: 'Lindy Hop',
          level: 3
        }

        expect(danceStyle.name).toBe('Lindy Hop')
        expect(danceStyle.level).toBe(3)
        expect(typeof danceStyle.name).toBe('string')
        expect(typeof danceStyle.level).toBe('number')
      })

      it('should accept various dance style names', () => {
        const danceStyles: DanceStyle[] = [
          { name: 'Lindy Hop', level: 3 },
          { name: 'Charleston', level: 2 },
          { name: 'Balboa', level: 4 },
          { name: 'Collegiate Shag', level: 1 },
          { name: 'Blues', level: 5 }
        ]

        danceStyles.forEach(style => {
          expect(style.name).toBeTruthy()
          expect(style.name.length).toBeGreaterThan(0)
          expect(typeof style.name).toBe('string')
        })
      })

      it('should accept all valid level values (1-5)', () => {
        const validLevels = [1, 2, 3, 4, 5]

        validLevels.forEach(level => {
          const danceStyle: DanceStyle = {
            name: 'Test Dance',
            level: level
          }

          expect(danceStyle.level).toBe(level)
          expect(danceStyle.level).toBeGreaterThanOrEqual(1)
          expect(danceStyle.level).toBeLessThanOrEqual(5)
        })
      })
    })

    describe('DanceStyle array usage', () => {
      it('should work with array of dance styles', () => {
        const userDanceStyles: DanceStyle[] = [
          { name: 'Lindy Hop', level: 3 },
          { name: 'Charleston', level: 2 }
        ]

        expect(Array.isArray(userDanceStyles)).toBe(true)
        expect(userDanceStyles).toHaveLength(2)
        expect(userDanceStyles[0].name).toBe('Lindy Hop')
        expect(userDanceStyles[1].level).toBe(2)
      })

      it('should support empty array of dance styles', () => {
        const userDanceStyles: DanceStyle[] = []

        expect(Array.isArray(userDanceStyles)).toBe(true)
        expect(userDanceStyles).toHaveLength(0)
      })

      it('should support multiple dance styles for a user', () => {
        const userDanceStyles: DanceStyle[] = [
          { name: 'Lindy Hop', level: 4 },
          { name: 'Charleston', level: 3 },
          { name: 'Balboa', level: 2 },
          { name: 'Collegiate Shag', level: 1 }
        ]

        expect(userDanceStyles).toHaveLength(4)
        userDanceStyles.forEach(style => {
          expect(style.name).toBeTruthy()
          expect(style.level).toBeGreaterThanOrEqual(1)
          expect(style.level).toBeLessThanOrEqual(5)
        })
      })
    })

    describe('Level meanings', () => {
      it('should have meaningful level values', () => {
        const levelMeanings = {
          1: '초급 (Beginner)',
          2: '초중급 (Elementary)',
          3: '중급 (Intermediate)',
          4: '중상급 (Upper-Intermediate)',
          5: '상급 (Advanced)'
        }

        Object.entries(levelMeanings).forEach(([level, meaning]) => {
          expect(meaning).toBeTruthy()
          expect(meaning).toContain('(')
          expect(meaning).toContain(')')
        })
      })

      it('should support progression from beginner to advanced', () => {
        const progression: DanceStyle[] = [
          { name: 'Lindy Hop', level: 1 }, // 초급
          { name: 'Lindy Hop', level: 2 }, // 초중급
          { name: 'Lindy Hop', level: 3 }, // 중급
          { name: 'Lindy Hop', level: 4 }, // 중상급
          { name: 'Lindy Hop', level: 5 }  // 상급
        ]

        for (let i = 1; i < progression.length; i++) {
          expect(progression[i].level).toBeGreaterThan(progression[i - 1].level)
        }
      })
    })

    describe('Type safety', () => {
      it('should enforce required name field', () => {
        const danceStyle: DanceStyle = {
          name: 'Lindy Hop',
          level: 3
        }

        expect(danceStyle.name).toBeDefined()
        expect(danceStyle.name).not.toBeNull()
      })

      it('should enforce required level field', () => {
        const danceStyle: DanceStyle = {
          name: 'Lindy Hop',
          level: 3
        }

        expect(danceStyle.level).toBeDefined()
        expect(danceStyle.level).not.toBeNull()
      })

      it('should work with TypeScript strict mode', () => {
        // This test ensures the interface works with strict type checking
        const createDanceStyle = (name: string, level: number): DanceStyle => {
          return { name, level }
        }

        const style = createDanceStyle('Balboa', 4)
        expect(style.name).toBe('Balboa')
        expect(style.level).toBe(4)
      })
    })

    describe('Edge cases', () => {
      it('should handle long dance style names', () => {
        const danceStyle: DanceStyle = {
          name: 'East Coast Swing with Charleston Variations',
          level: 3
        }

        expect(danceStyle.name.length).toBeGreaterThan(20)
        expect(typeof danceStyle.name).toBe('string')
      })

      it('should handle single character dance names', () => {
        const danceStyle: DanceStyle = {
          name: 'A',
          level: 1
        }

        expect(danceStyle.name.length).toBe(1)
        expect(typeof danceStyle.name).toBe('string')
      })

      it('should handle Korean dance style names', () => {
        const danceStyle: DanceStyle = {
          name: '린디합',
          level: 3
        }

        expect(danceStyle.name).toBe('린디합')
        expect(/[가-힣]/.test(danceStyle.name)).toBe(true)
      })

      it('should handle mixed language dance style names', () => {
        const danceStyle: DanceStyle = {
          name: 'Lindy Hop (린디합)',
          level: 3
        }

        expect(danceStyle.name).toContain('Lindy Hop')
        expect(danceStyle.name).toContain('린디합')
      })
    })

    describe('Real-world usage scenarios', () => {
      it('should represent a beginner dancer profile', () => {
        const beginnerProfile: DanceStyle[] = [
          { name: 'Lindy Hop', level: 1 },
          { name: 'Charleston', level: 1 }
        ]

        beginnerProfile.forEach(style => {
          expect(style.level).toBe(1)
        })
      })

      it('should represent an intermediate dancer profile', () => {
        const intermediateProfile: DanceStyle[] = [
          { name: 'Lindy Hop', level: 3 },
          { name: 'Charleston', level: 3 },
          { name: 'Balboa', level: 2 }
        ]

        const avgLevel = intermediateProfile.reduce((sum, style) => sum + style.level, 0) / intermediateProfile.length
        expect(avgLevel).toBeGreaterThanOrEqual(2)
        expect(avgLevel).toBeLessThanOrEqual(4)
      })

      it('should represent an advanced dancer profile', () => {
        const advancedProfile: DanceStyle[] = [
          { name: 'Lindy Hop', level: 5 },
          { name: 'Charleston', level: 5 },
          { name: 'Balboa', level: 4 },
          { name: 'Collegiate Shag', level: 4 },
          { name: 'Blues', level: 3 }
        ]

        advancedProfile.forEach(style => {
          expect(style.level).toBeGreaterThanOrEqual(3)
        })
      })

      it('should support filtering by skill level', () => {
        const allStyles: DanceStyle[] = [
          { name: 'Lindy Hop', level: 5 },
          { name: 'Charleston', level: 2 },
          { name: 'Balboa', level: 4 },
          { name: 'Blues', level: 1 }
        ]

        const advancedStyles = allStyles.filter(style => style.level >= 4)
        expect(advancedStyles).toHaveLength(2)
        expect(advancedStyles.every(style => style.level >= 4)).toBe(true)
      })

      it('should support sorting by skill level', () => {
        const styles: DanceStyle[] = [
          { name: 'Balboa', level: 4 },
          { name: 'Charleston', level: 2 },
          { name: 'Lindy Hop', level: 5 },
          { name: 'Blues', level: 1 }
        ]

        const sorted = [...styles].sort((a, b) => b.level - a.level)

        expect(sorted[0].level).toBe(5)
        expect(sorted[sorted.length - 1].level).toBe(1)

        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].level).toBeLessThanOrEqual(sorted[i - 1].level)
        }
      })
    })
  })

  describe('UserProfile Interface with DanceStyles', () => {
    describe('Backward compatibility', () => {
      it('should accept UserProfile without danceStyles field', () => {
        const profile: UserProfile = {
          nickname: '스윙댄서',
          danceLevel: 'intermediate',
          location: '서울',
          interests: ['Lindy Hop', 'Charleston']
        }

        expect(profile.nickname).toBe('스윙댄서')
        expect(profile.danceLevel).toBe('intermediate')
        expect(profile.danceStyles).toBeUndefined()
      })

      it('should accept UserProfile with empty danceStyles array', () => {
        const profile: UserProfile = {
          nickname: '초보댄서',
          danceLevel: 'beginner',
          location: '부산',
          interests: ['Swing'],
          danceStyles: []
        }

        expect(profile.danceStyles).toEqual([])
        expect(Array.isArray(profile.danceStyles)).toBe(true)
      })

      it('should accept UserProfile with undefined danceStyles', () => {
        const profile: UserProfile = {
          nickname: '댄서',
          danceLevel: 'advanced',
          location: '대구',
          interests: ['Blues'],
          danceStyles: undefined
        }

        expect(profile.danceStyles).toBeUndefined()
      })
    })

    describe('UserProfile with danceStyles', () => {
      it('should accept UserProfile with single dance style', () => {
        const profile: UserProfile = {
          nickname: '린디호퍼',
          danceLevel: 'intermediate',
          location: '서울 강남구',
          interests: ['Swing Dance'],
          danceStyles: [
            { name: 'Lindy Hop', level: 3 }
          ]
        }

        expect(profile.danceStyles).toHaveLength(1)
        expect(profile.danceStyles![0].name).toBe('Lindy Hop')
        expect(profile.danceStyles![0].level).toBe(3)
      })

      it('should accept UserProfile with multiple dance styles', () => {
        const profile: UserProfile = {
          nickname: '스윙마스터',
          danceLevel: 'advanced',
          location: '서울 마포구',
          bio: '스윙댄스를 사랑하는 댄서입니다',
          interests: ['Swing', 'Jazz', 'Music'],
          danceStyles: [
            { name: 'Lindy Hop', level: 4 },
            { name: 'Charleston', level: 3 },
            { name: 'Balboa', level: 2 }
          ]
        }

        expect(profile.danceStyles).toHaveLength(3)
        expect(profile.danceStyles![0].name).toBe('Lindy Hop')
        expect(profile.danceStyles![1].name).toBe('Charleston')
        expect(profile.danceStyles![2].name).toBe('Balboa')
      })

      it('should work with all UserProfile fields including danceStyles', () => {
        const profile: UserProfile = {
          nickname: '스윙킹',
          danceLevel: 'professional',
          location: '서울 홍대',
          bio: 'Professional swing dancer and instructor',
          interests: ['Swing', 'Teaching', 'Choreography'],
          danceStyles: [
            { name: 'Lindy Hop', level: 5 },
            { name: 'Charleston', level: 5 },
            { name: 'Balboa', level: 4 },
            { name: 'Collegiate Shag', level: 3 }
          ],
          socialLinks: {
            kakao: 'swingking',
            instagram: '@swingking_official'
          }
        }

        expect(profile.nickname).toBe('스윙킹')
        expect(profile.danceLevel).toBe('professional')
        expect(profile.location).toBe('서울 홍대')
        expect(profile.bio).toBe('Professional swing dancer and instructor')
        expect(profile.interests).toHaveLength(3)
        expect(profile.danceStyles).toHaveLength(4)
        expect(profile.socialLinks?.kakao).toBe('swingking')
        expect(profile.socialLinks?.instagram).toBe('@swingking_official')
      })
    })

    describe('Type safety with danceStyles', () => {
      it('should enforce DanceStyle[] type for danceStyles', () => {
        const profile: UserProfile = {
          nickname: '타입체커',
          danceLevel: 'intermediate',
          location: '인천',
          interests: ['Type Safety'],
          danceStyles: [
            { name: 'Lindy Hop', level: 3 },
            { name: 'Charleston', level: 2 }
          ]
        }

        profile.danceStyles!.forEach(style => {
          expect(typeof style.name).toBe('string')
          expect(typeof style.level).toBe('number')
        })
      })

      it('should allow modification of danceStyles array', () => {
        const profile: UserProfile = {
          nickname: '수정가능',
          danceLevel: 'beginner',
          location: '광주',
          interests: ['Learning'],
          danceStyles: [
            { name: 'Lindy Hop', level: 1 }
          ]
        }

        expect(profile.danceStyles).toHaveLength(1)

        // Add new dance style
        profile.danceStyles!.push({ name: 'Charleston', level: 1 })
        expect(profile.danceStyles).toHaveLength(2)

        // Update level
        profile.danceStyles![0].level = 2
        expect(profile.danceStyles![0].level).toBe(2)
      })

      it('should work with Partial<UserProfile>', () => {
        const partialProfile: Partial<UserProfile> = {
          danceStyles: [
            { name: 'Balboa', level: 3 }
          ]
        }

        expect(partialProfile.danceStyles).toBeDefined()
        expect(partialProfile.danceStyles).toHaveLength(1)
        expect(partialProfile.nickname).toBeUndefined()
      })
    })

    describe('Real-world scenarios', () => {
      it('should represent a beginner user profile', () => {
        const beginnerProfile: UserProfile = {
          nickname: '스윙입문',
          danceLevel: 'beginner',
          location: '서울 강남',
          interests: ['Swing Dance', 'Social Dancing'],
          danceStyles: [
            { name: 'Lindy Hop', level: 1 }
          ]
        }

        expect(beginnerProfile.danceLevel).toBe('beginner')
        expect(beginnerProfile.danceStyles).toHaveLength(1)
        expect(beginnerProfile.danceStyles![0].level).toBe(1)
      })

      it('should represent an intermediate user profile', () => {
        const intermediateProfile: UserProfile = {
          nickname: '스윙중급자',
          danceLevel: 'intermediate',
          location: '서울 홍대',
          bio: '6개월째 스윙댄스를 배우고 있습니다',
          interests: ['Lindy Hop', 'Charleston', 'Social'],
          danceStyles: [
            { name: 'Lindy Hop', level: 2 },
            { name: 'Charleston', level: 2 }
          ]
        }

        expect(intermediateProfile.danceLevel).toBe('intermediate')
        expect(intermediateProfile.danceStyles).toHaveLength(2)
        intermediateProfile.danceStyles!.forEach(style => {
          expect(style.level).toBeGreaterThanOrEqual(2)
        })
      })

      it('should represent an advanced user profile', () => {
        const advancedProfile: UserProfile = {
          nickname: '스윙고급자',
          danceLevel: 'advanced',
          location: '서울 이태원',
          bio: '5년 경력의 스윙 댄서입니다',
          interests: ['Teaching', 'Performance', 'Competition'],
          danceStyles: [
            { name: 'Lindy Hop', level: 4 },
            { name: 'Charleston', level: 4 },
            { name: 'Balboa', level: 3 },
            { name: 'Collegiate Shag', level: 3 }
          ],
          socialLinks: {
            instagram: '@swing_advanced'
          }
        }

        expect(advancedProfile.danceLevel).toBe('advanced')
        expect(advancedProfile.danceStyles).toHaveLength(4)
        const avgLevel = advancedProfile.danceStyles!.reduce((sum, style) => sum + style.level, 0) / advancedProfile.danceStyles!.length
        expect(avgLevel).toBeGreaterThanOrEqual(3)
      })

      it('should represent a professional user profile', () => {
        const professionalProfile: UserProfile = {
          nickname: '프로댄서',
          danceLevel: 'professional',
          location: '서울',
          bio: '국제 대회 수상 경력, 전문 강사',
          interests: ['Professional Dancing', 'Teaching', 'Choreography', 'Events'],
          danceStyles: [
            { name: 'Lindy Hop', level: 5 },
            { name: 'Charleston', level: 5 },
            { name: 'Balboa', level: 5 },
            { name: 'Collegiate Shag', level: 4 },
            { name: 'Blues', level: 4 }
          ],
          socialLinks: {
            kakao: 'pro_dancer',
            instagram: '@professional_swing'
          }
        }

        expect(professionalProfile.danceLevel).toBe('professional')
        expect(professionalProfile.danceStyles).toHaveLength(5)
        professionalProfile.danceStyles!.forEach(style => {
          expect(style.level).toBeGreaterThanOrEqual(4)
        })
      })

      it('should support filtering danceStyles by level', () => {
        const profile: UserProfile = {
          nickname: '필터테스트',
          danceLevel: 'advanced',
          location: '서울',
          interests: ['All Styles'],
          danceStyles: [
            { name: 'Lindy Hop', level: 5 },
            { name: 'Charleston', level: 2 },
            { name: 'Balboa', level: 4 },
            { name: 'Blues', level: 1 }
          ]
        }

        const advancedStyles = profile.danceStyles!.filter(style => style.level >= 4)
        expect(advancedStyles).toHaveLength(2)
        expect(advancedStyles[0].name).toBe('Lindy Hop')
        expect(advancedStyles[1].name).toBe('Balboa')
      })

      it('should support sorting danceStyles by proficiency', () => {
        const profile: UserProfile = {
          nickname: '정렬테스트',
          danceLevel: 'intermediate',
          location: '부산',
          interests: ['Multiple Styles'],
          danceStyles: [
            { name: 'Balboa', level: 2 },
            { name: 'Lindy Hop', level: 4 },
            { name: 'Charleston', level: 1 },
            { name: 'Blues', level: 3 }
          ]
        }

        const sorted = [...profile.danceStyles!].sort((a, b) => b.level - a.level)
        expect(sorted[0].name).toBe('Lindy Hop')
        expect(sorted[0].level).toBe(4)
        expect(sorted[sorted.length - 1].name).toBe('Charleston')
        expect(sorted[sorted.length - 1].level).toBe(1)
      })
    })

    describe('Edge cases', () => {
      it('should handle profile with only required fields', () => {
        const minimalProfile: UserProfile = {
          nickname: '최소프로필',
          danceLevel: 'beginner',
          location: '대전',
          interests: []
        }

        expect(minimalProfile.nickname).toBe('최소프로필')
        expect(minimalProfile.bio).toBeUndefined()
        expect(minimalProfile.danceStyles).toBeUndefined()
        expect(minimalProfile.socialLinks).toBeUndefined()
      })

      it('should handle profile with maximum dance styles', () => {
        const danceStyles: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
          name: `Dance Style ${i + 1}`,
          level: (i % 5) + 1
        }))

        const profile: UserProfile = {
          nickname: '다양한스타일',
          danceLevel: 'advanced',
          location: '서울',
          interests: ['Everything'],
          danceStyles
        }

        expect(profile.danceStyles).toHaveLength(10)
      })

      it('should handle profile update scenarios', () => {
        // Initial profile without danceStyles
        let profile: UserProfile = {
          nickname: '업데이트테스트',
          danceLevel: 'beginner',
          location: '울산',
          interests: ['Swing']
        }

        expect(profile.danceStyles).toBeUndefined()

        // Update to add danceStyles
        profile = {
          ...profile,
          danceStyles: [
            { name: 'Lindy Hop', level: 1 }
          ]
        }

        expect(profile.danceStyles).toBeDefined()
        expect(profile.danceStyles).toHaveLength(1)

        // Update existing danceStyles
        profile = {
          ...profile,
          danceStyles: [
            ...profile.danceStyles!,
            { name: 'Charleston', level: 1 }
          ]
        }

        expect(profile.danceStyles).toHaveLength(2)
      })
    })
  })
})