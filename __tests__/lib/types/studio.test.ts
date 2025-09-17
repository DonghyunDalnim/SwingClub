/**
 * 스튜디오 타입 정의 유닛 테스트
 *
 * 이 파일은 lib/types/studio.ts의 모든 TypeScript 인터페이스와 상수를 테스트합니다.
 * 타입 안전성, 상수 무결성, 타입 가드 함수, 엣지 케이스를 포함한 포괄적인 테스트를 제공합니다.
 */

import { GeoPoint, Timestamp } from 'firebase/firestore';
import type {
  Studio,
  CreateStudioData,
  UpdateStudioData,
  StudioCategory,
  OperationStatus,
  StudioPricing,
  OperatingHours,
  StudioFacilities,
  StudioContact,
  StudioLocation,
  StudioStats,
  StudioMetadata,
  StudioSearchFilters,
  StudioSearchResult,
  GeographicSearch,
  StudiosResponse,
  StudioError,
  ValidateStudioData
} from '@/lib/types/studio';
import { STUDIO_CATEGORIES, OPERATION_STATUS } from '@/lib/types/studio';
import type { KakaoLatLng } from '@/lib/types/kakao-map';

// 테스트용 Mock 데이터
const mockGeoPoint = new GeoPoint(37.5665, 126.9780); // 서울시청 좌표
const mockTimestamp = Timestamp.now();

const mockKakaoLatLng: KakaoLatLng = {
  lat: 37.5665,
  lng: 126.9780
};

// 서울 스튜디오 예시 데이터 (실제 스윙댄스 커뮤니티 사례 기반)
const mockStudioLocation: StudioLocation = {
  geopoint: mockGeoPoint,
  address: '서울특별시 강남구 테헤란로 427',
  addressDetail: '지하 1층',
  region: '강남구',
  district: '서울특별시 강남구',
  subway: ['강남역', '선릉역'],
  landmarks: ['코엑스', '강남역 2번 출구']
};

const mockStudioContact: StudioContact = {
  phone: '02-1234-5678',
  email: 'info@swingdance.com',
  website: 'https://swingdance.com',
  kakaoTalk: 'swingdance_official',
  instagram: '@swingdance_seoul',
  booking: 'https://booking.swingdance.com'
};

const mockStudioFacilities: StudioFacilities = {
  area: 120,
  capacity: 30,
  floorType: '원목',
  soundSystem: true,
  airConditioning: true,
  parking: false,
  wifi: true,
  shower: true,
  lockers: true,
  equipment: ['스피커', '마이크', '거울'],
  amenities: ['정수기', '의자', '옷걸이']
};

const mockStudioPricing: StudioPricing = {
  hourly: 50000,
  daily: 300000,
  monthly: 800000,
  dropIn: 25000,
  currency: 'KRW',
  notes: '주말 요금 20% 할증'
};

const mockOperatingHours: OperatingHours = {
  monday: '09:00-22:00',
  tuesday: '09:00-22:00',
  wednesday: '09:00-22:00',
  thursday: '09:00-22:00',
  friday: '09:00-23:00',
  saturday: '10:00-23:00',
  sunday: '10:00-21:00',
  holidays: '휴무',
  notes: '매월 첫째 주 월요일 휴무'
};

const mockStudioStats: StudioStats = {
  views: 1250,
  favorites: 89,
  avgRating: 4.7,
  reviewCount: 23,
  lastActivity: mockTimestamp
};

const mockStudioMetadata: StudioMetadata = {
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
  createdBy: 'user123',
  verified: true,
  featured: false,
  status: 'active',
  tags: ['스윙댄스', '린디합', '발보아'],
  keywords: ['swing', 'lindy hop', 'balboa', 'dance studio']
};

const mockStudio: Studio = {
  id: 'studio_001',
  name: '서울 스윙댄스 스튜디오',
  description: '강남에 위치한 프리미엄 스윙댄스 전용 스튜디오입니다.',
  category: 'studio',
  location: mockStudioLocation,
  contact: mockStudioContact,
  facilities: mockStudioFacilities,
  pricing: mockStudioPricing,
  operatingHours: mockOperatingHours,
  stats: mockStudioStats,
  metadata: mockStudioMetadata,
  images: [
    'https://storage.googleapis.com/swingclub/studios/studio_001_1.jpg',
    'https://storage.googleapis.com/swingclub/studios/studio_001_2.jpg'
  ]
};

describe('Studio Types - Type Validation Tests', () => {
  describe('StudioCategory Type', () => {
    it('should accept valid studio categories', () => {
      const validCategories: StudioCategory[] = [
        'studio',
        'practice_room',
        'club',
        'public_space',
        'cafe'
      ];

      validCategories.forEach(category => {
        expect(typeof category).toBe('string');
        expect(['studio', 'practice_room', 'club', 'public_space', 'cafe']).toContain(category);
      });
    });

    it('should match STUDIO_CATEGORIES constant keys', () => {
      const categoryKeys = Object.keys(STUDIO_CATEGORIES) as StudioCategory[];
      const expectedCategories: StudioCategory[] = ['studio', 'practice_room', 'club', 'public_space', 'cafe'];

      expect(categoryKeys.sort()).toEqual(expectedCategories.sort());
    });
  });

  describe('OperationStatus Type', () => {
    it('should accept valid operation statuses', () => {
      const validStatuses: OperationStatus[] = [
        'active',
        'temporarily_closed',
        'permanently_closed'
      ];

      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(['active', 'temporarily_closed', 'permanently_closed']).toContain(status);
      });
    });

    it('should match OPERATION_STATUS constant keys', () => {
      const statusKeys = Object.keys(OPERATION_STATUS) as OperationStatus[];
      const expectedStatuses: OperationStatus[] = ['active', 'temporarily_closed', 'permanently_closed'];

      expect(statusKeys.sort()).toEqual(expectedStatuses.sort());
    });
  });

  describe('StudioPricing Interface', () => {
    it('should validate complete pricing structure', () => {
      const validPricing: StudioPricing = {
        hourly: 50000,
        daily: 300000,
        monthly: 800000,
        dropIn: 25000,
        currency: 'KRW',
        notes: '주말 요금 할증'
      };

      expect(validPricing.currency).toBe('KRW');
      expect(typeof validPricing.hourly).toBe('number');
      expect(typeof validPricing.daily).toBe('number');
      expect(typeof validPricing.monthly).toBe('number');
      expect(typeof validPricing.dropIn).toBe('number');
    });

    it('should validate minimal pricing structure', () => {
      const minimalPricing: StudioPricing = {
        currency: 'KRW'
      };

      expect(minimalPricing.currency).toBe('KRW');
      expect(minimalPricing.hourly).toBeUndefined();
      expect(minimalPricing.daily).toBeUndefined();
    });

    it('should handle edge case prices', () => {
      const edgeCasePricing: StudioPricing = {
        hourly: 0, // 무료
        daily: 1000000, // 매우 비싼 경우
        currency: 'KRW'
      };

      expect(edgeCasePricing.hourly).toBe(0);
      expect(edgeCasePricing.daily).toBe(1000000);
    });
  });

  describe('OperatingHours Interface', () => {
    it('should validate complete operating hours', () => {
      const hours: OperatingHours = mockOperatingHours;

      expect(hours.monday).toBe('09:00-22:00');
      expect(hours.saturday).toBe('10:00-23:00');
      expect(hours.holidays).toBe('휴무');
      expect(hours.notes).toContain('휴무');
    });

    it('should handle closed days', () => {
      const limitedHours: OperatingHours = {
        monday: 'closed',
        tuesday: '09:00-18:00',
        sunday: 'closed',
        notes: '월요일, 일요일 휴무'
      };

      expect(limitedHours.monday).toBe('closed');
      expect(limitedHours.sunday).toBe('closed');
    });

    it('should handle 24-hour operation', () => {
      const fullTimeHours: OperatingHours = {
        monday: '00:00-24:00',
        notes: '24시간 운영'
      };

      expect(fullTimeHours.monday).toBe('00:00-24:00');
    });
  });

  describe('StudioFacilities Interface', () => {
    it('should validate complete facilities', () => {
      const facilities: StudioFacilities = mockStudioFacilities;

      expect(facilities.area).toBe(120);
      expect(facilities.capacity).toBe(30);
      expect(facilities.floorType).toBe('원목');
      expect(facilities.soundSystem).toBe(true);
      expect(facilities.equipment).toEqual(['스피커', '마이크', '거울']);
    });

    it('should handle minimal facilities', () => {
      const minimalFacilities: StudioFacilities = {
        area: 50
      };

      expect(minimalFacilities.area).toBe(50);
      expect(minimalFacilities.soundSystem).toBeUndefined();
    });

    it('should handle large capacity venues', () => {
      const largeFacilities: StudioFacilities = {
        area: 500,
        capacity: 200,
        floorType: '마루',
        equipment: []
      };

      expect(largeFacilities.capacity).toBe(200);
      expect(largeFacilities.equipment).toEqual([]);
    });
  });

  describe('StudioLocation Interface', () => {
    it('should validate complete location data', () => {
      const location: StudioLocation = mockStudioLocation;

      expect(location.geopoint).toBeInstanceOf(GeoPoint);
      expect(location.address).toContain('서울특별시');
      expect(location.region).toBe('강남구');
      expect(location.subway).toContain('강남역');
      expect(location.landmarks).toContain('코엑스');
    });

    it('should handle minimal location data', () => {
      const minimalLocation: StudioLocation = {
        geopoint: mockGeoPoint,
        address: '서울특별시 중구 세종대로 110',
        region: '중구'
      };

      expect(minimalLocation.geopoint).toBeInstanceOf(GeoPoint);
      expect(minimalLocation.addressDetail).toBeUndefined();
      expect(minimalLocation.subway).toBeUndefined();
    });
  });
});

describe('Studio Types - Constant Tests', () => {
  describe('STUDIO_CATEGORIES', () => {
    it('should contain all expected categories with Korean translations', () => {
      expect(STUDIO_CATEGORIES.studio).toBe('댄스 스튜디오');
      expect(STUDIO_CATEGORIES.practice_room).toBe('연습실');
      expect(STUDIO_CATEGORIES.club).toBe('클럽/바');
      expect(STUDIO_CATEGORIES.public_space).toBe('공공장소');
      expect(STUDIO_CATEGORIES.cafe).toBe('카페');
    });

    it('should be readonly object', () => {
      expect(() => {
        // @ts-expect-error - Testing readonly behavior
        STUDIO_CATEGORIES.studio = '다른 값';
      }).toThrow();
    });

    it('should have 5 categories total', () => {
      expect(Object.keys(STUDIO_CATEGORIES)).toHaveLength(5);
    });
  });

  describe('OPERATION_STATUS', () => {
    it('should contain all expected statuses with Korean translations', () => {
      expect(OPERATION_STATUS.active).toBe('운영 중');
      expect(OPERATION_STATUS.temporarily_closed).toBe('임시 휴업');
      expect(OPERATION_STATUS.permanently_closed).toBe('영구 폐업');
    });

    it('should be readonly object', () => {
      expect(() => {
        // @ts-expect-error - Testing readonly behavior
        OPERATION_STATUS.active = '다른 값';
      }).toThrow();
    });

    it('should have 3 statuses total', () => {
      expect(Object.keys(OPERATION_STATUS)).toHaveLength(3);
    });
  });
});

describe('Studio Types - Interface Compatibility Tests', () => {
  describe('Studio Interface', () => {
    it('should validate complete studio object', () => {
      const studio: Studio = mockStudio;

      expect(studio.id).toBe('studio_001');
      expect(studio.name).toContain('스윙댄스');
      expect(studio.category).toBe('studio');
      expect(studio.location.geopoint).toBeInstanceOf(GeoPoint);
      expect(studio.stats.avgRating).toBeGreaterThan(0);
      expect(studio.metadata.verified).toBe(true);
    });

    it('should validate minimal studio object', () => {
      const minimalStudio: Studio = {
        id: 'studio_min',
        name: '최소 스튜디오',
        category: 'practice_room',
        location: {
          geopoint: mockGeoPoint,
          address: '서울특별시 강남구',
          region: '강남구'
        },
        stats: {
          views: 0,
          favorites: 0,
          avgRating: 0,
          reviewCount: 0
        },
        metadata: {
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
          createdBy: 'user456',
          verified: false,
          featured: false,
          status: 'active'
        }
      };

      expect(minimalStudio.contact).toBeUndefined();
      expect(minimalStudio.facilities).toBeUndefined();
      expect(minimalStudio.pricing).toBeUndefined();
    });
  });

  describe('CreateStudioData Interface', () => {
    it('should validate studio creation data', () => {
      const createData: CreateStudioData = {
        name: '새로운 스튜디오',
        description: '새로 만드는 스튜디오입니다.',
        category: 'studio',
        location: {
          address: '서울특별시 마포구 홍대입구역',
          region: '마포구',
          coordinates: mockKakaoLatLng
        },
        contact: {
          phone: '02-9876-5432',
          email: 'new@studio.com'
        },
        pricing: {
          hourly: 40000,
          currency: 'KRW'
        },
        tags: ['홍대', '스윙댄스'],
        keywords: ['hongdae', 'swing']
      };

      expect(createData.location.coordinates.lat).toBe(37.5665);
      expect(createData.location.coordinates.lng).toBe(126.9780);
      expect(createData.tags).toContain('홍대');
    });

    it('should validate minimal creation data', () => {
      const minimalCreateData: CreateStudioData = {
        name: '최소 생성 데이터',
        category: 'public_space',
        location: {
          address: '서울특별시 종로구',
          region: '종로구',
          coordinates: mockKakaoLatLng
        }
      };

      expect(minimalCreateData.description).toBeUndefined();
      expect(minimalCreateData.contact).toBeUndefined();
    });
  });

  describe('UpdateStudioData Interface', () => {
    it('should validate partial update data', () => {
      const updateData: UpdateStudioData = {
        name: '업데이트된 스튜디오명',
        status: 'temporarily_closed',
        verified: true,
        pricing: {
          hourly: 60000,
          currency: 'KRW',
          notes: '가격 인상'
        }
      };

      expect(updateData.name).toBe('업데이트된 스튜디오명');
      expect(updateData.status).toBe('temporarily_closed');
      expect(updateData.verified).toBe(true);
    });

    it('should validate single field update', () => {
      const singleUpdate: UpdateStudioData = {
        featured: true
      };

      expect(singleUpdate.featured).toBe(true);
      expect(singleUpdate.name).toBeUndefined();
    });
  });
});

describe('Studio Types - Search and Filter Tests', () => {
  describe('StudioSearchFilters Interface', () => {
    it('should validate comprehensive search filters', () => {
      const filters: StudioSearchFilters = {
        category: ['studio', 'practice_room'],
        region: ['강남구', '마포구'],
        hasParking: true,
        hasSoundSystem: true,
        hasAirConditioning: false,
        minArea: 50,
        maxArea: 200,
        priceRange: {
          min: 30000,
          max: 80000,
          type: 'hourly'
        },
        coordinates: mockKakaoLatLng,
        radius: 5
      };

      expect(filters.category).toContain('studio');
      expect(filters.region).toContain('강남구');
      expect(filters.priceRange?.type).toBe('hourly');
      expect(filters.radius).toBe(5);
    });

    it('should validate minimal search filters', () => {
      const minimalFilters: StudioSearchFilters = {
        region: ['서초구']
      };

      expect(minimalFilters.region).toEqual(['서초구']);
      expect(minimalFilters.category).toBeUndefined();
    });

    it('should handle edge case price ranges', () => {
      const edgeFilters: StudioSearchFilters = {
        priceRange: {
          min: 0,
          max: 2000000,
          type: 'monthly'
        }
      };

      expect(edgeFilters.priceRange?.min).toBe(0);
      expect(edgeFilters.priceRange?.max).toBe(2000000);
    });
  });

  describe('StudioSearchResult Interface', () => {
    it('should validate search result structure', () => {
      const searchResult: StudioSearchResult = {
        studios: [mockStudio],
        total: 1,
        hasMore: false,
        filters: {
          region: ['강남구']
        }
      };

      expect(searchResult.studios).toHaveLength(1);
      expect(searchResult.total).toBe(1);
      expect(searchResult.hasMore).toBe(false);
    });

    it('should handle empty search results', () => {
      const emptyResult: StudioSearchResult = {
        studios: [],
        total: 0,
        hasMore: false,
        filters: {
          category: ['club']
        }
      };

      expect(emptyResult.studios).toHaveLength(0);
      expect(emptyResult.total).toBe(0);
    });
  });

  describe('GeographicSearch Interface', () => {
    it('should validate geographic search parameters', () => {
      const geoSearch: GeographicSearch = {
        center: mockKakaoLatLng,
        radius: 10,
        limit: 20,
        category: 'studio'
      };

      expect(geoSearch.center.lat).toBe(37.5665);
      expect(geoSearch.radius).toBe(10);
      expect(geoSearch.limit).toBe(20);
    });

    it('should validate minimal geographic search', () => {
      const minimalGeoSearch: GeographicSearch = {
        center: mockKakaoLatLng,
        radius: 5
      };

      expect(minimalGeoSearch.limit).toBeUndefined();
      expect(minimalGeoSearch.category).toBeUndefined();
    });
  });
});

describe('Studio Types - Response and Error Tests', () => {
  describe('StudiosResponse Interface', () => {
    it('should validate paginated studios response', () => {
      const response: StudiosResponse = {
        data: [mockStudio],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          hasNext: true,
          hasPrev: false
        }
      };

      expect(response.data).toHaveLength(1);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.hasNext).toBe(true);
      expect(response.pagination.hasPrev).toBe(false);
    });

    it('should handle last page response', () => {
      const lastPageResponse: StudiosResponse = {
        data: [mockStudio],
        pagination: {
          page: 3,
          limit: 10,
          total: 25,
          hasNext: false,
          hasPrev: true
        }
      };

      expect(lastPageResponse.pagination.hasNext).toBe(false);
      expect(lastPageResponse.pagination.hasPrev).toBe(true);
    });
  });

  describe('StudioError Interface', () => {
    it('should validate complete error structure', () => {
      const error: StudioError = {
        code: 'VALIDATION_ERROR',
        message: '필수 필드가 누락되었습니다.',
        field: 'name'
      };

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toContain('필수 필드');
      expect(error.field).toBe('name');
    });

    it('should validate error without field', () => {
      const generalError: StudioError = {
        code: 'SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      };

      expect(generalError.field).toBeUndefined();
    });
  });
});

describe('Studio Types - Edge Cases and Validation', () => {
  describe('Boundary Conditions', () => {
    it('should handle zero values appropriately', () => {
      const zeroStats: StudioStats = {
        views: 0,
        favorites: 0,
        avgRating: 0,
        reviewCount: 0
      };

      expect(zeroStats.views).toBe(0);
      expect(zeroStats.avgRating).toBe(0);
    });

    it('should handle maximum rating', () => {
      const maxRatingStats: StudioStats = {
        views: 999999,
        favorites: 9999,
        avgRating: 5.0,
        reviewCount: 500
      };

      expect(maxRatingStats.avgRating).toBe(5.0);
      expect(maxRatingStats.reviewCount).toBe(500);
    });

    it('should handle very long strings', () => {
      const longDescription = 'A'.repeat(1000);
      const studioWithLongDesc: Partial<Studio> = {
        description: longDescription
      };

      expect(studioWithLongDesc.description).toHaveLength(1000);
    });
  });

  describe('Array and Object Validation', () => {
    it('should handle empty arrays', () => {
      const emptyArrays: Pick<StudioFacilities, 'equipment' | 'amenities'> = {
        equipment: [],
        amenities: []
      };

      expect(emptyArrays.equipment).toHaveLength(0);
      expect(emptyArrays.amenities).toHaveLength(0);
    });

    it('should handle large arrays', () => {
      const manyEquipment = Array.from({length: 50}, (_, i) => `장비${i + 1}`);
      const facilitiesWithMany: Pick<StudioFacilities, 'equipment'> = {
        equipment: manyEquipment
      };

      expect(facilitiesWithMany.equipment).toHaveLength(50);
    });

    it('should handle special characters in strings', () => {
      const specialCharStudio: Pick<Studio, 'name' | 'description'> = {
        name: '스윙댄스 & 재즈클럽 @홍대 #스튜디오',
        description: '특수문자 포함: !@#$%^&*()_+-=[]{}|;:,.<>?'
      };

      expect(specialCharStudio.name).toContain('&');
      expect(specialCharStudio.description).toContain('!@#$%');
    });
  });

  describe('Type Guard Tests', () => {
    it('should distinguish between studio categories', () => {
      const isValidCategory = (category: string): category is StudioCategory => {
        return ['studio', 'practice_room', 'club', 'public_space', 'cafe'].includes(category as StudioCategory);
      };

      expect(isValidCategory('studio')).toBe(true);
      expect(isValidCategory('invalid')).toBe(false);
      expect(isValidCategory('practice_room')).toBe(true);
    });

    it('should validate operation status', () => {
      const isValidStatus = (status: string): status is OperationStatus => {
        return ['active', 'temporarily_closed', 'permanently_closed'].includes(status as OperationStatus);
      };

      expect(isValidStatus('active')).toBe(true);
      expect(isValidStatus('closed')).toBe(false);
      expect(isValidStatus('temporarily_closed')).toBe(true);
    });

    it('should validate pricing currency', () => {
      const isValidPricing = (pricing: any): pricing is StudioPricing => {
        return pricing && pricing.currency === 'KRW';
      };

      expect(isValidPricing({ currency: 'KRW' })).toBe(true);
      expect(isValidPricing({ currency: 'USD' })).toBe(false);
      expect(isValidPricing({})).toBe(false);
    });
  });

  describe('Integration Type Tests', () => {
    it('should ensure CreateStudioData excludes metadata fields', () => {
      const createData: CreateStudioData = {
        name: '통합 테스트 스튜디오',
        category: 'studio',
        location: {
          address: '서울특별시 용산구',
          region: '용산구',
          coordinates: mockKakaoLatLng
        }
      };

      // CreateStudioData에는 id, stats, metadata가 없어야 함
      expect('id' in createData).toBe(false);
      expect('stats' in createData).toBe(false);
      expect('metadata' in createData).toBe(false);
    });

    it('should ensure UpdateStudioData allows partial updates', () => {
      const updateData: UpdateStudioData = {
        name: '부분 업데이트'
      };

      // 모든 필드가 선택적이어야 함
      expect(updateData.category).toBeUndefined();
      expect(updateData.location).toBeUndefined();
      expect(updateData.contact).toBeUndefined();
    });

    it('should maintain type compatibility across interfaces', () => {
      // Studio에서 CreateStudioData로 변환 테스트
      const studio = mockStudio;
      const createDataFromStudio: CreateStudioData = {
        name: studio.name,
        description: studio.description,
        category: studio.category,
        location: {
          ...studio.location,
          coordinates: mockKakaoLatLng,
          geopoint: undefined as any // CreateStudioData에서는 coordinates 사용
        },
        contact: studio.contact,
        facilities: studio.facilities,
        pricing: studio.pricing,
        operatingHours: studio.operatingHours,
        images: studio.images,
        tags: studio.metadata.tags,
        keywords: studio.metadata.keywords
      };

      // geopoint 제거
      delete (createDataFromStudio.location as any).geopoint;

      expect(createDataFromStudio.name).toBe(studio.name);
      expect(createDataFromStudio.category).toBe(studio.category);
    });
  });
});

describe('Studio Types - Performance and Memory Tests', () => {
  describe('Large Dataset Handling', () => {
    it('should handle large studio arrays efficiently', () => {
      const largeStudioArray: Studio[] = Array.from({length: 1000}, (_, i) => ({
        ...mockStudio,
        id: `studio_${i}`,
        name: `스튜디오 ${i}`,
        stats: {
          ...mockStudio.stats,
          views: i * 10
        }
      }));

      expect(largeStudioArray).toHaveLength(1000);
      expect(largeStudioArray[500].id).toBe('studio_500');
      expect(largeStudioArray[999].stats.views).toBe(9990);
    });

    it('should handle complex nested data structures', () => {
      const complexStudio: Studio = {
        ...mockStudio,
        facilities: {
          ...mockStudioFacilities,
          equipment: Array.from({length: 100}, (_, i) => `장비_${i}`),
          amenities: Array.from({length: 50}, (_, i) => `편의시설_${i}`)
        },
        location: {
          ...mockStudioLocation,
          subway: Array.from({length: 20}, (_, i) => `지하철역_${i}`),
          landmarks: Array.from({length: 30}, (_, i) => `랜드마크_${i}`)
        }
      };

      expect(complexStudio.facilities?.equipment).toHaveLength(100);
      expect(complexStudio.location.subway).toHaveLength(20);
      expect(complexStudio.location.landmarks).toHaveLength(30);
    });
  });

  describe('Memory Efficiency Tests', () => {
    it('should reuse common data structures', () => {
      const commonLocation = mockStudioLocation;
      const commonPricing = mockStudioPricing;

      const studio1: Studio = {
        ...mockStudio,
        id: 'studio_1',
        location: commonLocation,
        pricing: commonPricing
      };

      const studio2: Studio = {
        ...mockStudio,
        id: 'studio_2',
        location: commonLocation,
        pricing: commonPricing
      };

      // 같은 객체 참조를 공유해야 함
      expect(studio1.location).toBe(studio2.location);
      expect(studio1.pricing).toBe(studio2.pricing);
    });
  });
});

describe('Studio Types - Error Scenarios', () => {
  describe('Invalid Data Handling', () => {
    it('should identify invalid category values', () => {
      const invalidCategory = 'invalid_category';
      const validCategories = Object.keys(STUDIO_CATEGORIES);

      expect(validCategories.includes(invalidCategory)).toBe(false);
    });

    it('should identify invalid status values', () => {
      const invalidStatus = 'invalid_status';
      const validStatuses = Object.keys(OPERATION_STATUS);

      expect(validStatuses.includes(invalidStatus)).toBe(false);
    });

    it('should handle invalid coordinate ranges', () => {
      const invalidCoordinates: KakaoLatLng = {
        lat: 91, // 위도는 -90 ~ 90
        lng: 181 // 경도는 -180 ~ 180
      };

      expect(Math.abs(invalidCoordinates.lat) > 90).toBe(true);
      expect(Math.abs(invalidCoordinates.lng) > 180).toBe(true);
    });
  });

  describe('Validation Function Tests', () => {
    it('should test ValidateStudioData function type', () => {
      const mockValidator: ValidateStudioData = (data: CreateStudioData): StudioError[] => {
        const errors: StudioError[] = [];

        if (!data.name || data.name.trim().length === 0) {
          errors.push({
            code: 'REQUIRED_FIELD',
            message: '스튜디오 이름은 필수입니다.',
            field: 'name'
          });
        }

        if (!data.category) {
          errors.push({
            code: 'REQUIRED_FIELD',
            message: '카테고리는 필수입니다.',
            field: 'category'
          });
        }

        return errors;
      };

      // 유효한 데이터 테스트
      const validData: CreateStudioData = {
        name: '테스트 스튜디오',
        category: 'studio',
        location: {
          address: '서울특별시',
          region: '강남구',
          coordinates: mockKakaoLatLng
        }
      };

      expect(mockValidator(validData)).toHaveLength(0);

      // 무효한 데이터 테스트
      const invalidData: CreateStudioData = {
        name: '',
        category: undefined as any,
        location: {
          address: '',
          region: '',
          coordinates: mockKakaoLatLng
        }
      };

      const errors = mockValidator(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'name')).toBe(true);
    });
  });
});