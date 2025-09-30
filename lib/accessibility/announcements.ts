/**
 * ARIA-live 영역을 통한 동적 콘텐츠 알림 시스템
 * 스크린 리더 사용자에게 상태 변화를 실시간으로 알림
 */

export type AnnouncementType = 'polite' | 'assertive'

export interface AnnouncementOptions {
  type?: AnnouncementType
  timeout?: number
  clearPrevious?: boolean
}

/**
 * 스크린 리더에게 메시지를 알림
 * @param message 알릴 메시지
 * @param options 알림 옵션
 */
export function announceToScreenReader(
  message: string,
  options: AnnouncementOptions = {}
): void {
  const {
    type = 'polite',
    timeout = 3000,
    clearPrevious = true
  } = options

  if (typeof window === 'undefined') return

  const regionId = type === 'assertive' ? 'aria-live-assertive' : 'aria-live-region'
  const region = document.getElementById(regionId)

  if (!region) {
    console.warn(`ARIA-live region with id "${regionId}" not found`)
    return
  }

  // 이전 메시지 클리어 (선택적)
  if (clearPrevious) {
    region.textContent = ''
  }

  // 새 메시지 설정
  setTimeout(() => {
    region.textContent = message
  }, 100) // 약간의 지연으로 스크린 리더가 인식할 수 있도록

  // 자동 클리어 (선택적)
  if (timeout > 0) {
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = ''
      }
    }, timeout)
  }
}

/**
 * 폼 관련 상태 변화 알림
 */
export const formAnnouncements = {
  /**
   * 폼 제출 성공 알림
   */
  submitSuccess: (formName: string = '폼') => {
    announceToScreenReader(`${formName}이 성공적으로 제출되었습니다.`, {
      type: 'assertive'
    })
  },

  /**
   * 폼 제출 실패 알림
   */
  submitError: (error: string = '오류가 발생했습니다') => {
    announceToScreenReader(`폼 제출 실패: ${error}`, {
      type: 'assertive'
    })
  },

  /**
   * 폼 검증 오류 알림
   */
  validationError: (fieldName: string, error: string) => {
    announceToScreenReader(`${fieldName} 입력 오류: ${error}`, {
      type: 'assertive'
    })
  },

  /**
   * 필드 값 변경 알림 (실시간 검증용)
   */
  fieldChanged: (fieldName: string, isValid: boolean) => {
    const message = isValid
      ? `${fieldName} 입력이 올바릅니다.`
      : `${fieldName} 입력을 확인해주세요.`

    announceToScreenReader(message, {
      type: 'polite',
      timeout: 2000
    })
  }
}

/**
 * 탐색 관련 상태 변화 알림
 */
export const navigationAnnouncements = {
  /**
   * 페이지 로딩 알림
   */
  pageLoading: (pageName: string) => {
    announceToScreenReader(`${pageName} 페이지를 불러오는 중입니다.`, {
      type: 'polite'
    })
  },

  /**
   * 페이지 로딩 완료 알림
   */
  pageLoaded: (pageName: string) => {
    announceToScreenReader(`${pageName} 페이지가 로딩되었습니다.`, {
      type: 'polite'
    })
  },

  /**
   * 탐색 오류 알림
   */
  navigationError: (error: string) => {
    announceToScreenReader(`탐색 오류: ${error}`, {
      type: 'assertive'
    })
  }
}

/**
 * 데이터 관련 상태 변화 알림
 */
export const dataAnnouncements = {
  /**
   * 데이터 로딩 시작 알림
   */
  loadingStart: (dataType: string = '데이터') => {
    announceToScreenReader(`${dataType}를 불러오는 중입니다.`, {
      type: 'polite'
    })
  },

  /**
   * 데이터 로딩 완료 알림
   */
  loadingComplete: (dataType: string, count?: number) => {
    const message = count !== undefined
      ? `${dataType} ${count}개를 불러왔습니다.`
      : `${dataType} 로딩이 완료되었습니다.`

    announceToScreenReader(message, {
      type: 'polite'
    })
  },

  /**
   * 데이터 생성/추가 알림
   */
  dataCreated: (dataType: string, name?: string) => {
    const message = name
      ? `${dataType} "${name}"이 생성되었습니다.`
      : `새 ${dataType}이 생성되었습니다.`

    announceToScreenReader(message, {
      type: 'assertive'
    })
  },

  /**
   * 데이터 업데이트 알림
   */
  dataUpdated: (dataType: string, name?: string) => {
    const message = name
      ? `${dataType} "${name}"이 업데이트되었습니다.`
      : `${dataType}이 업데이트되었습니다.`

    announceToScreenReader(message, {
      type: 'polite'
    })
  },

  /**
   * 데이터 삭제 알림
   */
  dataDeleted: (dataType: string, name?: string) => {
    const message = name
      ? `${dataType} "${name}"이 삭제되었습니다.`
      : `${dataType}이 삭제되었습니다.`

    announceToScreenReader(message, {
      type: 'assertive'
    })
  }
}

/**
 * 커뮤니티 관련 상태 변화 알림
 */
export const communityAnnouncements = {
  /**
   * 좋아요 상태 변화 알림
   */
  likeChanged: (isLiked: boolean, totalLikes: number) => {
    const action = isLiked ? '추가' : '취소'
    announceToScreenReader(`좋아요 ${action}됨. 현재 좋아요 ${totalLikes}개`, {
      type: 'polite'
    })
  },

  /**
   * 댓글 작성 알림
   */
  commentAdded: (commenterName?: string) => {
    const message = commenterName
      ? `${commenterName}님이 댓글을 작성했습니다.`
      : '새 댓글이 작성되었습니다.'

    announceToScreenReader(message, {
      type: 'polite'
    })
  },

  /**
   * 새 게시글 알림
   */
  newPost: (authorName?: string, title?: string) => {
    let message = '새 게시글이 등록되었습니다.'

    if (authorName && title) {
      message = `${authorName}님이 "${title}" 게시글을 등록했습니다.`
    } else if (authorName) {
      message = `${authorName}님이 새 게시글을 등록했습니다.`
    }

    announceToScreenReader(message, {
      type: 'polite'
    })
  }
}

/**
 * 마켓플레이스 관련 상태 변화 알림
 */
export const marketplaceAnnouncements = {
  /**
   * 상품 찜하기 상태 변화 알림
   */
  favoriteChanged: (isFavorited: boolean, productName: string) => {
    const action = isFavorited ? '추가' : '제거'
    announceToScreenReader(`"${productName}" 상품을 찜 목록에서 ${action}했습니다.`, {
      type: 'polite'
    })
  },

  /**
   * 거래 문의 알림
   */
  inquirySent: (productName: string) => {
    announceToScreenReader(`"${productName}" 상품에 대한 문의가 전송되었습니다.`, {
      type: 'assertive'
    })
  },

  /**
   * 필터 적용 알림
   */
  filterApplied: (resultCount: number) => {
    announceToScreenReader(`필터가 적용되었습니다. ${resultCount}개의 상품이 검색되었습니다.`, {
      type: 'polite'
    })
  }
}

/**
 * React 컴포넌트용 커스텀 훅
 */
export function useAnnouncements() {
  return {
    announce: announceToScreenReader,
    form: formAnnouncements,
    navigation: navigationAnnouncements,
    data: dataAnnouncements,
    community: communityAnnouncements,
    marketplace: marketplaceAnnouncements
  }
}