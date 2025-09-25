/**
 * @jest-environment jsdom
 */

import { HeartParticles, animateCount, createScaleAnimation, createColorTransition, reduceMotion } from '@/lib/utils/animations'

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb?: FrameRequestCallback) => {
  if (cb) cb(0)
  return 1
}) as jest.MockedFunction<typeof requestAnimationFrame>

global.cancelAnimationFrame = jest.fn()

// Mock performance.now
let mockTime = 0
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => {
      mockTime += 16
      return mockTime
    })
  },
  writable: true
})

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  value: 2,
  writable: true
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('HeartParticles', () => {
  let canvas: HTMLCanvasElement
  let mockContext: Partial<CanvasRenderingContext2D>

  beforeEach(() => {
    canvas = document.createElement('canvas')
    mockContext = {
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      fill: jest.fn(),
      beginPath: jest.fn(),
      fillStyle: '',
      globalAlpha: 1,
    }

    canvas.getContext = jest.fn().mockReturnValue(mockContext)
    canvas.width = 100
    canvas.height = 100
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('creates HeartParticles instance', () => {
    const particles = new HeartParticles(canvas)
    expect(particles).toBeDefined()
  })

  test('throws error when canvas context is not available', () => {
    const invalidCanvas = document.createElement('canvas')
    invalidCanvas.getContext = jest.fn().mockReturnValue(null)

    expect(() => new HeartParticles(invalidCanvas)).toThrow('Canvas context not available')
  })

  test('creates particles on createParticle call', () => {
    const particles = new HeartParticles(canvas)
    particles.createParticle(50, 50)

    // Should start animation
    expect(requestAnimationFrame).toHaveBeenCalled()
  })

  test('destroys particles correctly', () => {
    const particles = new HeartParticles(canvas)
    particles.createParticle(50, 50)
    particles.destroy()

    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  test('clears canvas during animation', () => {
    const particles = new HeartParticles(canvas)
    particles.createParticle(50, 50)

    // Trigger animation frame
    const animateCallback = (requestAnimationFrame as jest.Mock).mock.calls[0][0]
    animateCallback()

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 100, 100)
  })
})

describe('animateCount', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement('div')
    element.textContent = '0'
  })

  test('animates count from start to end value', () => {
    animateCount(element, 0, 10, 100)

    expect(element.textContent).toBe('10')
  })

  test('calls callback with current value', () => {
    const callback = jest.fn()
    animateCount(element, 0, 5, 100, callback)

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[callback.mock.calls.length - 1][0]).toBe(5)
  })

  test('handles negative differences correctly', () => {
    element.textContent = '10'
    animateCount(element, 10, 5, 100)

    expect(element.textContent).toBe('5')
  })

  test('completes animation with final value', () => {
    animateCount(element, 0, 10, 50)

    expect(element.textContent).toBe('10')
  })
})

describe('createScaleAnimation', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement('div')
    element.style.transform = ''
  })

  test('creates scale animation object with correct methods', () => {
    const scaleAnimation = createScaleAnimation(element)

    expect(scaleAnimation).toHaveProperty('scaleDown')
    expect(scaleAnimation).toHaveProperty('scaleUp')
    expect(scaleAnimation).toHaveProperty('reset')
    expect(typeof scaleAnimation.scaleDown).toBe('function')
    expect(typeof scaleAnimation.scaleUp).toBe('function')
    expect(typeof scaleAnimation.reset).toBe('function')
  })

  test('scaleDown applies correct transform', () => {
    const scaleAnimation = createScaleAnimation(element)
    scaleAnimation.scaleDown()

    expect(element.style.transform).toContain('scale(0.98)')
    expect(element.style.transition).toBe('transform 0.1s ease')
  })

  test('scaleUp applies correct transform', () => {
    const scaleAnimation = createScaleAnimation(element)
    scaleAnimation.scaleUp()

    expect(element.style.transform).toContain('scale(1.02)')
    expect(element.style.transition).toBe('transform 0.2s ease')
  })

  test('reset restores original transform', () => {
    element.style.transform = 'rotate(45deg)'
    const scaleAnimation = createScaleAnimation(element)

    scaleAnimation.scaleUp()
    scaleAnimation.reset()

    expect(element.style.transform).toBe('rotate(45deg)')
    expect(element.style.transition).toBe('transform 0.2s ease')
  })

  test('preserves existing transforms', () => {
    element.style.transform = 'translate(10px, 20px)'
    const scaleAnimation = createScaleAnimation(element)
    scaleAnimation.scaleDown()

    expect(element.style.transform).toContain('translate(10px, 20px)')
    expect(element.style.transform).toContain('scale(0.98)')
  })
})

describe('createColorTransition', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement('div')
  })

  test('sets initial color and transition', () => {
    createColorTransition(element, '#ff0000', '#00ff00', 300)

    expect(element.style.color).toBe('rgb(255, 0, 0)')
    expect(element.style.transition).toBe('color 300ms ease')
  })

  test('uses default duration when not specified', () => {
    createColorTransition(element, '#ff0000', '#00ff00')

    expect(element.style.transition).toBe('color 200ms ease')
  })

  test('triggers color change in next frame', () => {
    createColorTransition(element, '#ff0000', '#00ff00', 100)

    // Color should be set to target color after requestAnimationFrame
    expect(element.style.color).toBe('rgb(0, 255, 0)')
  })
})

describe('reduceMotion', () => {
  test('returns false when prefers-reduced-motion is not set', () => {
    const result = reduceMotion()
    expect(result).toBe(false)
  })

  test('returns true when prefers-reduced-motion is set to reduce', () => {
    (window.matchMedia as jest.Mock).mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const result = reduceMotion()
    expect(result).toBe(true)
  })
})

describe('Animation Integration', () => {
  test('HeartParticles respects animation frame timing', () => {
    const canvas = document.createElement('canvas')
    const mockContext = {
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      fill: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      closePath: jest.fn(),
      fillStyle: '',
      globalAlpha: 1,
    }

    canvas.getContext = jest.fn().mockReturnValue(mockContext)
    canvas.width = 100
    canvas.height = 100

    const particles = new HeartParticles(canvas)
    particles.createParticle(50, 50)

    expect(requestAnimationFrame).toHaveBeenCalled()
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 100, 100)

    particles.destroy()
  })

  test('all animation functions handle edge cases', () => {
    const element = document.createElement('div')

    // Test animateCount with same start and end value
    animateCount(element, 5, 5, 0)
    expect(element.textContent).toBe('5')

    // Test createScaleAnimation with empty element
    const emptyElement = document.createElement('div')
    const scaleAnimation = createScaleAnimation(emptyElement)
    expect(() => scaleAnimation.scaleUp()).not.toThrow()

    // Test createColorTransition with invalid colors (should not crash)
    expect(() => createColorTransition(element, '', '', 100)).not.toThrow()
  })
})