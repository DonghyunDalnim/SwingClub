'use client'

import React, { useEffect, useState } from 'react';

export interface LiveRegionProps {
  /**
   * 알림 메시지
   */
  message: string;
  /**
   * 알림 우선순위
   * - polite: 현재 작업을 방해하지 않고 알림
   * - assertive: 즉시 알림 (중요한 변경사항)
   * - off: 알림 비활성화
   */
  priority?: 'polite' | 'assertive' | 'off';
  /**
   * 메시지 자동 지우기까지의 시간 (ms)
   */
  clearAfter?: number;
  /**
   * 메시지가 지워질 때 호출되는 콜백
   */
  onClear?: () => void;
}

/**
 * 스크린 리더를 위한 라이브 영역 컴포넌트
 * 동적 콘텐츠 변경사항을 스크린 리더에 알림
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  clearAfter,
  onClear
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter && message) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
        onClear?.();
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter, onClear]);

  if (!currentMessage || priority === 'off') {
    return null;
  }

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {currentMessage}
    </div>
  );
};

/**
 * 전역 알림을 위한 훅
 */
export const useLiveRegion = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive' | 'off'>('polite');

  const announce = (text: string, level: 'polite' | 'assertive' = 'polite') => {
    setMessage(''); // 기존 메시지 지우기
    setTimeout(() => {
      setMessage(text);
      setPriority(level);
    }, 100); // 약간의 지연으로 메시지 변경 감지
  };

  const clear = () => {
    setMessage('');
  };

  return {
    message,
    priority,
    announce,
    clear,
    LiveRegionComponent: () => (
      <LiveRegion
        message={message}
        priority={priority}
        clearAfter={5000}
        onClear={clear}
      />
    )
  };
};

export default LiveRegion;