/**
 * Comprehensive tests for marketplace validation utilities
 * Tests all validation functions, error scenarios, and data sanitization
 */

import {
  validateMarketplaceItemData,
  sanitizeInput,
  sanitizeMarketplaceItemData
} from '../../../lib/utils/validation'

import type { CreateItemData } from '../../../lib/types/marketplace'

describe('Validation Utilities', () => {
  const validItemData: CreateItemData = {
    title: 'Supadance 댄스화 250사이즈',
    description: '거의 새것 같은 라틴댄스화입니다. 착용 횟수 3회 미만이고 상태 매우 좋습니다.',
    category: 'shoes',
    pricing: {
      price: 150000,
      currency: 'KRW',
      negotiable: true,
      tradeMethod: 'both',
      deliveryFee: 3000,
      notes: '직거래시 5천원 할인'
    },
    specs: {
      brand: 'Supadance',
      size: '250',
      color: '블랙',
      condition: 'like_new',
      purchaseDate: '2024-06',
      originalPrice: 250000,
      material: '스웨이드',
      gender: 'unisex',
      features: ['스웨이드', '쿠션솔', '라틴힐']
    },
    location: {
      region: '강남구',
      district: '서울특별시 강남구',
      preferredMeetingPlaces: ['강남역', '선릉역'],
      deliveryAvailable: true,
      coordinates: { lat: 37.5665, lng: 126.9780 }
    },
    images: ['image1.jpg', 'image2.jpg'],
    tags: ['댄스화', 'Supadance', '250'],
    keywords: ['댄스화', '신발', '라틴댄스']
  }

  describe('validateMarketplaceItemData', () => {
    describe('Title Validation', () => {
      it('should pass for valid title', () => {
        const errors = validateMarketplaceItemData(validItemData)
        const titleErrors = errors.filter(e => e.field === 'title')
        expect(titleErrors).toHaveLength(0)
      })

      it('should require title', () => {
        const invalidData = { ...validItemData, title: '' }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'TITLE_REQUIRED',
          message: '상품 제목은 필수입니다.',
          field: 'title'
        })
      })

      it('should reject title that is too short', () => {
        const invalidData = { ...validItemData, title: 'A' }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'TITLE_TOO_SHORT',
          message: '상품 제목은 2자 이상이어야 합니다.',
          field: 'title'
        })
      })

      it('should reject title that is too long', () => {
        const invalidData = { ...validItemData, title: 'A'.repeat(101) }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'TITLE_TOO_LONG',
          message: '상품 제목은 100자를 초과할 수 없습니다.',
          field: 'title'
        })
      })

      it('should handle whitespace-only title', () => {
        const invalidData = { ...validItemData, title: '   ' }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'TITLE_REQUIRED',
          message: '상품 제목은 필수입니다.',
          field: 'title'
        })
      })
    })

    describe('Description Validation', () => {
      it('should pass for valid description', () => {
        const errors = validateMarketplaceItemData(validItemData)
        const descErrors = errors.filter(e => e.field === 'description')
        expect(descErrors).toHaveLength(0)
      })

      it('should require description', () => {
        const invalidData = { ...validItemData, description: '' }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'DESCRIPTION_REQUIRED',
          message: '상품 설명은 필수입니다.',
          field: 'description'
        })
      })

      it('should reject description that is too short', () => {
        const invalidData = { ...validItemData, description: '짧음' }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'DESCRIPTION_TOO_SHORT',
          message: '상품 설명은 10자 이상이어야 합니다.',
          field: 'description'
        })
      })

      it('should reject description that is too long', () => {
        const invalidData = { ...validItemData, description: 'A'.repeat(2001) }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'DESCRIPTION_TOO_LONG',
          message: '상품 설명은 2000자를 초과할 수 없습니다.',
          field: 'description'
        })
      })
    })

    describe('Category Validation', () => {
      it('should pass for valid categories', () => {
        const categories = ['shoes', 'clothing', 'accessories', 'other']

        categories.forEach(category => {
          const data = { ...validItemData, category: category as any }
          const errors = validateMarketplaceItemData(data)
          const categoryErrors = errors.filter(e => e.field === 'category')
          expect(categoryErrors).toHaveLength(0)
        })
      })

      it('should require category', () => {
        const invalidData = { ...validItemData, category: undefined as any }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'CATEGORY_REQUIRED',
          message: '상품 카테고리는 필수입니다.',
          field: 'category'
        })
      })

      it('should reject invalid category', () => {
        const invalidData = { ...validItemData, category: 'invalid' as any }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_CATEGORY',
          message: '올바르지 않은 카테고리입니다.',
          field: 'category'
        })
      })
    })

    describe('Pricing Validation', () => {
      it('should pass for valid pricing', () => {
        const errors = validateMarketplaceItemData(validItemData)
        const pricingErrors = errors.filter(e => e.field?.startsWith('pricing'))
        expect(pricingErrors).toHaveLength(0)
      })

      it('should require pricing', () => {
        const invalidData = { ...validItemData, pricing: undefined as any }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'PRICING_REQUIRED',
          message: '가격 정보는 필수입니다.',
          field: 'pricing'
        })
      })

      it('should reject zero or negative price', () => {
        const invalidData = { ...validItemData, pricing: { ...validItemData.pricing, price: 0 } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_PRICE',
          message: '가격은 0보다 큰 숫자여야 합니다.',
          field: 'pricing.price'
        })
      })

      it('should reject price that is too high', () => {
        const invalidData = { ...validItemData, pricing: { ...validItemData.pricing, price: 10000001 } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'PRICE_TOO_HIGH',
          message: '가격은 1천만원을 초과할 수 없습니다.',
          field: 'pricing.price'
        })
      })

      it('should reject invalid currency', () => {
        const invalidData = { ...validItemData, pricing: { ...validItemData.pricing, currency: 'USD' as any } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_CURRENCY',
          message: '통화는 KRW만 지원됩니다.',
          field: 'pricing.currency'
        })
      })

      it('should reject invalid trade method', () => {
        const invalidData = { ...validItemData, pricing: { ...validItemData.pricing, tradeMethod: 'invalid' as any } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_TRADE_METHOD',
          message: '올바르지 않은 거래 방식입니다.',
          field: 'pricing.tradeMethod'
        })
      })

      it('should reject negative delivery fee', () => {
        const invalidData = { ...validItemData, pricing: { ...validItemData.pricing, deliveryFee: -1000 } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_DELIVERY_FEE',
          message: '배송비는 0 이상의 숫자여야 합니다.',
          field: 'pricing.deliveryFee'
        })
      })

      it('should reject delivery fee that is too high', () => {
        const invalidData = { ...validItemData, pricing: { ...validItemData.pricing, deliveryFee: 100001 } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'DELIVERY_FEE_TOO_HIGH',
          message: '배송비는 10만원을 초과할 수 없습니다.',
          field: 'pricing.deliveryFee'
        })
      })

      it('should reject pricing notes that are too long', () => {
        const invalidData = {
          ...validItemData,
          pricing: { ...validItemData.pricing, notes: 'A'.repeat(201) }
        }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'PRICING_NOTES_TOO_LONG',
          message: '가격 관련 노트는 200자를 초과할 수 없습니다.',
          field: 'pricing.notes'
        })
      })
    })

    describe('Specs Validation', () => {
      it('should pass for valid specs', () => {
        const errors = validateMarketplaceItemData(validItemData)
        const specsErrors = errors.filter(e => e.field?.startsWith('specs'))
        expect(specsErrors).toHaveLength(0)
      })

      it('should require specs', () => {
        const invalidData = { ...validItemData, specs: undefined as any }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'SPECS_REQUIRED',
          message: '상품 상세 정보는 필수입니다.',
          field: 'specs'
        })
      })

      it('should reject invalid condition', () => {
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, condition: 'invalid' as any } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_CONDITION',
          message: '올바르지 않은 상품 상태입니다.',
          field: 'specs.condition'
        })
      })

      it('should reject brand name that is too long', () => {
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, brand: 'A'.repeat(51) } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'BRAND_TOO_LONG',
          message: '브랜드명은 50자를 초과할 수 없습니다.',
          field: 'specs.brand'
        })
      })

      it('should reject size that is too long', () => {
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, size: 'A'.repeat(21) } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'SIZE_TOO_LONG',
          message: '사이즈는 20자를 초과할 수 없습니다.',
          field: 'specs.size'
        })
      })

      it('should reject color that is too long', () => {
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, color: 'A'.repeat(31) } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'COLOR_TOO_LONG',
          message: '색상은 30자를 초과할 수 없습니다.',
          field: 'specs.color'
        })
      })

      it('should reject invalid purchase date format', () => {
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, purchaseDate: '2024-13' } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_PURCHASE_DATE_FORMAT',
          message: '구매일은 YYYY-MM 형식이어야 합니다.',
          field: 'specs.purchaseDate'
        })
      })

      it('should accept valid purchase date formats', () => {
        const validDates = ['2024-01', '2023-12', '2022-06']

        validDates.forEach(date => {
          const data = { ...validItemData, specs: { ...validItemData.specs, purchaseDate: date } }
          const errors = validateMarketplaceItemData(data)
          const dateErrors = errors.filter(e => e.field === 'specs.purchaseDate')
          expect(dateErrors).toHaveLength(0)
        })
      })

      it('should reject invalid original price', () => {
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, originalPrice: -1000 } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_ORIGINAL_PRICE',
          message: '정가는 0보다 큰 숫자여야 합니다.',
          field: 'specs.originalPrice'
        })
      })

      it('should reject invalid gender', () => {
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, gender: 'invalid' as any } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_GENDER',
          message: '올바르지 않은 성별 구분입니다.',
          field: 'specs.gender'
        })
      })

      it('should accept valid gender values', () => {
        const validGenders = ['unisex', 'male', 'female']

        validGenders.forEach(gender => {
          const data = { ...validItemData, specs: { ...validItemData.specs, gender: gender as any } }
          const errors = validateMarketplaceItemData(data)
          const genderErrors = errors.filter(e => e.field === 'specs.gender')
          expect(genderErrors).toHaveLength(0)
        })
      })

      it('should reject too many features', () => {
        const tooManyFeatures = Array(11).fill(0).map((_, i) => `feature${i}`)
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, features: tooManyFeatures } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'TOO_MANY_FEATURES',
          message: '특징은 최대 10개까지 입력할 수 있습니다.',
          field: 'specs.features'
        })
      })

      it('should reject feature that is too long', () => {
        const longFeature = 'A'.repeat(21)
        const invalidData = { ...validItemData, specs: { ...validItemData.specs, features: [longFeature] } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'FEATURE_TOO_LONG',
          message: '특징 1은 20자를 초과할 수 없습니다.',
          field: 'specs.features[0]'
        })
      })
    })

    describe('Location Validation', () => {
      it('should pass for valid location', () => {
        const errors = validateMarketplaceItemData(validItemData)
        const locationErrors = errors.filter(e => e.field?.startsWith('location'))
        expect(locationErrors).toHaveLength(0)
      })

      it('should require location', () => {
        const invalidData = { ...validItemData, location: undefined as any }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'LOCATION_REQUIRED',
          message: '위치 정보는 필수입니다.',
          field: 'location'
        })
      })

      it('should require region', () => {
        const invalidData = { ...validItemData, location: { ...validItemData.location, region: '' } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'REGION_REQUIRED',
          message: '지역 정보는 필수입니다.',
          field: 'location.region'
        })
      })

      it('should reject region that is too long', () => {
        const invalidData = { ...validItemData, location: { ...validItemData.location, region: 'A'.repeat(51) } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'REGION_TOO_LONG',
          message: '지역명은 50자를 초과할 수 없습니다.',
          field: 'location.region'
        })
      })

      it('should reject district that is too long', () => {
        const invalidData = { ...validItemData, location: { ...validItemData.location, district: 'A'.repeat(101) } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'DISTRICT_TOO_LONG',
          message: '시/구 정보는 100자를 초과할 수 없습니다.',
          field: 'location.district'
        })
      })

      it('should reject too many meeting places', () => {
        const tooManyPlaces = Array(6).fill(0).map((_, i) => `place${i}`)
        const invalidData = { ...validItemData, location: { ...validItemData.location, preferredMeetingPlaces: tooManyPlaces } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'TOO_MANY_MEETING_PLACES',
          message: '선호 거래 장소는 최대 5개까지 입력할 수 있습니다.',
          field: 'location.preferredMeetingPlaces'
        })
      })

      it('should reject meeting place that is too long', () => {
        const longPlace = 'A'.repeat(51)
        const invalidData = { ...validItemData, location: { ...validItemData.location, preferredMeetingPlaces: [longPlace] } }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'MEETING_PLACE_TOO_LONG',
          message: '거래 장소 1은 50자를 초과할 수 없습니다.',
          field: 'location.preferredMeetingPlaces[0]'
        })
      })
    })

    describe('Images Validation', () => {
      it('should pass for valid images', () => {
        const errors = validateMarketplaceItemData(validItemData)
        const imageErrors = errors.filter(e => e.field?.startsWith('images'))
        expect(imageErrors).toHaveLength(0)
      })

      it('should require at least one image', () => {
        const invalidData = { ...validItemData, images: [] }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'IMAGES_REQUIRED',
          message: '상품 이미지는 최소 1개 이상 필요합니다.',
          field: 'images'
        })
      })

      it('should reject too many images', () => {
        const tooManyImages = Array(11).fill(0).map((_, i) => `image${i}.jpg`)
        const invalidData = { ...validItemData, images: tooManyImages }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'TOO_MANY_IMAGES',
          message: '상품 이미지는 최대 10개까지 업로드할 수 있습니다.',
          field: 'images'
        })
      })

      it('should reject empty image URL', () => {
        const invalidData = { ...validItemData, images: ['image1.jpg', '', 'image3.jpg'] }
        const errors = validateMarketplaceItemData(invalidData)

        expect(errors).toContainEqual({
          code: 'INVALID_IMAGE_URL',
          message: '이미지 2의 URL이 유효하지 않습니다.',
          field: 'images[1]'
        })
      })
    })

    describe('Complete Validation', () => {
      it('should pass for completely valid data', () => {
        const errors = validateMarketplaceItemData(validItemData)
        expect(errors).toHaveLength(0)
      })

      it('should collect multiple errors', () => {
        const invalidData: CreateItemData = {
          title: '', // Too short
          description: 'short', // Too short
          category: 'invalid' as any, // Invalid category
          pricing: {
            price: -1000, // Invalid price
            currency: 'USD' as any, // Invalid currency
            negotiable: true,
            tradeMethod: 'invalid' as any // Invalid trade method
          },
          specs: {
            condition: 'invalid' as any // Invalid condition
          },
          location: {
            region: '', // Empty region
            deliveryAvailable: true
          },
          images: [] // No images
        }

        const errors = validateMarketplaceItemData(invalidData)

        expect(errors.length).toBeGreaterThan(5) // Should have multiple errors
        expect(errors.map(e => e.code)).toContain('TITLE_REQUIRED')
        expect(errors.map(e => e.code)).toContain('DESCRIPTION_TOO_SHORT')
        expect(errors.map(e => e.code)).toContain('INVALID_CATEGORY')
        expect(errors.map(e => e.code)).toContain('INVALID_PRICE')
        expect(errors.map(e => e.code)).toContain('INVALID_CURRENCY')
        expect(errors.map(e => e.code)).toContain('INVALID_TRADE_METHOD')
        expect(errors.map(e => e.code)).toContain('INVALID_CONDITION')
        expect(errors.map(e => e.code)).toContain('REGION_REQUIRED')
        expect(errors.map(e => e.code)).toContain('IMAGES_REQUIRED')
      })
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World'
      const result = sanitizeInput(input)
      expect(result).toBe('scriptalert(xss)/scriptHello World')
    })

    it('should remove quotes', () => {
      const input = 'Hello "world" and \'test\''
      const result = sanitizeInput(input)
      expect(result).toBe('Hello world and test')
    })

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")'
      const result = sanitizeInput(input)
      expect(result).toBe('alert(xss)')
    })

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss") onload=malicious()'
      const result = sanitizeInput(input)
      expect(result).toBe(' malicious()')
    })

    it('should trim whitespace', () => {
      const input = '  Hello World  '
      const result = sanitizeInput(input)
      expect(result).toBe('Hello World')
    })

    it('should handle empty string', () => {
      const result = sanitizeInput('')
      expect(result).toBe('')
    })

    it('should handle normal text', () => {
      const input = 'Normal text without any dangerous content'
      const result = sanitizeInput(input)
      expect(result).toBe('Normal text without any dangerous content')
    })

    it('should handle Korean text', () => {
      const input = '한글 텍스트도 정상적으로 처리됩니다'
      const result = sanitizeInput(input)
      expect(result).toBe('한글 텍스트도 정상적으로 처리됩니다')
    })
  })

  describe('sanitizeMarketplaceItemData', () => {
    it('should sanitize all text fields', () => {
      const maliciousData: CreateItemData = {
        title: '<script>alert("title")</script>댄스화',
        description: 'javascript:alert("desc") 상품설명',
        category: 'shoes',
        pricing: {
          price: 150000,
          currency: 'KRW',
          negotiable: true,
          tradeMethod: 'both',
          notes: 'onclick=alert("notes") 직거래 선호'
        },
        specs: {
          brand: '<b>Supadance</b>',
          size: '"250"',
          color: '\'블랙\'',
          condition: 'like_new',
          material: 'onload=malicious() 스웨이드',
          features: ['onclick=bad()', '<script>xss</script>쿠션솔']
        },
        location: {
          region: 'javascript:void(0) 강남구',
          district: '<div>서울특별시</div>',
          preferredMeetingPlaces: ['<script>location</script>강남역', 'onclick=steal() 선릉역'],
          deliveryAvailable: true
        },
        images: ['image1.jpg'],
        tags: ['<script>tag</script>댄스화', 'onclick=tag() Supadance'],
        keywords: ['javascript:keyword()', 'onload=keyword() 댄스화']
      }

      const sanitized = sanitizeMarketplaceItemData(maliciousData)

      expect(sanitized.title).toBe('scriptalert(title)/script댄스화')
      expect(sanitized.description).toBe('alert(desc) 상품설명')
      expect(sanitized.pricing.notes).toBe(' 직거래 선호')
      expect(sanitized.specs.brand).toBe('bSupadance/b')
      expect(sanitized.specs.size).toBe('250')
      expect(sanitized.specs.color).toBe('블랙')
      expect(sanitized.specs.material).toBe(' 스웨이드')
      expect(sanitized.specs.features).toEqual(['', 'scriptxss/script쿠션솔'])
      expect(sanitized.location.region).toBe('void(0) 강남구')
      expect(sanitized.location.district).toBe('div서울특별시/div')
      expect(sanitized.location.preferredMeetingPlaces).toEqual(['scriptlocation/script강남역', ' 선릉역'])
      expect(sanitized.tags).toEqual(['scripttag/script댄스화', ' Supadance'])
      expect(sanitized.keywords).toEqual(['keyword()', ' 댄스화'])
    })

    it('should preserve valid data', () => {
      const sanitized = sanitizeMarketplaceItemData(validItemData)

      expect(sanitized.title).toBe(validItemData.title)
      expect(sanitized.description).toBe(validItemData.description)
      expect(sanitized.pricing.notes).toBe(validItemData.pricing.notes)
      expect(sanitized.specs.brand).toBe(validItemData.specs.brand)
      expect(sanitized.location.region).toBe(validItemData.location.region)
    })

    it('should handle undefined optional fields', () => {
      const dataWithoutOptionals: CreateItemData = {
        title: '댄스화',
        description: '상품 설명입니다',
        category: 'shoes',
        pricing: {
          price: 150000,
          currency: 'KRW',
          negotiable: true,
          tradeMethod: 'direct'
        },
        specs: {
          condition: 'good'
        },
        location: {
          region: '강남구',
          deliveryAvailable: true
        },
        images: ['image1.jpg']
      }

      const sanitized = sanitizeMarketplaceItemData(dataWithoutOptionals)

      expect(sanitized.pricing.notes).toBeUndefined()
      expect(sanitized.specs.brand).toBeUndefined()
      expect(sanitized.specs.features).toBeUndefined()
      expect(sanitized.location.preferredMeetingPlaces).toBeUndefined()
      expect(sanitized.tags).toBeUndefined()
      expect(sanitized.keywords).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => sanitizeInput(null as any)).not.toThrow()
      expect(() => sanitizeInput(undefined as any)).not.toThrow()
    })

    it('should handle extremely long inputs', () => {
      const longInput = 'A'.repeat(10000) + '<script>xss</script>'
      const result = sanitizeInput(longInput)
      expect(result).not.toContain('<script>')
      expect(result.length).toBeLessThan(longInput.length)
    })

    it('should handle special Unicode characters', () => {
      const unicodeInput = '🎭🎪🎨💃🕺'
      const result = sanitizeInput(unicodeInput)
      expect(result).toBe(unicodeInput)
    })

    it('should handle complex nested XSS attempts', () => {
      const complexXSS = '<img src="x" onerror="alert(String.fromCharCode(88,83,83))">'
      const result = sanitizeInput(complexXSS)
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('<img')
    })
  })
})