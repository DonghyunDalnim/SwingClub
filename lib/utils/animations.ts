/**
 * Animation Utilities - Soomgo Standards
 * 60fps 애니메이션 성능 보장, reduce-motion 접근성 지원
 */

/**
 * 접근성을 위한 reduce-motion 체크
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 애니메이션 duration 상수 (Soomgo 표준)
 */
export const ANIMATION_DURATION = {
  fast: 100,      // 0.1s - 빠른 피드백
  normal: 200,    // 0.2s - 기본 트랜지션
  slow: 300,      // 0.3s - 부드러운 애니메이션
  slower: 500     // 0.5s - 강조 애니메이션
} as const

/**
 * 애니메이션 easing 상수
 */
export const ANIMATION_EASING = {
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const

/**
 * Scale 트랜지션 (버튼 클릭, 호버)
 */
export interface ScaleAnimation {
  scale: number
  duration?: number
  easing?: keyof typeof ANIMATION_EASING
}

export const createScaleTransition = ({
  scale,
  duration = ANIMATION_DURATION.normal,
  easing = 'ease'
}: ScaleAnimation): React.CSSProperties => {
  if (shouldReduceMotion()) {
    return {}
  }

  return {
    transform: `scale(${scale})`,
    transition: `transform ${duration}ms ${ANIMATION_EASING[easing]}`
  }
}

/**
 * Translate 트랜지션 (카드 호버)
 */
export interface TranslateAnimation {
  x?: number
  y?: number
  duration?: number
  easing?: keyof typeof ANIMATION_EASING
}

export const createTranslateTransition = ({
  x = 0,
  y = 0,
  duration = ANIMATION_DURATION.normal,
  easing = 'ease'
}: TranslateAnimation): React.CSSProperties => {
  if (shouldReduceMotion()) {
    return {}
  }

  return {
    transform: `translate(${x}px, ${y}px)`,
    transition: `transform ${duration}ms ${ANIMATION_EASING[easing]}`
  }
}

/**
 * 색상 트랜지션 (#6A7685 → #693BF2)
 */
export interface ColorAnimation {
  from: string
  to: string
  duration?: number
  easing?: keyof typeof ANIMATION_EASING
}

export const createColorTransition = ({
  from,
  to,
  duration = ANIMATION_DURATION.normal,
  easing = 'ease'
}: ColorAnimation): {
  style: React.CSSProperties
  animationStyle: React.CSSProperties
} => {
  if (shouldReduceMotion()) {
    return {
      style: { color: to },
      animationStyle: {}
    }
  }

  return {
    style: { color: from },
    animationStyle: {
      color: to,
      transition: `color ${duration}ms ${ANIMATION_EASING[easing]}`
    }
  }
}

/**
 * 숫자 카운트 애니메이션
 */
export const animateCount = (
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): (() => void) => {
  if (shouldReduceMotion()) {
    onUpdate(end)
    onComplete?.()
    return () => {}
  }

  const startTime = performance.now()
  let animationFrameId: number

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (easeOutQuad)
    const easedProgress = 1 - (1 - progress) * (1 - progress)
    const currentValue = Math.round(start + (end - start) * easedProgress)

    onUpdate(currentValue)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      onComplete?.()
    }
  }

  animationFrameId = requestAnimationFrame(animate)

  // Cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

/**
 * 파티클 효과를 위한 Particle 인터페이스
 */
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

/**
 * 좋아요 버튼용 하트 파티클 생성
 */
export const createHeartParticles = (
  centerX: number,
  centerY: number,
  count: number = 12
): Particle[] => {
  const particles: Particle[] = []
  const colors = ['#693BF2', '#FF6B9D', '#FFB6C1', '#FFC0CB'] // Purple + Pink variations

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const velocity = 2 + Math.random() * 3

    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1,
      maxLife: 30 + Math.random() * 20,
      size: 3 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }

  return particles
}

/**
 * 파티클 애니메이션 업데이트
 */
export const updateParticles = (particles: Particle[]): Particle[] => {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.2, // Gravity
      life: particle.life - 1,
      size: particle.size * 0.95 // Shrink over time
    }))
    .filter(particle => particle.life > 0)
}

/**
 * Canvas에 파티클 렌더링
 */
export const renderParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
): void => {
  particles.forEach(particle => {
    ctx.save()
    ctx.globalAlpha = particle.life / particle.maxLife
    ctx.fillStyle = particle.color

    // Draw heart shape (simplified)
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  })
}

/**
 * 호버 애니메이션 CSS 클래스
 */
export const hoverAnimationClasses = {
  card: 'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg',
  button: 'transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]',
  link: 'transition-colors duration-200 ease-out hover:text-[#693BF2]',
  icon: 'transition-transform duration-200 ease-out hover:rotate-12'
} as const

/**
 * 60fps 애니메이션을 위한 requestAnimationFrame 헬퍼
 */
export const createAnimationLoop = (
  callback: (deltaTime: number) => void | boolean
): (() => void) => {
  let animationFrameId: number
  let lastTime = performance.now()
  let isRunning = true

  const loop = (currentTime: number) => {
    if (!isRunning) return

    const deltaTime = currentTime - lastTime
    lastTime = currentTime

    const shouldContinue = callback(deltaTime)

    if (shouldContinue !== false) {
      animationFrameId = requestAnimationFrame(loop)
    }
  }

  animationFrameId = requestAnimationFrame(loop)

  // Cleanup function
  return () => {
    isRunning = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}