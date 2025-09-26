import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Avatar } from '@/components/ui/Avatar'

// Mock Next.js Image component
jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ src, alt, onLoad, onError, width, height, className, ...props }: any) => {
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
        {...props}
      />
    )
  }
})

describe('Avatar', () => {
  const defaultProps = {
    src: 'https://example.com/avatar.jpg',
    alt: 'John Doe'
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<Avatar {...defaultProps} />)

    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', defaultProps.src)
    expect(image).toHaveAttribute('alt', defaultProps.alt)
  })

  it('shows fallback placeholder when no src is provided', () => {
    render(<Avatar alt="John Doe" />)

    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('uses custom fallback text', () => {
    render(<Avatar alt="John Doe" fallback="JD" />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows default icon when no alt and no fallback', () => {
    render(<Avatar alt="" />)

    expect(screen.getByText('👤')).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const expectedClasses = ['w-6 h-6', 'w-8 h-8', 'w-12 h-12', 'w-16 h-16', 'w-24 h-24']

    sizes.forEach((size, index) => {
      const { container } = render(<Avatar {...defaultProps} size={size} />)
      const avatarContainer = container.querySelector('div')
      expect(avatarContainer).toHaveClass(expectedClasses[index])
    })
  })

  it('applies medium size by default', () => {
    const { container } = render(<Avatar {...defaultProps} />)
    const avatarContainer = container.querySelector('div')
    expect(avatarContainer).toHaveClass('w-12 h-12')
  })

  it('sets correct pixel dimensions for Next.js Image', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const expectedSizes = [24, 32, 48, 64, 96]

    sizes.forEach((size, index) => {
      render(<Avatar {...defaultProps} size={size} />)
      const image = screen.getByTestId('next-image')
      expect(image).toHaveAttribute('width', expectedSizes[index].toString())
      expect(image).toHaveAttribute('height', expectedSizes[index].toString())
    })
  })

  it('applies custom className', () => {
    const customClass = 'custom-avatar-class'
    const { container } = render(<Avatar {...defaultProps} className={customClass} />)
    const avatarContainer = container.querySelector('div')
    expect(avatarContainer).toHaveClass(customClass)
  })

  it('is circular with proper border radius', () => {
    const { container } = render(<Avatar {...defaultProps} />)
    const avatarContainer = container.querySelector('div')
    expect(avatarContainer).toHaveClass('rounded-full')

    const image = screen.getByTestId('next-image')
    expect(image).toHaveClass('rounded-full')
    expect(image).toHaveStyle({ borderRadius: '50%' })
  })

  it('shows loading state initially', async () => {
    render(<Avatar {...defaultProps} />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveClass('opacity-0')

    await waitFor(() => {
      expect(screen.getByText('...')).toBeInTheDocument()
    })
  })

  it('shows placeholder on error', async () => {
    const onError = jest.fn()

    render(<Avatar {...defaultProps} onError={onError} />)

    const image = screen.getByTestId('next-image')

    // Trigger error
    image.dispatchEvent(new Event('error'))

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
      expect(screen.getByText('J')).toBeInTheDocument()
    })
  })

  it('calls onLoad callback when image loads', async () => {
    const onLoad = jest.fn()

    render(<Avatar {...defaultProps} onLoad={onLoad} />)

    const image = screen.getByTestId('next-image')

    // Trigger load
    image.dispatchEvent(new Event('load'))

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled()
    })
  })

  it('sets priority prop correctly', () => {
    render(<Avatar {...defaultProps} priority />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('priority')
  })

  it('uses Soomgo placeholder colors', () => {
    render(<Avatar alt="John Doe" />)

    const placeholderDiv = screen.getByText('J')
    expect(placeholderDiv).toHaveStyle({
      backgroundColor: '#EFF1F5',
      color: '#6A7685'
    })
  })

  it('applies appropriate font sizes for different sizes', () => {
    const testCases = [
      { size: 'xs' as const, expectedClass: 'text-xs' },
      { size: 'sm' as const, expectedClass: 'text-sm' },
      { size: 'md' as const, expectedClass: 'text-lg' },
      { size: 'lg' as const, expectedClass: 'text-xl' },
      { size: 'xl' as const, expectedClass: 'text-2xl' }
    ]

    testCases.forEach(({ size, expectedClass }) => {
      render(<Avatar alt="John Doe" size={size} />)
      const placeholderDiv = screen.getByText('J')
      expect(placeholderDiv).toHaveClass(expectedClass)
    })
  })

  it('handles empty alt gracefully', () => {
    render(<Avatar alt="" />)

    expect(screen.getByText('👤')).toBeInTheDocument()
  })

  it('extracts first character from alt for fallback', () => {
    render(<Avatar alt="Jane Smith" />)

    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('converts alt to uppercase for fallback', () => {
    render(<Avatar alt="jane smith" />)

    expect(screen.getByText('J')).toBeInTheDocument()
  })
})