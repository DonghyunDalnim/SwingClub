/**
 * 커뮤니티 기능 테스트용 시드 데이터 생성 스크립트
 *
 * 사용법:
 * npx ts-node scripts/seed-community-data.ts
 *
 * 주의: 이 스크립트는 개발 환경에서만 사용하세요.
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore'
import type {
  CreatePostData,
  CreateCommentData,
  PostCategory,
  PostVisibility
} from '../lib/types/community'

// Firebase 설정 (환경 변수에서 로드)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// 샘플 사용자 데이터
const sampleUsers = [
  {
    id: 'user1',
    name: '김스윙',
    email: 'kimswing@example.com'
  },
  {
    id: 'user2',
    name: '이린디',
    email: 'lelindy@example.com'
  },
  {
    id: 'user3',
    name: '박솔로',
    email: 'parksolo@example.com'
  },
  {
    id: 'user4',
    name: '최밸런',
    email: 'choibalance@example.com'
  },
  {
    id: 'user5',
    name: '정찰스턴',
    email: 'jungcharleston@example.com'
  }
]

// 샘플 게시글 데이터
const samplePosts: Omit<CreatePostData, 'region'>[] = [
  {
    title: '🎵 강남 스윙댄스 정기모임 안내',
    content: `안녕하세요! 강남에서 매주 화요일마다 열리는 스윙댄스 정기모임에 초대합니다.

📅 일시: 매주 화요일 오후 7시 - 9시
📍 장소: 강남 댄스스튜디오 A (강남역 3번 출구 도보 5분)
💰 참가비: 15,000원 (음료 포함)

초보자부터 중급자까지 누구나 환영합니다!
파트너가 없어도 걱정하지 마세요. 현장에서 로테이션으로 연습합니다.

문의사항은 댓글로 남겨주세요! 🕺💃`,
    category: 'event' as PostCategory,
    visibility: 'public' as PostVisibility,
    tags: ['강남', '정기모임', '초보환영', '린디합'],
    keywords: ['스윙댄스', '강남', '정기모임', '화요일'],
    eventInfo: {
      startDate: new Date('2024-12-24T19:00:00') as any,
      endDate: new Date('2024-12-24T21:00:00') as any,
      location: {
        address: '서울특별시 강남구 강남대로 123',
        region: '강남',
        details: '강남 댄스스튜디오 A'
      },
      capacity: 30,
      requiresRegistration: true,
      registrationDeadline: new Date('2024-12-23T23:59:59') as any,
      fee: {
        amount: 15000,
        currency: 'KRW',
        negotiable: false
      },
      organizer: 'user1'
    }
  },
  {
    title: '🤔 린디합 기본기 질문드려요',
    content: `안녕하세요! 스윙댄스를 시작한지 한 달 정도 된 초보입니다.

린디합의 기본 스텝 중에서 Rock Step에서 자꾸 중심을 잃게 되는데, 어떻게 연습하면 좋을까요?

특히 템포가 빠른 곡에서는 더 어려워지는 것 같아요.
집에서 혼자 연습할 수 있는 방법이 있을까요?

경험 많으신 분들의 조언 부탁드립니다! 🙏`,
    category: 'qna' as PostCategory,
    visibility: 'public' as PostVisibility,
    tags: ['린디합', '기본기', '초보', 'rock-step'],
    keywords: ['린디합', '기본기', 'rock step', '초보자']
  },
  {
    title: '💫 홍대 스윙클럽 Swing Seoul 리뷰',
    content: `지난 주말에 홍대의 Swing Seoul에 다녀왔습니다!

✨ 분위기: 5/5
- 라이브 밴드가 연주하는 스윙 음악이 정말 환상적이었어요
- 빈티지한 인테리어로 1940년대 분위기가 물씬!

🕺 댄서들: 4/5
- 실력자들이 많아서 보는 재미가 있었음
- 초보자도 적극적으로 함께 춤출 수 있는 분위기

🍸 음료/음식: 4/5
- 칵테일이 맛있고 가격도 합리적
- 안주도 괜찮은 편

💰 가격: 15,000원 (입장료)

다음에도 꼭 가고 싶은 곳이에요! 스윙 좋아하시는 분들께 추천드립니다. 👍`,
    category: 'review' as PostCategory,
    visibility: 'public' as PostVisibility,
    tags: ['홍대', 'swing-seoul', '리뷰', '라이브밴드'],
    keywords: ['홍대', 'swing seoul', '스윙클럽', '리뷰']
  },
  {
    title: '👞 스윙댄스화 판매합니다 (새제품)',
    content: `안녕하세요! 새로 산 스윙댄스화를 판매합니다.

👠 브랜드: Aris Allen
📏 사이즈: 250mm (여성용)
💰 가격: 120,000원 (정가 180,000원)
📦 상태: 새제품 (한 번도 착용 안함)

사이즈가 맞지 않아서 판매하게 되었습니다.
정품이고 박스, 보증서 모두 포함입니다.

📍 거래 방법:
- 직거래 우선 (홍대, 강남 가능)
- 택배거래 가능 (착불)

관심 있으시면 댓글이나 쪽지 주세요! 🛍️`,
    category: 'marketplace' as PostCategory,
    visibility: 'public' as PostVisibility,
    tags: ['댄스화', 'aris-allen', '새제품', '여성용'],
    keywords: ['스윙댄스화', 'aris allen', '250mm', '새제품'],
    marketplaceInfo: {
      price: {
        amount: 120000,
        currency: 'KRW',
        negotiable: true,
        originalPrice: 180000
      },
      condition: 'new',
      brand: 'Aris Allen',
      deliveryMethod: ['pickup', 'delivery'],
      location: {
        region: '서울',
        details: '홍대, 강남 직거래 가능'
      }
    }
  },
  {
    title: '📚 추천 스윙댄스 강사님 있나요?',
    content: `스윙댄스를 제대로 배우고 싶어서 개인레슨을 받으려고 합니다.

찾는 조건:
- 서울 강남/홍대 지역
- 초보자 대상 경험 많으신 분
- 린디합, 찰스턴 모두 가능하신 분
- 합리적인 가격

혹시 좋은 강사님 추천해주실 수 있나요?
개인레슨 받으신 경험담도 공유해주시면 감사하겠습니다!

🙏 미리 감사드려요!`,
    category: 'lesson' as PostCategory,
    visibility: 'public' as PostVisibility,
    tags: ['개인레슨', '강사추천', '린디합', '찰스턴'],
    keywords: ['개인레슨', '강사', '린디합', '찰스턴', '초보자']
  },
  {
    title: '🎉 신규 회원 환영합니다!',
    content: `스윙 커뮤니티에 새로 가입하신 분들을 환영합니다! 🤗

이곳에서는:
- 스윙댄스 관련 정보 공유
- 정기모임 및 이벤트 안내
- 댄스용품 거래
- 질문 및 팁 공유

커뮤니티 이용 가이드:
1. 서로 존중하는 댓글 문화
2. 카테고리에 맞는 게시글 작성
3. 개인정보 보호 주의
4. 스팸/광고 금지

궁금한 점이 있으시면 언제든 댓글로 문의해주세요!
함께 즐거운 스윙댄스 문화를 만들어가요! 💃🕺`,
    category: 'general' as PostCategory,
    visibility: 'public' as PostVisibility,
    tags: ['환영', '가이드', '커뮤니티'],
    keywords: ['신규회원', '환영', '가이드', '커뮤니티'],
    isPinned: true
  }
]

// 샘플 댓글 데이터
const sampleComments = [
  {
    postIndex: 0, // 강남 정기모임 게시글
    comments: [
      {
        content: '와! 정말 좋은 정보네요. 다음 주 화요일에 참석하고 싶은데 사전 등록이 필요한가요?',
        authorIndex: 1
      },
      {
        content: '매주 참석하고 있는데 정말 재미있어요! 초보자도 편하게 올 수 있습니다 👍',
        authorIndex: 2
      },
      {
        content: '주차 공간은 있나요? 차로 가려고 하는데...',
        authorIndex: 3
      }
    ]
  },
  {
    postIndex: 1, // 린디합 기본기 질문
    comments: [
      {
        content: '저도 초보 때 같은 고민을 했어요! Rock Step에서는 무게중심을 발 앞쪽에 두지 말고 가운데에 두는 게 중요해요.',
        authorIndex: 4
      },
      {
        content: '집에서 연습할 때는 거울 앞에서 천천히 하면서 무게중심 이동을 의식해보세요. 메트로놈 앱으로 템포 조절하는 것도 도움됩니다!',
        authorIndex: 0
      }
    ]
  },
  {
    postIndex: 2, // Swing Seoul 리뷰
    comments: [
      {
        content: '저도 지난달에 가봤는데 정말 좋더라고요! 라이브 밴드 언제 나오는지 아시나요?',
        authorIndex: 1
      },
      {
        content: '라이브 밴드는 매주 토요일 밤 9시부터 나와요! 미리 예약하시는 걸 추천드려요.',
        authorIndex: 2
      }
    ]
  },
  {
    postIndex: 3, // 댄스화 판매
    comments: [
      {
        content: '관심 있어요! 혹시 실제 착용 사진 좀 더 보내주실 수 있나요?',
        authorIndex: 4
      },
      {
        content: '@정찰스턴 쪽지 보내드렸습니다! 확인해주세요 😊',
        authorIndex: 0
      }
    ]
  }
]

/**
 * 게시글 시드 데이터 생성
 */
async function seedPosts() {
  console.log('🌱 게시글 시드 데이터 생성 중...')

  const createdPosts: string[] = []

  for (let i = 0; i < samplePosts.length; i++) {
    const postData = samplePosts[i]
    const author = sampleUsers[i % sampleUsers.length]

    try {
      const docData = {
        title: postData.title,
        content: postData.content,
        category: postData.category,
        status: 'active',
        visibility: postData.visibility || 'public',

        // 선택적 정보
        eventInfo: postData.eventInfo,
        marketplaceInfo: postData.marketplaceInfo,
        location: postData.eventInfo?.location || postData.marketplaceInfo?.location,

        // 첨부파일
        attachments: [],
        images: [],

        // 태그 및 검색
        tags: postData.tags || [],
        keywords: postData.keywords || [],

        // 통계
        stats: {
          views: Math.floor(Math.random() * 100) + 10,
          likes: Math.floor(Math.random() * 20) + 1,
          comments: 0, // 댓글 생성 시 업데이트
          shares: Math.floor(Math.random() * 5),
          reports: 0,
          lastActivity: serverTimestamp()
        },

        // 메타데이터
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          authorId: author.id,
          authorName: author.name,
          authorProfileUrl: null
        },

        // 특별 플래그
        isPinned: postData.isPinned || false,
        isFeatured: postData.isFeatured || false,

        // 지역
        region: postData.eventInfo?.location?.region ||
                postData.marketplaceInfo?.location?.region ||
                '서울'
      }

      const docRef = await addDoc(collection(db, 'posts'), docData)
      createdPosts.push(docRef.id)

      console.log(`✅ 게시글 생성됨: ${postData.title} (ID: ${docRef.id})`)

    } catch (error) {
      console.error(`❌ 게시글 생성 실패: ${postData.title}`, error)
    }
  }

  return createdPosts
}

/**
 * 댓글 시드 데이터 생성
 */
async function seedComments(postIds: string[]) {
  console.log('💬 댓글 시드 데이터 생성 중...')

  for (const commentGroup of sampleComments) {
    const postId = postIds[commentGroup.postIndex]
    if (!postId) continue

    for (const commentData of commentGroup.comments) {
      const author = sampleUsers[commentData.authorIndex]

      try {
        const docData = {
          postId,
          content: commentData.content,

          // 계층 구조 (현재는 원댓글만)
          parentId: null,
          depth: 0,
          rootId: null,

          // 작성자
          authorId: author.id,
          authorName: author.name,
          authorProfileUrl: null,

          // 상태
          status: 'active',

          // 통계
          likes: Math.floor(Math.random() * 10),
          reports: 0,

          // 메타데이터
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ipAddress: null,
          editHistory: []
        }

        const docRef = await addDoc(collection(db, 'comments'), docData)

        console.log(`✅ 댓글 생성됨: ${commentData.content.substring(0, 20)}... (ID: ${docRef.id})`)

      } catch (error) {
        console.error('❌ 댓글 생성 실패:', error)
      }
    }
  }
}

/**
 * 사용자 시드 데이터 생성 (기본 프로필)
 */
async function seedUsers() {
  console.log('👥 사용자 시드 데이터 생성 중...')

  for (const user of sampleUsers) {
    try {
      const docData = {
        email: user.email,
        displayName: user.name,
        photoURL: null,
        provider: 'email',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        profile: {
          nickname: user.name,
          danceLevel: 'beginner',
          location: '서울',
          bio: `안녕하세요! ${user.name}입니다. 스윙댄스를 사랑하는 초보자예요! 🕺💃`,
          interests: ['린디합', '찰스턴', '스윙음악'],
          socialLinks: {}
        },
        role: 'user' // 기본 사용자 권한
      }

      // 사용자 ID를 직접 지정하여 문서 생성
      await addDoc(collection(db, 'users'), docData)

      console.log(`✅ 사용자 생성됨: ${user.name}`)

    } catch (error) {
      console.error(`❌ 사용자 생성 실패: ${user.name}`, error)
    }
  }
}

/**
 * 커뮤니티 통계 초기화
 */
async function seedCommunityStats() {
  console.log('📊 커뮤니티 통계 초기화 중...')

  try {
    const statsData = {
      totalPosts: samplePosts.length,
      totalComments: sampleComments.reduce((sum, group) => sum + group.comments.length, 0),
      totalUsers: sampleUsers.length,
      postsToday: Math.floor(samplePosts.length / 2),
      commentsToday: Math.floor(sampleComments.length),
      topCategories: [
        { category: 'general', count: 1 },
        { category: 'event', count: 1 },
        { category: 'qna', count: 1 },
        { category: 'review', count: 1 },
        { category: 'marketplace', count: 1 },
        { category: 'lesson', count: 1 }
      ],
      activeUsers: sampleUsers.length,
      timestamp: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'communityStats'), statsData)

    console.log(`✅ 커뮤니티 통계 생성됨 (ID: ${docRef.id})`)

  } catch (error) {
    console.error('❌ 커뮤니티 통계 생성 실패:', error)
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 커뮤니티 시드 데이터 생성을 시작합니다...\n')

  try {
    // 환경 변수 확인
    if (!firebaseConfig.projectId || firebaseConfig.projectId === 'demo-project') {
      throw new Error('Firebase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.')
    }

    console.log(`📱 프로젝트: ${firebaseConfig.projectId}\n`)

    // 1. 사용자 생성
    await seedUsers()
    console.log('')

    // 2. 게시글 생성
    const postIds = await seedPosts()
    console.log('')

    // 3. 댓글 생성
    await seedComments(postIds)
    console.log('')

    // 4. 커뮤니티 통계 초기화
    await seedCommunityStats()
    console.log('')

    console.log('🎉 시드 데이터 생성이 완료되었습니다!')
    console.log(`✅ 사용자: ${sampleUsers.length}명`)
    console.log(`✅ 게시글: ${postIds.length}개`)
    console.log(`✅ 댓글: ${sampleComments.reduce((sum, group) => sum + group.comments.length, 0)}개`)
    console.log(`✅ 통계: 1개`)

  } catch (error) {
    console.error('💥 시드 데이터 생성 중 오류 발생:', error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 치명적 오류:', error)
      process.exit(1)
    })
}