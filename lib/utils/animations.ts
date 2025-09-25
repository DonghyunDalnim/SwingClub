'use client'

export interface HeartParticle {
  id: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  scale: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

export class HeartParticles {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: HeartParticle[] = []
  private animationId: number | null = null
  private isAnimating = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context not available')
    }
    this.ctx = ctx
  }

  public createParticle(originX: number, originY: number): void {
    const particleCount = 6 + Math.floor(Math.random() * 4)

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
      const speed = 2 + Math.random() * 3
      const life = 80 + Math.random() * 40

      const particle: HeartParticle = {
        id: Math.random().toString(36).substr(2, 9),
        x: originX,
        y: originY,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 1,
        scale: 0.8 + Math.random() * 0.6,
        opacity: 1,
        color: '#693BF2',
        life,
        maxLife: life
      }

      this.particles.push(particle)
    }

    if (!this.isAnimating) {
      this.startAnimation()
    }
  }

  private startAnimation(): void {
    this.isAnimating = true
    this.animate()
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles = this.particles.filter(particle => {
      particle.x += particle.velocityX
      particle.y += particle.velocityY
      particle.velocityY += 0.1
      particle.life--

      const lifeRatio = particle.life / particle.maxLife
      particle.opacity = lifeRatio
      particle.scale = particle.scale * 0.99

      if (particle.life > 0) {
        this.drawHeart(particle)
        return true
      }
      return false
    })

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate)
    } else {
      this.isAnimating = false
      this.animationId = null
    }
  }

  private drawHeart(particle: HeartParticle): void {
    const { x, y, scale, opacity, color } = particle

    this.ctx.save()
    this.ctx.globalAlpha = opacity
    this.ctx.translate(x, y)
    this.ctx.scale(scale * 0.8, scale * 0.8)

    this.ctx.fillStyle = color
    this.ctx.beginPath()

    // Draw heart shape using bezier curves
    this.ctx.moveTo(0, -4)
    this.ctx.bezierCurveTo(-3, -8, -8, -5, -8, -2)
    this.ctx.bezierCurveTo(-8, 0, -5, 3, 0, 6)
    this.ctx.bezierCurveTo(5, 3, 8, 0, 8, -2)
    this.ctx.bezierCurveTo(8, -5, 3, -8, 0, -4)
    this.ctx.closePath()
    this.ctx.fill()

    this.ctx.restore()
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.particles = []
    this.isAnimating = false
  }
}

export function animateCount(
  element: HTMLElement,
  startValue: number,
  endValue: number,
  duration: number = 300,
  callback?: (value: number) => void
): void {
  const startTime = performance.now()
  const difference = endValue - startValue

  function updateCount(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const currentValue = Math.round(startValue + difference * easeOutQuart)

    element.textContent = currentValue.toString()

    if (callback) {
      callback(currentValue)
    }

    if (progress < 1) {
      requestAnimationFrame(updateCount)
    }
  }

  requestAnimationFrame(updateCount)
}

export function createScaleAnimation(element: HTMLElement): {
  scaleDown: () => void
  scaleUp: () => void
  reset: () => void
} {
  const originalTransform = element.style.transform || ''

  return {
    scaleDown: () => {
      element.style.transform = `${originalTransform} scale(0.98)`
      element.style.transition = 'transform 0.1s ease'
    },
    scaleUp: () => {
      element.style.transform = `${originalTransform} scale(1.02)`
      element.style.transition = 'transform 0.2s ease'
    },
    reset: () => {
      element.style.transform = originalTransform
      element.style.transition = 'transform 0.2s ease'
    }
  }
}

export function createColorTransition(
  element: HTMLElement,
  fromColor: string,
  toColor: string,
  duration: number = 200
): void {
  element.style.color = fromColor
  element.style.transition = `color ${duration}ms ease`

  requestAnimationFrame(() => {
    element.style.color = toColor
  })
}

export const reduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}