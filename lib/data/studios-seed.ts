/**
 * 스튜디오 초기 더미 데이터
 * 서울 주요 지역의 스윙댄스 스튜디오 샘플 데이터
 */

'use server'

import { createStudio } from '@/lib/actions/studios'
import type { CreateStudioData } from '@/lib/types/studio'

/**
 * 더미 스튜디오 데이터
 */
export const SEED_STUDIOS: CreateStudioData[] = [
  // 강남 지역
  {
    name: "강남 스윙 스튜디오",
    description: "강남 중심가에 위치한 프리미엄 스윙댄스 스튜디오입니다. 넓은 공간과 최고급 시설로 편안한 연습 환경을 제공합니다.",
    category: "studio",
    location: {
      coordinates: { lat: 37.5173, lng: 127.0473 },
      address: "서울특별시 강남구 테헤란로 123",
      addressDetail: "2층",
      region: "강남",
      district: "서울특별시 강남구",
      subway: ["강남역", "역삼역"],
      landmarks: ["강남역 2번 출구", "CGV 강남"]
    },
    contact: {
      phone: "02-555-1234",
      email: "info@gangnamswing.com",
      website: "https://gangnamswing.com",
      kakaoTalk: "gangnamswing",
      instagram: "@gangnamswing_official"
    },
    facilities: {
      area: 80,
      capacity: 30,
      floorType: "원목",
      soundSystem: true,
      airConditioning: true,
      parking: true,
      wifi: true,
      shower: true,
      lockers: true,
      equipment: ["음향시설", "거울", "의자", "정수기"],
      amenities: ["주차장", "샤워실", "사물함", "대기실"]
    },
    pricing: {
      hourly: 50000,
      daily: 300000,
      monthly: 800000,
      dropIn: 20000,
      currency: "KRW",
      notes: "주말 요금 20% 할증"
    },
    operatingHours: {
      monday: "10:00-22:00",
      tuesday: "10:00-22:00",
      wednesday: "10:00-22:00",
      thursday: "10:00-22:00",
      friday: "10:00-23:00",
      saturday: "09:00-23:00",
      sunday: "09:00-22:00",
      holidays: "10:00-20:00"
    },
    tags: ["프리미엄", "강남", "넓은공간", "주차가능"],
    keywords: ["강남", "스윙댄스", "프리미엄", "스튜디오"]
  },

  // 홍대 지역
  {
    name: "홍대 스윙 펍",
    description: "홍대 클럽가에 위치한 분위기 있는 스윙댄스 클럽입니다. 매주 소셜댄스 파티와 라이브 밴드 공연이 열립니다.",
    category: "club",
    location: {
      coordinates: { lat: 37.5563, lng: 126.9236 },
      address: "서울특별시 마포구 와우산로 29길 15",
      addressDetail: "지하 1층",
      region: "홍대",
      district: "서울특별시 마포구",
      subway: ["홍익대입구역", "상수역"],
      landmarks: ["홍대 놀이터", "클럽 오케이"]
    },
    contact: {
      phone: "02-333-5678",
      email: "party@hongdaeswing.com",
      kakaoTalk: "hongdaeswing",
      instagram: "@hongdae_swing_pub"
    },
    facilities: {
      area: 60,
      capacity: 50,
      floorType: "리놀륨",
      soundSystem: true,
      airConditioning: true,
      parking: false,
      wifi: true,
      shower: false,
      lockers: true,
      equipment: ["프로 음향", "조명", "바", "무대"],
      amenities: ["바", "라운지", "사물함"]
    },
    pricing: {
      dropIn: 15000,
      currency: "KRW",
      notes: "음료 주문 시 입장료 할인"
    },
    operatingHours: {
      monday: "closed",
      tuesday: "closed",
      wednesday: "19:00-02:00",
      thursday: "19:00-02:00",
      friday: "19:00-03:00",
      saturday: "19:00-03:00",
      sunday: "19:00-01:00"
    },
    tags: ["클럽", "홍대", "파티", "라이브"],
    keywords: ["홍대", "클럽", "소셜댄스", "파티", "라이브밴드"]
  },

  // 신촌 지역
  {
    name: "신촌 댄스 연습실",
    description: "합리적인 가격의 신촌 댄스 연습실입니다. 학생들에게 인기가 많으며 깨끗하고 편리한 시설을 제공합니다.",
    category: "practice_room",
    location: {
      coordinates: { lat: 37.5596, lng: 126.9426 },
      address: "서울특별시 서대문구 신촌로 134",
      addressDetail: "3층 301호",
      region: "신촌",
      district: "서울특별시 서대문구",
      subway: ["신촌역", "이대역"],
      landmarks: ["신촌 로터리", "연세대학교"]
    },
    contact: {
      phone: "02-777-9012",
      email: "rent@sinchondance.com",
      booking: "카카오톡 예약 필수"
    },
    facilities: {
      area: 40,
      capacity: 15,
      floorType: "원목",
      soundSystem: true,
      airConditioning: true,
      parking: false,
      wifi: true,
      shower: false,
      lockers: false,
      equipment: ["블루투스 스피커", "거울", "의자"],
      amenities: ["WiFi", "정수기"]
    },
    pricing: {
      hourly: 25000,
      daily: 150000,
      currency: "KRW",
      notes: "학생 할인 20%"
    },
    operatingHours: {
      monday: "09:00-22:00",
      tuesday: "09:00-22:00",
      wednesday: "09:00-22:00",
      thursday: "09:00-22:00",
      friday: "09:00-22:00",
      saturday: "10:00-20:00",
      sunday: "10:00-20:00"
    },
    tags: ["저렴", "신촌", "학생", "연습실"],
    keywords: ["신촌", "연습실", "학생할인", "합리적"]
  },

  // 이태원 지역
  {
    name: "이태원 글로벌 댄스홀",
    description: "국제적인 분위기의 이태원 댄스홀입니다. 외국인 강사들과 함께하는 정통 스윙댄스 클래스가 유명합니다.",
    category: "studio",
    location: {
      coordinates: { lat: 37.5347, lng: 126.9947 },
      address: "서울특별시 용산구 이태원로 199",
      addressDetail: "2층",
      region: "이태원",
      district: "서울특별시 용산구",
      subway: ["이태원역", "한강진역"],
      landmarks: ["이태원 메인스트리트", "해밀턴 호텔"]
    },
    contact: {
      phone: "02-444-7890",
      email: "hello@itaewondance.com",
      website: "https://itaewonglobaldance.com",
      instagram: "@itaewon_global_dance"
    },
    facilities: {
      area: 70,
      capacity: 25,
      floorType: "리놀륨",
      soundSystem: true,
      airConditioning: true,
      parking: false,
      wifi: true,
      shower: true,
      lockers: true,
      equipment: ["프로 음향", "거울", "의자", "에어컨"],
      amenities: ["샤워실", "사물함", "라운지"]
    },
    pricing: {
      dropIn: 25000,
      monthly: 180000,
      currency: "KRW",
      notes: "외국인 강사 클래스"
    },
    operatingHours: {
      monday: "18:00-22:00",
      tuesday: "18:00-22:00",
      wednesday: "18:00-22:00",
      thursday: "18:00-22:00",
      friday: "18:00-23:00",
      saturday: "14:00-23:00",
      sunday: "14:00-22:00"
    },
    tags: ["국제적", "이태원", "외국인강사", "정통"],
    keywords: ["이태원", "글로벌", "외국인강사", "정통스윙"]
  },

  // 건대 지역
  {
    name: "건대 유니버시티 댄스룸",
    description: "건국대학교 근처의 학생 친화적인 댄스 공간입니다. 동아리 연습과 개인 레슨에 최적화되어 있습니다.",
    category: "practice_room",
    location: {
      coordinates: { lat: 37.5401, lng: 127.0688 },
      address: "서울특별시 광진구 능동로 120",
      addressDetail: "4층",
      region: "건대",
      district: "서울특별시 광진구",
      subway: ["건대입구역", "구의역"],
      landmarks: ["건국대학교", "건대 로데오거리"]
    },
    contact: {
      phone: "02-666-3456",
      email: "info@konkukdance.com",
      kakaoTalk: "konkukdance"
    },
    facilities: {
      area: 50,
      capacity: 20,
      floorType: "리놀륨",
      soundSystem: true,
      airConditioning: true,
      parking: false,
      wifi: true,
      shower: false,
      lockers: true,
      equipment: ["스피커", "거울", "매트"],
      amenities: ["사물함", "정수기", "휴게실"]
    },
    pricing: {
      hourly: 20000,
      daily: 120000,
      monthly: 500000,
      currency: "KRW",
      notes: "대학생 할인 30%"
    },
    operatingHours: {
      monday: "10:00-22:00",
      tuesday: "10:00-22:00",
      wednesday: "10:00-22:00",
      thursday: "10:00-22:00",
      friday: "10:00-22:00",
      saturday: "12:00-20:00",
      sunday: "12:00-20:00"
    },
    tags: ["대학가", "건대", "학생할인", "동아리"],
    keywords: ["건대", "대학생", "동아리", "저렴"]
  },

  // 압구정 지역
  {
    name: "압구정 프리미엄 댄스 살롱",
    description: "압구정 로데오거리의 고급 댄스 살롱입니다. VIP 서비스와 개인 레슨 전문으로 운영됩니다.",
    category: "studio",
    location: {
      coordinates: { lat: 37.5274, lng: 127.0276 },
      address: "서울특별시 강남구 압구정로 333",
      addressDetail: "5층 펜트하우스",
      region: "압구정",
      district: "서울특별시 강남구",
      subway: ["압구정역", "강남구청역"],
      landmarks: ["압구정 로데오거리", "갤러리아백화점"]
    },
    contact: {
      phone: "02-888-1111",
      email: "vip@apgujeongdance.com",
      website: "https://apgujeongpremium.com"
    },
    facilities: {
      area: 90,
      capacity: 20,
      floorType: "원목",
      soundSystem: true,
      airConditioning: true,
      parking: true,
      wifi: true,
      shower: true,
      lockers: true,
      equipment: ["하이엔드 음향", "전면 거울", "샹들리에", "바"],
      amenities: ["발레파킹", "VIP 라운지", "샤워실", "드레싱룸"]
    },
    pricing: {
      hourly: 80000,
      daily: 500000,
      dropIn: 40000,
      currency: "KRW",
      notes: "VIP 멤버십 할인 가능"
    },
    operatingHours: {
      monday: "11:00-21:00",
      tuesday: "11:00-21:00",
      wednesday: "11:00-21:00",
      thursday: "11:00-21:00",
      friday: "11:00-22:00",
      saturday: "10:00-22:00",
      sunday: "10:00-20:00"
    },
    tags: ["프리미엄", "압구정", "VIP", "개인레슨"],
    keywords: ["압구정", "프리미엄", "VIP", "고급", "개인레슨"]
  },

  // 공공장소 - 한강공원
  {
    name: "한강공원 야외 댄스 스팟",
    description: "한강공원 반포지구의 야외 댄스 연습 공간입니다. 날씨가 좋은 날 자연 속에서 자유롭게 연습할 수 있습니다.",
    category: "public_space",
    location: {
      coordinates: { lat: 37.5219, lng: 126.9962 },
      address: "서울특별시 서초구 반포한강공원",
      region: "반포",
      district: "서울특별시 서초구",
      subway: ["고속터미널역"],
      landmarks: ["반포 무지개다리", "세빛섬"]
    },
    contact: {
      phone: "02-120",
      email: "hangang@seoul.go.kr"
    },
    facilities: {
      area: 200,
      capacity: 100,
      floorType: "야외 바닥",
      soundSystem: false,
      airConditioning: false,
      parking: true,
      wifi: false,
      shower: false,
      lockers: false,
      equipment: ["야외 무대", "벤치"],
      amenities: ["주차장", "화장실", "매점"]
    },
    pricing: {
      hourly: 0,
      currency: "KRW",
      notes: "무료 이용 가능"
    },
    operatingHours: {
      monday: "06:00-22:00",
      tuesday: "06:00-22:00",
      wednesday: "06:00-22:00",
      thursday: "06:00-22:00",
      friday: "06:00-22:00",
      saturday: "06:00-22:00",
      sunday: "06:00-22:00"
    },
    tags: ["무료", "야외", "한강", "자연"],
    keywords: ["한강공원", "야외", "무료", "자연"]
  },

  // 카페 겸 댄스 공간
  {
    name: "스윙 카페 멜로디",
    description: "카페와 댄스 공간이 결합된 복합 문화공간입니다. 커피를 마시며 여유롭게 댄스를 즐길 수 있습니다.",
    category: "cafe",
    location: {
      coordinates: { lat: 37.5636, lng: 126.9832 },
      address: "서울특별시 중구 명동길 74",
      addressDetail: "2층",
      region: "명동",
      district: "서울특별시 중구",
      subway: ["명동역", "을지로입구역"],
      landmarks: ["명동성당", "롯데백화점"]
    },
    contact: {
      phone: "02-222-7777",
      email: "hello@swingmelody.com",
      instagram: "@swing_cafe_melody"
    },
    facilities: {
      area: 45,
      capacity: 25,
      floorType: "원목",
      soundSystem: true,
      airConditioning: true,
      parking: false,
      wifi: true,
      shower: false,
      lockers: false,
      equipment: ["카페 음향", "거울", "테이블", "의자"],
      amenities: ["카페", "WiFi", "테라스"]
    },
    pricing: {
      dropIn: 10000,
      currency: "KRW",
      notes: "음료 주문 시 이용 가능"
    },
    operatingHours: {
      monday: "10:00-22:00",
      tuesday: "10:00-22:00",
      wednesday: "10:00-22:00",
      thursday: "10:00-22:00",
      friday: "10:00-23:00",
      saturday: "10:00-23:00",
      sunday: "11:00-21:00"
    },
    tags: ["카페", "명동", "복합공간", "여유"],
    keywords: ["카페", "명동", "복합문화공간", "커피"]
  }
]

/**
 * 더미 데이터를 Firestore에 저장
 */
export async function seedStudios(createdBy: string = 'seed-admin'): Promise<{
  success: boolean
  createdCount: number
  errors: string[]
}> {
  const results = {
    success: true,
    createdCount: 0,
    errors: [] as string[]
  }

  for (const studioData of SEED_STUDIOS) {
    try {
      const result = await createStudio(studioData, createdBy)

      if (result.success) {
        results.createdCount++
        console.log(`✅ 스튜디오 생성 완료: ${studioData.name}`)
      } else {
        results.errors.push(`❌ ${studioData.name}: ${result.error}`)
        console.error(`❌ 스튜디오 생성 실패: ${studioData.name} - ${result.error}`)
      }
    } catch (error) {
      const errorMsg = `${studioData.name}: ${error}`
      results.errors.push(errorMsg)
      console.error(`❌ 예외 발생: ${errorMsg}`)
    }
  }

  if (results.errors.length > 0) {
    results.success = false
  }

  console.log(`\n📊 시드 데이터 생성 결과:`)
  console.log(`✅ 성공: ${results.createdCount}개`)
  console.log(`❌ 실패: ${results.errors.length}개`)

  return results
}

/**
 * 특정 지역의 스튜디오만 생성
 */
export async function seedStudiosByRegion(
  region: string,
  createdBy: string = 'seed-admin'
): Promise<{ success: boolean; createdCount: number; errors: string[] }> {
  const regionStudios = SEED_STUDIOS.filter(
    studio => studio.location.region === region
  )

  if (regionStudios.length === 0) {
    return {
      success: false,
      createdCount: 0,
      errors: [`지역 '${region}'에 해당하는 스튜디오 데이터가 없습니다.`]
    }
  }

  const results = {
    success: true,
    createdCount: 0,
    errors: [] as string[]
  }

  for (const studioData of regionStudios) {
    try {
      const result = await createStudio(studioData, createdBy)

      if (result.success) {
        results.createdCount++
      } else {
        results.errors.push(`${studioData.name}: ${result.error}`)
      }
    } catch (error) {
      results.errors.push(`${studioData.name}: ${error}`)
    }
  }

  if (results.errors.length > 0) {
    results.success = false
  }

  return results
}

/**
 * 사용 가능한 지역 목록 반환
 */
export function getAvailableRegions(): string[] {
  return Array.from(new Set(SEED_STUDIOS.map(studio => studio.location.region)))
}