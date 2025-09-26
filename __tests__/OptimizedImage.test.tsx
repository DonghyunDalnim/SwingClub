import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

// Mock Next.js Image component
jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ src, alt, onLoad, onError, width, height, fill, className, ...props }: any) => {
    const handleLoad = () => {
      if (onLoad) onLoad()
    }

    const handleError = () => {
      if (onError) onError()
    }

    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        data-testid="next-image"
        data-fill={fill}
        {...props}
      />
    )
  }
})

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image'
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<OptimizedImage {...defaultProps} />)

    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', defaultProps.src)
    expect(image).toHaveAttribute('alt', defaultProps.alt)
  })

  it('shows placeholder when no src is provided', () => {
    render(<OptimizedImage alt="No image" />)

    expect(screen.getByText('📷')).toBeInTheDocument()
    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('applies correct aspect ratio classes', () => {
    const { rerender } = render(
      <OptimizedImage {...defaultProps} ratio="hero" />
    )

    let container = screen.getByTestId('next-image').parentElement
    expect(container).toHaveClass('aspect-video')

    rerender(<OptimizedImage {...defaultProps} ratio="card" />)
    container = screen.getByTestId('next-image').parentElement
    expect(container).toHaveClass('aspect-[4/3]')

    rerender(<OptimizedImage {...defaultProps} ratio="avatar" />)
    container = screen.getByTestId('next-image').parentElement
    expect(container).toHaveClass('aspect-square')

    rerender(<OptimizedImage {...defaultProps} ratio="banner" />)
    container = screen.getByTestId('next-image').parentElement
    expect(container).toHaveClass('aspect-[3/1]')
  })

  it('applies custom className', () => {
    const customClass = 'custom-image-class'
    render(<OptimizedImage {...defaultProps} className={customClass} />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveClass(customClass)
  })

  it('handles fill prop correctly', () => {
    render(<OptimizedImage {...defaultProps} fill />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('data-fill', 'true')
  })

  it('shows loading state initially', async () => {
    render(<OptimizedImage {...defaultProps} />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveClass('opacity-0')

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByText('로딩중...')).toBeInTheDocument()
    })
  })

  it('shows placeholder on error', async () => {
    const onError = jest.fn()

    render(<OptimizedImage {...defaultProps} onError={onError} />)

    const image = screen.getByTestId('next-image')

    // Trigger error
    image.dispatchEvent(new Event('error'))

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
      expect(screen.getByText('📷')).toBeInTheDocument()
      expect(screen.getByText(defaultProps.alt)).toBeInTheDocument()
    })
  })

  it('calls onLoad callback when image loads', async () => {
    const onLoad = jest.fn()

    render(<OptimizedImage {...defaultProps} onLoad={onLoad} />)

    const image = screen.getByTestId('next-image')

    // Trigger load
    image.dispatchEvent(new Event('load'))

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled()
    })
  })

  it('sets correct default dimensions for different ratios', () => {
    const { rerender } = render(
      <OptimizedImage {...defaultProps} ratio="hero" />
    )

    let image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('width', '800')
    expect(image).toHaveAttribute('height', '450')

    rerender(<OptimizedImage {...defaultProps} ratio="banner" />)
    image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('width', '800')
    expect(image).toHaveAttribute('height', '267')

    rerender(<OptimizedImage {...defaultProps} ratio="card" />)
    image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('width', '800')
    expect(image).toHaveAttribute('height', '600')
  })

  it('accepts custom width and height', () => {
    const customWidth = 400
    const customHeight = 300

    render(
      <OptimizedImage
        {...defaultProps}
        width={customWidth}
        height={customHeight}
      />
    )

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('width', customWidth.toString())
    expect(image).toHaveAttribute('height', customHeight.toString())
  })

  it('sets priority prop correctly', () => {
    render(<OptimizedImage {...defaultProps} priority />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('priority')
  })

  it('uses Soomgo placeholder colors', () => {
    render(<OptimizedImage alt="Test placeholder" />)

    const placeholderDiv = screen.getByText('Test placeholder').parentElement?.parentElement
    expect(placeholderDiv).toHaveStyle({
      backgroundColor: '#EFF1F5'
    })

    const text = screen.getByText('Test placeholder')
    expect(text).toHaveStyle({
      color: '#6A7685'
    })
  })

  it('applies 8px border radius', () => {
    render(<OptimizedImage {...defaultProps} />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveClass('rounded-lg')
    expect(image).toHaveStyle({
      borderRadius: '8px'
    })
  })
})