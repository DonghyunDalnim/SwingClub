/**
 * 폼 접근성 헬퍼 함수들
 * 폼 요소의 레이블 연결, 오류 처리, 접근성 속성 관리
 */

import { formAnnouncements } from './announcements'

export interface FormFieldAccessibilityProps {
  id?: string
  name?: string
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

/**
 * 폼 필드의 접근성 속성을 생성
 * @param options 필드 옵션
 * @returns ARIA 속성 객체
 */
export function createFormFieldProps(options: FormFieldAccessibilityProps) {
  const {
    id,
    name,
    label,
    description,
    error,
    required = false,
    disabled = false,
    readOnly = false
  } = options

  // 고유 ID 생성 (제공되지 않은 경우)
  const fieldId = id || `field-${name || Math.random().toString(36).substr(2, 9)}`
  const labelId = `${fieldId}-label`
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  // 설명 텍스트들을 연결
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ')

  return {
    field: {
      id: fieldId,
      name: name || fieldId,
      'aria-labelledby': labelId,
      'aria-describedby': describedBy || undefined,
      'aria-required': required,
      'aria-disabled': disabled,
      'aria-readonly': readOnly,
      'aria-invalid': !!error,
      required,
      disabled,
      readOnly
    },
    label: {
      id: labelId,
      htmlFor: fieldId
    },
    description: description ? {
      id: descriptionId,
      role: 'note'
    } : undefined,
    error: error ? {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite' as const
    } : undefined
  }
}

/**
 * 폼 그룹의 접근성 속성을 생성 (여러 관련 필드들을 묶을 때)
 * @param options 그룹 옵션
 */
export function createFormGroupProps(options: {
  id?: string
  legend?: string
  description?: string
  error?: string
  required?: boolean
}) {
  const {
    id,
    legend,
    description,
    error,
    required = false
  } = options

  const groupId = id || `group-${Math.random().toString(36).substr(2, 9)}`
  const legendId = legend ? `${groupId}-legend` : undefined
  const descriptionId = description ? `${groupId}-description` : undefined
  const errorId = error ? `${groupId}-error` : undefined

  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ')

  return {
    fieldset: {
      id: groupId,
      'aria-labelledby': legendId,
      'aria-describedby': describedBy || undefined,
      'aria-required': required,
      'aria-invalid': !!error
    },
    legend: legend ? {
      id: legendId
    } : undefined,
    description: description ? {
      id: descriptionId,
      role: 'note'
    } : undefined,
    error: error ? {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite' as const
    } : undefined
  }
}

/**
 * 검색 폼의 접근성 속성을 생성
 * @param options 검색 옵션
 */
export function createSearchProps(options: {
  id?: string
  placeholder?: string
  label?: string
  resultCount?: number
  isSearching?: boolean
}) {
  const {
    id,
    placeholder,
    label = '검색',
    resultCount,
    isSearching = false
  } = options

  const searchId = id || `search-${Math.random().toString(36).substr(2, 9)}`
  const labelId = `${searchId}-label`
  const statusId = `${searchId}-status`

  let statusText = ''
  if (isSearching) {
    statusText = '검색 중입니다...'
  } else if (resultCount !== undefined) {
    statusText = `${resultCount}개의 검색 결과`
  }

  return {
    input: {
      id: searchId,
      type: 'search',
      role: 'searchbox',
      'aria-labelledby': labelId,
      'aria-describedby': statusText ? statusId : undefined,
      placeholder,
      autoComplete: 'off'
    },
    label: {
      id: labelId,
      htmlFor: searchId
    },
    status: statusText ? {
      id: statusId,
      role: 'status',
      'aria-live': 'polite' as const,
      'aria-atomic': true
    } : undefined,
    statusText
  }
}

/**
 * 모달/다이얼로그의 접근성 속성을 생성
 * @param options 모달 옵션
 */
export function createModalProps(options: {
  id?: string
  title?: string
  description?: string
  closeLabel?: string
}) {
  const {
    id,
    title,
    description,
    closeLabel = '닫기'
  } = options

  const modalId = id || `modal-${Math.random().toString(36).substr(2, 9)}`
  const titleId = title ? `${modalId}-title` : undefined
  const descriptionId = description ? `${modalId}-description` : undefined

  return {
    modal: {
      id: modalId,
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId
    },
    title: title ? {
      id: titleId
    } : undefined,
    description: description ? {
      id: descriptionId
    } : undefined,
    closeButton: {
      'aria-label': closeLabel,
      type: 'button' as const
    }
  }
}

/**
 * 탭 인터페이스의 접근성 속성을 생성
 * @param options 탭 옵션
 */
export function createTabsProps(options: {
  id?: string
  tabs: Array<{ id: string; label: string; disabled?: boolean }>
  activeTabId: string
}) {
  const {
    id,
    tabs,
    activeTabId
  } = options

  const tabsId = id || `tabs-${Math.random().toString(36).substr(2, 9)}`
  const tabListId = `${tabsId}-list`

  return {
    tabList: {
      id: tabListId,
      role: 'tablist',
      'aria-orientation': 'horizontal' as const
    },
    tabs: tabs.map((tab) => ({
      id: `${tabsId}-tab-${tab.id}`,
      role: 'tab',
      'aria-selected': tab.id === activeTabId,
      'aria-controls': `${tabsId}-panel-${tab.id}`,
      'aria-disabled': tab.disabled,
      tabIndex: tab.id === activeTabId ? 0 : -1
    })),
    panels: tabs.map((tab) => ({
      id: `${tabsId}-panel-${tab.id}`,
      role: 'tabpanel',
      'aria-labelledby': `${tabsId}-tab-${tab.id}`,
      tabIndex: 0,
      hidden: tab.id !== activeTabId
    }))
  }
}

/**
 * 데이터 테이블의 접근성 속성을 생성
 * @param options 테이블 옵션
 */
export function createTableProps(options: {
  id?: string
  caption?: string
  summary?: string
  sortable?: boolean
  currentSort?: { column: string; direction: 'asc' | 'desc' }
}) {
  const {
    id,
    caption,
    summary,
    sortable = false,
    currentSort
  } = options

  const tableId = id || `table-${Math.random().toString(36).substr(2, 9)}`
  const captionId = caption ? `${tableId}-caption` : undefined

  return {
    table: {
      id: tableId,
      role: 'table',
      'aria-labelledby': captionId,
      'aria-describedby': summary ? `${tableId}-summary` : undefined
    },
    caption: caption ? {
      id: captionId
    } : undefined,
    summary: summary ? {
      id: `${tableId}-summary`,
      'aria-hidden': true
    } : undefined,
    createColumnHeader: (columnId: string, label: string) => ({
      role: 'columnheader',
      scope: 'col',
      'aria-sort': sortable && currentSort?.column === columnId
        ? currentSort.direction === 'asc' ? 'ascending' : 'descending'
        : sortable ? 'none' : undefined,
      tabIndex: sortable ? 0 : undefined,
      'aria-label': sortable
        ? `${label} 열, ${currentSort?.column === columnId ? '정렬됨, ' : ''}정렬하려면 클릭하세요`
        : label
    }),
    createRowHeader: (label: string) => ({
      role: 'rowheader',
      scope: 'row',
      'aria-label': label
    })
  }
}

/**
 * 폼 검증 상태 변화 시 자동 알림
 * @param fieldName 필드 이름
 * @param validation 검증 결과
 */
export function announceValidation(
  fieldName: string,
  validation: { isValid: boolean; error?: string }
) {
  if (!validation.isValid && validation.error) {
    formAnnouncements.validationError(fieldName, validation.error)
  } else if (validation.isValid) {
    formAnnouncements.fieldChanged(fieldName, true)
  }
}

/**
 * 폼 제출 상태 변화 시 자동 알림
 * @param formName 폼 이름
 * @param result 제출 결과
 */
export function announceSubmission(
  formName: string,
  result: { success: boolean; error?: string }
) {
  if (result.success) {
    formAnnouncements.submitSuccess(formName)
  } else {
    formAnnouncements.submitError(result.error)
  }
}

/**
 * React Hook Form과 통합하기 위한 유틸리티
 */
export function createReactHookFormProps(
  fieldName: string,
  fieldState: {
    error?: { message?: string }
    invalid: boolean
    isDirty: boolean
    isTouched: boolean
  },
  formOptions: Omit<FormFieldAccessibilityProps, 'name' | 'error'> = {}
) {
  return createFormFieldProps({
    ...formOptions,
    name: fieldName,
    error: fieldState.error?.message
  })
}