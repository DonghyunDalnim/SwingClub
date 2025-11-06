'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/core/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/Card'
import { Badge } from '@/components/core/Badge'
import Typography from '@/components/core/Typography'
import { theme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { DanceStyle } from '@/lib/types/auth'

// 사용 가능한 댄스 스타일 목록
const AVAILABLE_DANCE_STYLES = [
  'Lindy Hop',
  'Charleston',
  'Balboa',
  'Shag',
  'Blues',
  'Collegiate Shag',
  'St. Louis Shag',
  'Slow Drag',
  'Authentic Jazz',
  'Solo Jazz'
] as const

const MAX_DANCE_STYLES = 10

export interface DanceStyleSelectorProps {
  /**
   * 현재 선택된 댄스 스타일 목록
   */
  value: DanceStyle[]
  /**
   * 댄스 스타일 변경 시 호출되는 콜백
   */
  onChange: (danceStyles: DanceStyle[]) => void
  /**
   * 컴포넌트 비활성화 여부
   */
  disabled?: boolean
  /**
   * 접근성을 위한 레이블
   */
  'aria-label'?: string
}

/**
 * 댄스 스타일 선택 컴포넌트
 *
 * 프로필 편집 페이지에서 사용자가 댄스 스타일을 선택하고 관리할 수 있습니다.
 * - 최대 10개의 댄스 스타일 선택 가능
 * - 각 스타일에 대해 1-5 레벨 설정 가능
 * - 숨고 디자인 시스템 준수
 * - 접근성 (ARIA, 키보드 네비게이션) 지원
 *
 * @example
 * ```tsx
 * <DanceStyleSelector
 *   value={userDanceStyles}
 *   onChange={setUserDanceStyles}
 * />
 * ```
 */
export const DanceStyleSelector = React.memo<DanceStyleSelectorProps>(
  ({ value, onChange, disabled = false, 'aria-label': ariaLabel }) => {
    const [showAvailable, setShowAvailable] = useState(false)

    // 선택된 댄스 스타일 이름 목록
    const selectedNames = value.map(ds => ds.name)

    // 선택 가능한 댄스 스타일 (아직 선택되지 않은 것들)
    const availableStyles = AVAILABLE_DANCE_STYLES.filter(
      name => !selectedNames.includes(name)
    )

    // 댄스 스타일 추가
    const handleAddStyle = useCallback(
      (styleName: string) => {
        if (value.length >= MAX_DANCE_STYLES) {
          return
        }

        const newStyle: DanceStyle = {
          name: styleName,
          level: 1 // 기본 레벨 1
        }

        onChange([...value, newStyle])
        setShowAvailable(false)
      },
      [value, onChange]
    )

    // 댄스 스타일 제거
    const handleRemoveStyle = useCallback(
      (styleName: string) => {
        onChange(value.filter(ds => ds.name !== styleName))
      },
      [value, onChange]
    )

    // 레벨 변경
    const handleLevelChange = useCallback(
      (styleName: string, newLevel: number) => {
        onChange(
          value.map(ds =>
            ds.name === styleName ? { ...ds, level: newLevel } : ds
          )
        )
      },
      [value, onChange]
    )

    const canAddMore = value.length < MAX_DANCE_STYLES
    const hasAvailableStyles = availableStyles.length > 0

    return (
      <div
        className="dance-style-selector"
        aria-label={ariaLabel || '댄스 스타일 선택'}
        role="region"
      >
        {/* 헤더 */}
        <div className="selector-header">
          <div>
            <Typography variant="h4" as="h3">
              댄스 스타일
            </Typography>
            <Typography
              variant="small"
              as="p"
              className="selector-description"
              style={{ color: theme.colors.neutral.medium }}
            >
              최대 {MAX_DANCE_STYLES}개까지 선택할 수 있습니다 ({value.length}/
              {MAX_DANCE_STYLES})
            </Typography>
          </div>

          {canAddMore && hasAvailableStyles && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAvailable(!showAvailable)}
              disabled={disabled}
              aria-expanded={showAvailable}
              aria-controls="available-styles-list"
            >
              {showAvailable ? '닫기' : '+ 스타일 추가'}
            </Button>
          )}

          {!canAddMore && (
            <Badge variant="secondary">
              최대 개수 도달
            </Badge>
          )}
        </div>

        {/* 사용 가능한 스타일 목록 (펼쳤을 때) */}
        {showAvailable && canAddMore && (
          <Card variant="default" className="available-styles-card">
            <CardContent>
              <div
                id="available-styles-list"
                className="available-styles-grid"
                role="list"
                aria-label="선택 가능한 댄스 스타일"
              >
                {availableStyles.map(styleName => (
                  <button
                    key={styleName}
                    onClick={() => handleAddStyle(styleName)}
                    className="available-style-button"
                    disabled={disabled}
                    type="button"
                    role="listitem"
                    aria-label={`${styleName} 추가`}
                  >
                    <span className="style-icon">+</span>
                    <span className="style-name">{styleName}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 스타일 목록 */}
        {value.length > 0 ? (
          <div
            className="selected-styles-list"
            role="list"
            aria-label="선택된 댄스 스타일"
          >
            {value.map(danceStyle => (
              <Card
                key={danceStyle.name}
                variant="default"
                className="selected-style-card"
                role="listitem"
              >
                <CardContent>
                  <div className="style-content">
                    {/* 스타일 정보 */}
                    <div className="style-info">
                      <Typography variant="h4" as="h4">
                        {danceStyle.name}
                      </Typography>

                      {/* 레벨 슬라이더 */}
                      <div className="level-control">
                        <label
                          htmlFor={`level-${danceStyle.name}`}
                          className="level-label"
                        >
                          <Typography
                            variant="small"
                            as="span"
                            style={{ color: theme.colors.neutral.medium }}
                          >
                            레벨: {danceStyle.level}
                          </Typography>
                        </label>
                        <input
                          id={`level-${danceStyle.name}`}
                          type="range"
                          min="1"
                          max="5"
                          value={danceStyle.level}
                          onChange={e =>
                            handleLevelChange(
                              danceStyle.name,
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="level-slider"
                          disabled={disabled}
                          aria-label={`${danceStyle.name} 레벨 선택`}
                          aria-valuemin={1}
                          aria-valuemax={5}
                          aria-valuenow={danceStyle.level}
                          aria-valuetext={`레벨 ${danceStyle.level}`}
                        />

                        {/* 레벨 표시 (별점) */}
                        <div className="level-stars" aria-hidden="true">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={cn(
                                'star',
                                star <= danceStyle.level && 'star-filled'
                              )}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 제거 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStyle(danceStyle.name)}
                      disabled={disabled}
                      aria-label={`${danceStyle.name} 제거`}
                      className="remove-button"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="default" className="empty-state-card">
            <CardContent>
              <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">
                  🎵
                </div>
                <Typography variant="body" as="p" className="empty-text">
                  아직 선택된 댄스 스타일이 없습니다
                </Typography>
                <Typography
                  variant="small"
                  as="p"
                  style={{ color: theme.colors.neutral.medium }}
                >
                  스타일 추가 버튼을 눌러 댄스 스타일을 추가해보세요
                </Typography>
              </div>
            </CardContent>
          </Card>
        )}

        <style jsx>{`
          .dance-style-selector {
            width: 100%;
          }

          .selector-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            gap: 16px;
          }

          .selector-description {
            margin-top: 4px;
          }

          /* 사용 가능한 스타일 카드 */
          .available-styles-card {
            margin-bottom: 16px;
            border: 2px dashed ${theme.colors.primary.main};
            background: ${theme.colors.secondary.light};
          }

          .available-styles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 8px;
          }

          .available-style-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 12px;
            background: ${theme.colors.white};
            border: 1px solid ${theme.colors.neutral.lightest};
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: ${theme.typography.fontFamily.primary};
          }

          .available-style-button:hover:not(:disabled) {
            border-color: ${theme.colors.primary.main};
            background: ${theme.colors.secondary.light};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(105, 59, 242, 0.15);
          }

          .available-style-button:focus-visible {
            outline: 2px solid ${theme.colors.primary.main};
            outline-offset: 2px;
          }

          .available-style-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .style-icon {
            font-size: 20px;
            color: ${theme.colors.primary.main};
          }

          .style-name {
            font-size: 14px;
            font-weight: 500;
            color: ${theme.colors.neutral.darkest};
            text-align: center;
          }

          /* 선택된 스타일 목록 */
          .selected-styles-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .selected-style-card {
            transition: all 0.2s ease;
          }

          .selected-style-card:hover {
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          }

          .style-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
          }

          .style-info {
            flex: 1;
            min-width: 0;
          }

          .level-control {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 8px;
          }

          .level-label {
            display: block;
          }

          .level-slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: ${theme.colors.neutral.lightest};
            outline: none;
            -webkit-appearance: none;
          }

          .level-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${theme.colors.primary.main};
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }

          .level-slider::-webkit-slider-thumb:hover {
            background: ${theme.colors.primary.hover};
            transform: scale(1.1);
          }

          .level-slider::-webkit-slider-thumb:active {
            transform: scale(0.95);
          }

          .level-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${theme.colors.primary.main};
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }

          .level-slider::-moz-range-thumb:hover {
            background: ${theme.colors.primary.hover};
            transform: scale(1.1);
          }

          .level-slider::-moz-range-thumb:active {
            transform: scale(0.95);
          }

          .level-slider:focus-visible {
            outline: 2px solid ${theme.colors.primary.main};
            outline-offset: 2px;
          }

          .level-slider:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .level-stars {
            display: flex;
            gap: 4px;
            font-size: 20px;
          }

          .star {
            color: ${theme.colors.neutral.light};
            transition: color 0.2s ease;
          }

          .star-filled {
            color: #ffc107;
          }

          .remove-button {
            flex-shrink: 0;
            font-size: 18px;
            color: ${theme.colors.neutral.medium};
            padding: 8px;
            min-width: 36px;
          }

          .remove-button:hover {
            color: ${theme.colors.accent.red};
          }

          /* 빈 상태 */
          .empty-state-card {
            background: ${theme.colors.neutral.background};
            border: 2px dashed ${theme.colors.neutral.light};
          }

          .empty-state {
            text-align: center;
            padding: 32px 16px;
          }

          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .empty-text {
            margin-bottom: 8px;
            color: ${theme.colors.neutral.darkest};
          }

          /* 반응형 */
          @media (max-width: 768px) {
            .selector-header {
              flex-direction: column;
              align-items: stretch;
            }

            .available-styles-grid {
              grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            }

            .style-content {
              flex-direction: column;
              align-items: stretch;
            }

            .remove-button {
              align-self: flex-end;
            }
          }

          /* 모션 감소 사용자 지원 */
          @media (prefers-reduced-motion: reduce) {
            .available-style-button,
            .selected-style-card,
            .level-slider::-webkit-slider-thumb,
            .level-slider::-moz-range-thumb,
            .star {
              transition: none;
            }

            .available-style-button:hover:not(:disabled) {
              transform: none;
            }
          }
        `}</style>
      </div>
    )
  }
)

DanceStyleSelector.displayName = 'DanceStyleSelector'

export default DanceStyleSelector
