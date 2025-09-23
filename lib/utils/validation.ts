/**
 * 마켓플레이스 데이터 검증 유틸리티
 * XSS 방지 및 비즈니스 룰 검증
 */

import type { CreateItemData, MarketplaceError, ProductCategory, ProductCondition, TradeMethod } from '@/lib/types/marketplace'

/**
 * 마켓플레이스 아이템 데이터 검증
 */
export function validateMarketplaceItemData(data: CreateItemData): MarketplaceError[] {
  const errors: MarketplaceError[] = []

  // 제목 검증
  if (!data.title?.trim()) {
    errors.push({
      code: 'TITLE_REQUIRED',
      message: '상품 제목은 필수입니다.',
      field: 'title'
    })
  } else if (data.title.length < 2) {
    errors.push({
      code: 'TITLE_TOO_SHORT',
      message: '상품 제목은 2자 이상이어야 합니다.',
      field: 'title'
    })
  } else if (data.title.length > 100) {
    errors.push({
      code: 'TITLE_TOO_LONG',
      message: '상품 제목은 100자를 초과할 수 없습니다.',
      field: 'title'
    })
  }

  // 설명 검증
  if (!data.description?.trim()) {
    errors.push({
      code: 'DESCRIPTION_REQUIRED',
      message: '상품 설명은 필수입니다.',
      field: 'description'
    })
  } else if (data.description.length < 10) {
    errors.push({
      code: 'DESCRIPTION_TOO_SHORT',
      message: '상품 설명은 10자 이상이어야 합니다.',
      field: 'description'
    })
  } else if (data.description.length > 2000) {
    errors.push({
      code: 'DESCRIPTION_TOO_LONG',
      message: '상품 설명은 2000자를 초과할 수 없습니다.',
      field: 'description'
    })
  }

  // 카테고리 검증
  if (!data.category) {
    errors.push({
      code: 'CATEGORY_REQUIRED',
      message: '상품 카테고리는 필수입니다.',
      field: 'category'
    })
  } else if (!isValidProductCategory(data.category)) {
    errors.push({
      code: 'INVALID_CATEGORY',
      message: '올바르지 않은 카테고리입니다.',
      field: 'category'
    })
  }

  // 가격 정보 검증
  const pricingErrors = validateItemPricing(data.pricing)
  errors.push(...pricingErrors)

  // 상품 정보 검증
  const specsErrors = validateItemSpecs(data.specs)
  errors.push(...specsErrors)

  // 위치 정보 검증
  const locationErrors = validateItemLocation(data.location)
  errors.push(...locationErrors)

  // 이미지 검증
  const imageErrors = validateItemImages(data.images)
  errors.push(...imageErrors)

  return errors
}

/**
 * 가격 정보 검증
 */
function validateItemPricing(pricing: CreateItemData['pricing']): MarketplaceError[] {
  const errors: MarketplaceError[] = []

  if (!pricing) {
    errors.push({
      code: 'PRICING_REQUIRED',
      message: '가격 정보는 필수입니다.',
      field: 'pricing'
    })
    return errors
  }

  // 가격 검증
  if (typeof pricing.price !== 'number' || pricing.price <= 0) {
    errors.push({
      code: 'INVALID_PRICE',
      message: '가격은 0보다 큰 숫자여야 합니다.',
      field: 'pricing.price'
    })
  } else if (pricing.price > 10000000) {
    errors.push({
      code: 'PRICE_TOO_HIGH',
      message: '가격은 1천만원을 초과할 수 없습니다.',
      field: 'pricing.price'
    })
  }

  // 통화 검증
  if (pricing.currency !== 'KRW') {
    errors.push({
      code: 'INVALID_CURRENCY',
      message: '통화는 KRW만 지원됩니다.',
      field: 'pricing.currency'
    })
  }

  // 거래 방식 검증
  if (!isValidTradeMethod(pricing.tradeMethod)) {
    errors.push({
      code: 'INVALID_TRADE_METHOD',
      message: '올바르지 않은 거래 방식입니다.',
      field: 'pricing.tradeMethod'
    })
  }

  // 배송비 검증
  if (pricing.deliveryFee !== undefined) {
    if (typeof pricing.deliveryFee !== 'number' || pricing.deliveryFee < 0) {
      errors.push({
        code: 'INVALID_DELIVERY_FEE',
        message: '배송비는 0 이상의 숫자여야 합니다.',
        field: 'pricing.deliveryFee'
      })
    } else if (pricing.deliveryFee > 100000) {
      errors.push({
        code: 'DELIVERY_FEE_TOO_HIGH',
        message: '배송비는 10만원을 초과할 수 없습니다.',
        field: 'pricing.deliveryFee'
      })
    }
  }

  // 노트 길이 검증
  if (pricing.notes && pricing.notes.length > 200) {
    errors.push({
      code: 'PRICING_NOTES_TOO_LONG',
      message: '가격 관련 노트는 200자를 초과할 수 없습니다.',
      field: 'pricing.notes'
    })
  }

  return errors
}

/**
 * 상품 정보 검증
 */
function validateItemSpecs(specs: CreateItemData['specs']): MarketplaceError[] {
  const errors: MarketplaceError[] = []

  if (!specs) {
    errors.push({
      code: 'SPECS_REQUIRED',
      message: '상품 상세 정보는 필수입니다.',
      field: 'specs'
    })
    return errors
  }

  // 상태 검증
  if (!isValidProductCondition(specs.condition)) {
    errors.push({
      code: 'INVALID_CONDITION',
      message: '올바르지 않은 상품 상태입니다.',
      field: 'specs.condition'
    })
  }

  // 브랜드명 길이 검증
  if (specs.brand && specs.brand.length > 50) {
    errors.push({
      code: 'BRAND_TOO_LONG',
      message: '브랜드명은 50자를 초과할 수 없습니다.',
      field: 'specs.brand'
    })
  }

  // 사이즈 길이 검증
  if (specs.size && specs.size.length > 20) {
    errors.push({
      code: 'SIZE_TOO_LONG',
      message: '사이즈는 20자를 초과할 수 없습니다.',
      field: 'specs.size'
    })
  }

  // 색상 길이 검증
  if (specs.color && specs.color.length > 30) {
    errors.push({
      code: 'COLOR_TOO_LONG',
      message: '색상은 30자를 초과할 수 없습니다.',
      field: 'specs.color'
    })
  }

  // 구매일 형식 검증
  if (specs.purchaseDate && !/^\d{4}-\d{2}$/.test(specs.purchaseDate)) {
    errors.push({
      code: 'INVALID_PURCHASE_DATE_FORMAT',
      message: '구매일은 YYYY-MM 형식이어야 합니다.',
      field: 'specs.purchaseDate'
    })
  }

  // 정가 검증
  if (specs.originalPrice !== undefined) {
    if (typeof specs.originalPrice !== 'number' || specs.originalPrice <= 0) {
      errors.push({
        code: 'INVALID_ORIGINAL_PRICE',
        message: '정가는 0보다 큰 숫자여야 합니다.',
        field: 'specs.originalPrice'
      })
    }
  }

  // 성별 검증
  if (specs.gender && !['unisex', 'male', 'female'].includes(specs.gender)) {
    errors.push({
      code: 'INVALID_GENDER',
      message: '올바르지 않은 성별 구분입니다.',
      field: 'specs.gender'
    })
  }

  // 특징 배열 검증
  if (specs.features) {
    if (specs.features.length > 10) {
      errors.push({
        code: 'TOO_MANY_FEATURES',
        message: '특징은 최대 10개까지 입력할 수 있습니다.',
        field: 'specs.features'
      })
    }

    for (let i = 0; i < specs.features.length; i++) {
      if (specs.features[i].length > 20) {
        errors.push({
          code: 'FEATURE_TOO_LONG',
          message: `특징 ${i + 1}은 20자를 초과할 수 없습니다.`,
          field: `specs.features[${i}]`
        })
      }
    }
  }

  return errors
}

/**
 * 위치 정보 검증
 */
function validateItemLocation(location: CreateItemData['location']): MarketplaceError[] {
  const errors: MarketplaceError[] = []

  if (!location) {
    errors.push({
      code: 'LOCATION_REQUIRED',
      message: '위치 정보는 필수입니다.',
      field: 'location'
    })
    return errors
  }

  // 지역 검증
  if (!location.region?.trim()) {
    errors.push({
      code: 'REGION_REQUIRED',
      message: '지역 정보는 필수입니다.',
      field: 'location.region'
    })
  } else if (location.region.length > 50) {
    errors.push({
      code: 'REGION_TOO_LONG',
      message: '지역명은 50자를 초과할 수 없습니다.',
      field: 'location.region'
    })
  }

  // 시/구 정보 검증
  if (location.district && location.district.length > 100) {
    errors.push({
      code: 'DISTRICT_TOO_LONG',
      message: '시/구 정보는 100자를 초과할 수 없습니다.',
      field: 'location.district'
    })
  }

  // 선호 거래 장소 검증
  if (location.preferredMeetingPlaces) {
    if (location.preferredMeetingPlaces.length > 5) {
      errors.push({
        code: 'TOO_MANY_MEETING_PLACES',
        message: '선호 거래 장소는 최대 5개까지 입력할 수 있습니다.',
        field: 'location.preferredMeetingPlaces'
      })
    }

    for (let i = 0; i < location.preferredMeetingPlaces.length; i++) {
      if (location.preferredMeetingPlaces[i].length > 50) {
        errors.push({
          code: 'MEETING_PLACE_TOO_LONG',
          message: `거래 장소 ${i + 1}은 50자를 초과할 수 없습니다.`,
          field: `location.preferredMeetingPlaces[${i}]`
        })
      }
    }
  }

  return errors
}

/**
 * 이미지 검증
 */
function validateItemImages(images: string[]): MarketplaceError[] {
  const errors: MarketplaceError[] = []

  if (!images || images.length === 0) {
    errors.push({
      code: 'IMAGES_REQUIRED',
      message: '상품 이미지는 최소 1개 이상 필요합니다.',
      field: 'images'
    })
  } else if (images.length > 10) {
    errors.push({
      code: 'TOO_MANY_IMAGES',
      message: '상품 이미지는 최대 10개까지 업로드할 수 있습니다.',
      field: 'images'
    })
  }

  // 이미지 URL 형식 검증
  for (let i = 0; i < images.length; i++) {
    if (!images[i] || images[i].trim() === '') {
      errors.push({
        code: 'INVALID_IMAGE_URL',
        message: `이미지 ${i + 1}의 URL이 유효하지 않습니다.`,
        field: `images[${i}]`
      })
    }
  }

  return errors
}

/**
 * XSS 방지를 위한 입력 데이터 정제
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/[<>\"']/g, '') // HTML 태그 및 따옴표 제거
    .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
    .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
    .trim()
}

/**
 * 마켓플레이스 아이템 데이터 정제
 */
export function sanitizeMarketplaceItemData(data: CreateItemData): CreateItemData {
  return {
    ...data,
    title: sanitizeInput(data.title),
    description: sanitizeInput(data.description),
    pricing: {
      ...data.pricing,
      notes: data.pricing.notes ? sanitizeInput(data.pricing.notes) : undefined
    },
    specs: {
      ...data.specs,
      brand: data.specs.brand ? sanitizeInput(data.specs.brand) : undefined,
      size: data.specs.size ? sanitizeInput(data.specs.size) : undefined,
      color: data.specs.color ? sanitizeInput(data.specs.color) : undefined,
      material: data.specs.material ? sanitizeInput(data.specs.material) : undefined,
      features: data.specs.features?.map(feature => sanitizeInput(feature))
    },
    location: {
      ...data.location,
      region: sanitizeInput(data.location.region),
      district: data.location.district ? sanitizeInput(data.location.district) : undefined,
      preferredMeetingPlaces: data.location.preferredMeetingPlaces?.map(place => sanitizeInput(place))
    },
    tags: data.tags?.map(tag => sanitizeInput(tag)),
    keywords: data.keywords?.map(keyword => sanitizeInput(keyword))
  }
}

// 검증 헬퍼 함수들
function isValidProductCategory(category: string): category is ProductCategory {
  return ['shoes', 'clothing', 'accessories', 'other'].includes(category)
}

function isValidProductCondition(condition: string): condition is ProductCondition {
  return ['new', 'like_new', 'good', 'fair', 'poor'].includes(condition)
}

function isValidTradeMethod(tradeMethod: string): tradeMethod is TradeMethod {
  return ['direct', 'delivery', 'both'].includes(tradeMethod)
}