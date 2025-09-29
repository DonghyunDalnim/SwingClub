/**
 * OptimizedImage 컴포넌트 테스트
 *
 * 테스트 범위:
 * - 기본 이미지 렌더링 및 props 전달
 * - alt 텍스트 필수 속성 처리
 * - 로딩 상태 처리 및 표시
 * - 에러 상태 처리 및 표시
 * - decorative 이미지 처리 (빈 alt)
 * - onLoad/onError 콜백 처리
 * - 접근성 속성 (role, aria-label 등)
 * - Next.js Image 컴포넌트와의 통합
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import OptimizedImage, { OptimizedImageProps } from '@/components/core/OptimizedImage';

// jest-axe matcher 확장
expect.extend(toHaveNoViolations);

// Next.js Image 컴포넌트 모킹
jest.mock('next/image', () => {
  return function MockImage(props: any) {
    const { onLoad, onError, alt, className, priority, quality, placeholder, sizes, ...rest } = props;

    return (
      <img
        {...rest}
        alt={alt}
        className={className}
        onLoad={(e) => {
          // 실제 이벤트 객체와 유사한 구조로 모킹
          const syntheticEvent = {
            ...e,
            currentTarget: e.currentTarget,
            target: e.target,
          } as React.SyntheticEvent<HTMLImageElement, Event>;
          onLoad?.(syntheticEvent);
        }}
        onError={(e) => {
          const syntheticEvent = {
            ...e,
            currentTarget: e.currentTarget,
            target: e.target,
          } as React.SyntheticEvent<HTMLImageElement, Event>;
          onError?.(syntheticEvent);
        }}
        data-testid="next-image"
        data-priority={priority ? 'true' : 'false'}
        data-quality={quality}
        data-placeholder={placeholder}
        data-sizes={sizes}
      />
    );
  };
});

// cn 유틸리티 모킹
jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')
}));

// 기본 props
const defaultProps: OptimizedImageProps = {
  src: '/test-image.jpg',
  alt: 'Test image description',
  width: 300,
  height: 200,
};

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('기본 props로 정상적으로 렌더링된다', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image description');
      expect(image).toHaveAttribute('width', '300');
      expect(image).toHaveAttribute('height', '200');
    });

    it('추가 props가 Next.js Image에 전달된다', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          priority
          quality={90}
          placeholder="blur"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('data-priority', 'true');
      expect(image).toHaveAttribute('data-quality', '90');
      expect(image).toHaveAttribute('data-placeholder', 'blur');
      expect(image).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, 50vw');
    });

    it('className이 올바르게 적용된다', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          className="custom-image-class"
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveClass('custom-image-class');
      expect(image).toHaveClass('transition-opacity');
      expect(image).toHaveClass('duration-200');
    });

    it('wrapperClassName이 래퍼에 적용된다', () => {
      const { container } = render(
        <OptimizedImage
          {...defaultProps}
          wrapperClassName="custom-wrapper-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-wrapper-class');
      expect(wrapper).toHaveClass('relative');
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = React.createRef<HTMLImageElement>();
      render(<OptimizedImage {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLImageElement);
    });
  });

  describe('alt 텍스트 처리', () => {
    it('alt 속성이 필수로 요구된다', () => {
      render(<OptimizedImage {...defaultProps} alt="Required alt text" />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'Required alt text');
    });

    it('decorative가 false일 때 alt 텍스트가 그대로 사용된다', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          alt="Descriptive alt text"
          decorative={false}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('decorative가 true일 때 빈 alt 텍스트가 사용된다', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          alt="This will be ignored"
          decorative={true}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', '');
    });
  });

  describe('로딩 상태 처리', () => {
    it('초기 로딩 상태가 표시된다', () => {
      render(<OptimizedImage {...defaultProps} />);

      const loadingIndicator = screen.getByText('이미지 로딩 중...');
      expect(loadingIndicator).toBeInTheDocument();
      expect(loadingIndicator.parentElement).toHaveAttribute('aria-live', 'polite');
      expect(loadingIndicator.parentElement).toHaveAttribute('aria-label', '이미지 로딩 중...');
    });

    it('커스텀 로딩 텍스트가 표시된다', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          loadingText="Loading custom image..."
        />
      );

      const loadingIndicator = screen.getByText('Loading custom image...');
      expect(loadingIndicator).toBeInTheDocument();
      expect(loadingIndicator.parentElement).toHaveAttribute('aria-label', 'Loading custom image...');
    });

    it('로딩 중일 때 이미지가 투명하게 처리된다', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveClass('opacity-0');
    });

    it('이미지 로드 완료 시 로딩 상태가 해제된다', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');

      // 이미지 로드 이벤트 발생
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('이미지 로딩 중...')).not.toBeInTheDocument();
        expect(image).toHaveClass('opacity-100');
        expect(image).not.toHaveClass('opacity-0');
      });
    });
  });

  describe('에러 상태 처리', () => {
    it('이미지 로드 실패 시 에러 상태가 표시된다', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');

      // 이미지 에러 이벤트 발생
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('이미지를 불러올 수 없습니다')).toBeInTheDocument();
        expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
      });
    });

    it('커스텀 에러 텍스트가 표시된다', async () => {
      render(
        <OptimizedImage
          {...defaultProps}
          errorText="Custom error message"
        />
      );

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
      });
    });

    it('에러 상태에서 접근성 속성이 올바르게 설정된다', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        const errorContainer = screen.getByText('이미지를 불러올 수 없습니다').parentElement;
        expect(errorContainer).toHaveAttribute('role', 'img');
        expect(errorContainer).toHaveAttribute('aria-label', '이미지를 불러올 수 없습니다');
      });
    });

    it('decorative 이미지의 에러 상태에서 aria-label이 없다', async () => {
      render(
        <OptimizedImage
          {...defaultProps}
          decorative={true}
        />
      );

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        const errorContainer = screen.getByText('이미지를 불러올 수 없습니다').parentElement;
        expect(errorContainer).toHaveAttribute('role', 'img');
        expect(errorContainer).not.toHaveAttribute('aria-label');
      });
    });

    it('에러 상태에서 wrapperClassName이 적용된다', async () => {
      render(
        <OptimizedImage
          {...defaultProps}
          wrapperClassName="custom-error-class"
        />
      );

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        const errorContainer = screen.getByText('이미지를 불러올 수 없습니다').parentElement;
        expect(errorContainer).toHaveClass('custom-error-class');
      });
    });
  });

  describe('콜백 처리', () => {
    it('onLoad 콜백이 호출된다', async () => {
      const onLoadMock = jest.fn();
      render(
        <OptimizedImage
          {...defaultProps}
          onLoad={onLoadMock}
        />
      );

      const image = screen.getByTestId('next-image');
      fireEvent.load(image);

      await waitFor(() => {
        expect(onLoadMock).toHaveBeenCalledTimes(1);
        expect(onLoadMock).toHaveBeenCalledWith(
          expect.objectContaining({
            currentTarget: expect.any(HTMLImageElement),
            target: expect.any(HTMLImageElement),
          })
        );
      });
    });

    it('onError 콜백이 호출된다', async () => {
      const onErrorMock = jest.fn();
      render(
        <OptimizedImage
          {...defaultProps}
          onError={onErrorMock}
        />
      );

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalledTimes(1);
        expect(onErrorMock).toHaveBeenCalledWith(
          expect.objectContaining({
            currentTarget: expect.any(HTMLImageElement),
            target: expect.any(HTMLImageElement),
          })
        );
      });
    });

    it('상태 변화가 올바르게 처리된다', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');

      // 초기 로딩 상태 확인
      expect(screen.getByText('이미지 로딩 중...')).toBeInTheDocument();
      expect(image).toHaveClass('opacity-0');

      // 로드 이벤트 발생
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('이미지 로딩 중...')).not.toBeInTheDocument();
        expect(image).toHaveClass('opacity-100');
      });
    });
  });

  describe('접근성', () => {
    it('기본 상태에서 접근성 위반이 없다', async () => {
      const { container } = render(<OptimizedImage {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('로딩 상태에서 접근성 위반이 없다', async () => {
      const { container } = render(<OptimizedImage {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('에러 상태에서 접근성 위반이 없다', async () => {
      const { container } = render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('이미지를 불러올 수 없습니다')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('decorative 이미지에서 접근성 위반이 없다', async () => {
      const { container } = render(
        <OptimizedImage
          {...defaultProps}
          decorative={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('로딩 인디케이터에 적절한 aria-live 속성이 있다', () => {
      render(<OptimizedImage {...defaultProps} />);

      const loadingContainer = screen.getByText('이미지 로딩 중...').parentElement;
      expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('로딩 인디케이터에 적절한 aria-label이 있다', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          loadingText="Custom loading message"
        />
      );

      const loadingContainer = screen.getByText('Custom loading message').parentElement;
      expect(loadingContainer).toHaveAttribute('aria-label', 'Custom loading message');
    });
  });

  describe('엣지 케이스', () => {
    it('onLoad와 onError 콜백이 없어도 정상 동작한다', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');

      // 에러 없이 이벤트 발생
      expect(() => fireEvent.load(image)).not.toThrow();
      expect(() => fireEvent.error(image)).not.toThrow();
    });

    it('빈 문자열 alt 텍스트도 처리한다', () => {
      render(<OptimizedImage {...defaultProps} alt="" />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', '');
    });

    it('매우 긴 alt 텍스트도 처리한다', () => {
      const longAlt = 'A'.repeat(1000);
      render(<OptimizedImage {...defaultProps} alt={longAlt} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', longAlt);
    });

    it('특수 문자가 포함된 텍스트를 처리한다', async () => {
      const specialAlt = 'Image with "quotes" & <symbols> and 한글 characters';
      render(
        <OptimizedImage
          {...defaultProps}
          alt={specialAlt}
          loadingText="Loading with 특수문자 & symbols"
          errorText="Error with <html> & 한글"
        />
      );

      expect(screen.getByText('Loading with 특수문자 & symbols')).toBeInTheDocument();

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Error with <html> & 한글')).toBeInTheDocument();
      });
    });

    it('연속 이벤트가 올바르게 처리된다', async () => {
      const onLoadMock = jest.fn();
      const onErrorMock = jest.fn();

      render(
        <OptimizedImage
          {...defaultProps}
          onLoad={onLoadMock}
          onError={onErrorMock}
        />
      );

      const image = screen.getByTestId('next-image');

      // 연속으로 이벤트 발생
      fireEvent.load(image);
      fireEvent.error(image);

      await waitFor(() => {
        expect(onLoadMock).toHaveBeenCalledTimes(1);
        expect(onErrorMock).toHaveBeenCalledTimes(1);
      });

      // 에러 상태 확인
      expect(screen.getByText('이미지를 불러올 수 없습니다')).toBeInTheDocument();
    });

    it('className이 undefined여도 정상 동작한다', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          className={undefined}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveClass('transition-opacity');
      expect(image).toHaveClass('duration-200');
    });

    it('wrapperClassName이 undefined여도 정상 동작한다', () => {
      const { container } = render(
        <OptimizedImage
          {...defaultProps}
          wrapperClassName={undefined}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative');
    });

    it('로딩 후 에러가 발생해도 올바르게 처리된다', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');

      // 먼저 로드 완료
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('이미지 로딩 중...')).not.toBeInTheDocument();
        expect(image).toHaveClass('opacity-100');
      });

      // 이후 에러 발생 (실제로는 발생하지 않지만 상태 테스트용)
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('이미지를 불러올 수 없습니다')).toBeInTheDocument();
        expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
      });
    });
  });

  describe('displayName', () => {
    it('올바른 displayName을 가진다', () => {
      expect(OptimizedImage.displayName).toBe('OptimizedImage');
    });
  });

  describe('통합 시나리오', () => {
    it('전체 라이프사이클이 정상적으로 동작한다', async () => {
      const onLoadMock = jest.fn();
      const onErrorMock = jest.fn();

      render(
        <OptimizedImage
          {...defaultProps}
          onLoad={onLoadMock}
          onError={onErrorMock}
          loadingText="Custom loading..."
          className="custom-image"
          wrapperClassName="custom-wrapper"
        />
      );

      // 1. 초기 로딩 상태 확인
      expect(screen.getByText('Custom loading...')).toBeInTheDocument();

      const image = screen.getByTestId('next-image');
      expect(image).toHaveClass('opacity-0');
      expect(image).toHaveClass('custom-image');

      const wrapper = image.parentElement;
      expect(wrapper).toHaveClass('custom-wrapper');

      // 2. 이미지 로드 완료
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('Custom loading...')).not.toBeInTheDocument();
        expect(image).toHaveClass('opacity-100');
        expect(onLoadMock).toHaveBeenCalledTimes(1);
      });
    });

    it('decorative 이미지의 전체 라이프사이클이 정상적으로 동작한다', async () => {
      render(
        <OptimizedImage
          {...defaultProps}
          decorative={true}
          alt="This will be ignored"
        />
      );

      // 1. 초기 상태 확인
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', '');

      // 2. 에러 발생
      fireEvent.error(image);

      await waitFor(() => {
        const errorContainer = screen.getByText('이미지를 불러올 수 없습니다').parentElement;
        expect(errorContainer).toHaveAttribute('role', 'img');
        expect(errorContainer).not.toHaveAttribute('aria-label');
      });
    });

    it('모든 상태 전환이 정상적으로 동작한다', async () => {
      const { rerender } = render(<OptimizedImage {...defaultProps} />);

      // 로딩 상태
      expect(screen.getByText('이미지 로딩 중...')).toBeInTheDocument();

      let image = screen.getByTestId('next-image');
      expect(image).toHaveClass('opacity-0');

      // 로드 완료
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('이미지 로딩 중...')).not.toBeInTheDocument();
        expect(image).toHaveClass('opacity-100');
      });

      // 새로운 이미지로 재렌더링 (에러 테스트용)
      rerender(
        <OptimizedImage
          {...defaultProps}
          src="/different-image.jpg"
        />
      );

      image = screen.getByTestId('next-image');

      // 에러 발생
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('이미지를 불러올 수 없습니다')).toBeInTheDocument();
        expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
      });
    });
  });
});