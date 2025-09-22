/**
 * 로컬 이미지 업로드 API 테스트 스크립트
 */

import { uploadImage, validateImageFile } from '../lib/utils/imageUpload'

async function testUploadAPI() {
  console.log('🧪 로컬 이미지 업로드 API 테스트')
  console.log('===================================')

  // 테스트용 파일 생성 (실제로는 브라우저에서 File 객체 사용)
  const testFileContent = 'mock-image-data'
  const testFile = new File([testFileContent], 'test-image.jpg', { type: 'image/jpeg' })

  console.log('📋 테스트 파일 정보:')
  console.log(`  이름: ${testFile.name}`)
  console.log(`  타입: ${testFile.type}`)
  console.log(`  크기: ${testFile.size} bytes`)
  console.log('')

  // 파일 검증 테스트
  console.log('🔍 파일 검증 테스트:')
  const validation = validateImageFile(testFile)
  console.log(`  검증 결과: ${validation.valid ? '✅ 통과' : '❌ 실패'}`)
  if (!validation.valid) {
    console.log(`  오류: ${validation.error}`)
  }
  console.log('')

  // API 엔드포인트 확인
  console.log('🌐 API 엔드포인트 상태:')
  try {
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'GET'
    })

    if (response.ok) {
      console.log('  ✅ API 엔드포인트 응답 정상')
      const result = await response.json()
      console.log('  📁 현재 업로드된 파일:', result.files?.length || 0, '개')
    } else {
      console.log('  ❌ API 엔드포인트 오류:', response.status)
    }
  } catch (error) {
    console.log('  ❌ API 연결 실패:', error)
    console.log('  💡 개발 서버가 실행중인지 확인하세요: npm run dev')
  }

  console.log('')
  console.log('✅ 테스트 완료!')
  console.log('💡 실제 파일 업로드는 브라우저에서 테스트해주세요.')
}

// Node.js 환경에서만 실행
if (typeof window === 'undefined') {
  testUploadAPI().catch(console.error)
}