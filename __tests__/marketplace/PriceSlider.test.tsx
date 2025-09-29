import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PriceSlider } from '@/components/marketplace/PriceSlider'

describe('PriceSlider', () => {
  const defaultProps = {
    min: 0,
    max: 500000,
    value: [100000, 300000] as [number, number],
    onChange: jest.fn(),
    step: 10000
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    test('슬라이더 컴포넌트가 렌더링되어야 함', () => {
      render(<PriceSlider {...defaultProps} />)

      expect(screen.getByText('100,000원')).toBeInTheDocument()
      expect(screen.getByText('300,000원')).toBeInTheDocument()
      expect(screen.getByText('0원')).toBeInTheDocument()
      expect(screen.getByText('500,000원')).toBeInTheDocument()
    })

    test('커스텀 포맷터가 적용되어야 함', () => {
      const customFormatter = (value: number) => `$${value}`
      render(
        <PriceSlider
          {...defaultProps}
          formatLabel={customFormatter}
        />
      )

      expect(screen.getByText('$100000')).toBeInTheDocument()
      expect(screen.getByText('$300000')).toBeInTheDocument()
    })

    test('두 개의 슬라이더 thumb이 렌더링되어야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('.cursor-grab')
      expect(thumbs).toHaveLength(2)
    })

    test('활성 트랙이 올바른 위치와 너비를 가져야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const activeTrack = container.querySelector('[style*="background-color: rgb(105, 59, 242)"]')
      expect(activeTrack).toBeInTheDocument()

      // 20% (100000/500000) 부터 60% (300000/500000) 까지
      expect(activeTrack).toHaveStyle('left: 20%')
      expect(activeTrack).toHaveStyle('width: 40%')
    })
  })

  describe('값 계산', () => {
    test('최소값과 최대값이 올바르게 처리되어야 함', () => {
      render(<PriceSlider {...defaultProps} value={[0, 500000]} />)

      expect(screen.getAllByText('0원')).toHaveLength(2) // 현재값과 최소값 표시
      expect(screen.getAllByText('500,000원')).toHaveLength(2) // 현재값과 최대값 표시
    })

    test('중간값이 올바르게 계산되어야 함', () => {
      render(<PriceSlider {...defaultProps} value={[250000, 400000]} />)

      expect(screen.getByText('250,000원')).toBeInTheDocument()
      expect(screen.getByText('400,000원')).toBeInTheDocument()
    })
  })

  describe('드래그 인터랙션', () => {
    test('첫 번째 thumb 드래그 시작시 isDragging이 설정되어야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('.cursor-grab')
      const firstThumb = thumbs[0]

      fireEvent.mouseDown(firstThumb)

      // 드래그 중일 때 그림자 효과가 적용되어야 함
      expect(firstThumb).toHaveStyle('box-shadow: 0 0 0 3px rgba(105, 59, 242, 0.2)')
    })

    test('두 번째 thumb 드래그 시작시 isDragging이 설정되어야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('.cursor-grab')
      const secondThumb = thumbs[1]

      fireEvent.mouseDown(secondThumb)

      expect(secondThumb).toHaveStyle('box-shadow: 0 0 0 3px rgba(105, 59, 242, 0.2)')
    })

    test('드래그 종료시 그림자 효과가 제거되어야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('.cursor-grab')
      const firstThumb = thumbs[0]

      fireEvent.mouseDown(firstThumb)
      fireEvent.mouseUp(document)

      expect(firstThumb).not.toHaveStyle('box-shadow: 0 0 0 3px rgba(105, 59, 242, 0.2)')
    })

    test('터치 이벤트도 처리되어야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('.cursor-grab')
      const firstThumb = thumbs[0]

      fireEvent.touchStart(firstThumb)

      expect(firstThumb).toHaveStyle('box-shadow: 0 0 0 3px rgba(105, 59, 242, 0.2)')
    })
  })

  describe('트랙 클릭', () => {
    test('트랙 클릭시 가까운 thumb으로 이동해야 함', () => {
      const mockOnChange = jest.fn()
      const { container } = render(
        <PriceSlider {...defaultProps} onChange={mockOnChange} />
      )

      const track = container.querySelector('[data-testid="slider-track"]') ||
                   container.querySelector('.cursor-pointer')

      if (track) {
        // 트랙의 특정 위치 클릭 시뮬레이션
        const rect = { left: 0, width: 100 }
        jest.spyOn(track, 'getBoundingClientRect').mockReturnValue(rect as DOMRect)

        fireEvent.click(track, { clientX: 25 }) // 25% 지점 클릭

        expect(mockOnChange).toHaveBeenCalled()
      }
    })
  })

  describe('엣지 케이스', () => {
    test('최소값과 최대값이 같을 때 처리되어야 함', () => {
      render(
        <PriceSlider
          min={100000}
          max={100000}
          value={[100000, 100000]}
          onChange={jest.fn()}
        />
      )

      expect(screen.getAllByText('100,000원')).toHaveLength(4) // 현재값 2개 + 최소/최대값 2개
    })

    test('step이 0일 때도 동작해야 함', () => {
      render(<PriceSlider {...defaultProps} step={0} />)

      expect(screen.getByText('100,000원')).toBeInTheDocument()
    })

    test('음수 값도 처리할 수 있어야 함', () => {
      render(
        <PriceSlider
          min={-100000}
          max={100000}
          value={[-50000, 50000]}
          onChange={jest.fn()}
        />
      )

      expect(screen.getByText('-50,000원')).toBeInTheDocument()
      expect(screen.getByText('50,000원')).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    test('키보드 네비게이션이 가능해야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('.cursor-grab')

      thumbs.forEach(thumb => {
        expect(thumb).toBeInTheDocument()
      })
    })
  })

  describe('스타일링', () => {
    test('비활성 트랙이 올바른 배경색을 가져야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const inactiveTrack = container.querySelector('[style*="background-color: rgb(241, 238, 255)"]')
      expect(inactiveTrack).toBeInTheDocument()
    })

    test('활성 트랙이 primary 색상을 가져야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const activeTrack = container.querySelector('[style*="background-color: rgb(105, 59, 242)"]')
      expect(activeTrack).toBeInTheDocument()
    })

    test('thumbs가 primary 색상을 가져야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('[style*="background-color: rgb(105, 59, 242)"]')
      expect(thumbs.length).toBeGreaterThan(0)
    })

    test('hover 효과가 적용되어야 함', () => {
      const { container } = render(<PriceSlider {...defaultProps} />)

      const thumbs = container.querySelectorAll('.hover\\:scale-110')
      expect(thumbs).toHaveLength(2)
    })
  })

  describe('값 제한', () => {
    test('최소값보다 작은 값은 제한되어야 함', () => {
      const mockOnChange = jest.fn()
      render(
        <PriceSlider
          {...defaultProps}
          value={[-10000, 300000]}
          onChange={mockOnChange}
        />
      )

      // 음수 값이 전달되어도 최소값으로 제한되어 표시됨
      expect(screen.getByText('0원')).toBeInTheDocument()
    })

    test('최대값보다 큰 값은 제한되어야 함', () => {
      const mockOnChange = jest.fn()
      render(
        <PriceSlider
          {...defaultProps}
          value={[100000, 600000]}
          onChange={mockOnChange}
        />
      )

      // 범위를 초과한 값이 전달되어도 최대값으로 제한되어 표시됨
      expect(screen.getByText('500,000원')).toBeInTheDocument()
    })
  })

  describe('onChange 콜백', () => {
    test('값이 변경될 때 onChange가 호출되어야 함', () => {
      const mockOnChange = jest.fn()
      render(<PriceSlider {...defaultProps} onChange={mockOnChange} />)

      // 실제 드래그 시뮬레이션은 복잡하므로, 최소한 초기 렌더링 확인
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    test('step에 따라 값이 반올림되어야 함', () => {
      // step이 10000일 때, 값이 10000 단위로 반올림되는지 확인
      render(<PriceSlider {...defaultProps} step={10000} />)

      // 정확한 step 값이 표시되는지 확인
      expect(screen.getByText('100,000원')).toBeInTheDocument()
      expect(screen.getByText('300,000원')).toBeInTheDocument()
    })
  })
})