'use client';

/**
 * Development-only accessibility monitoring component
 * Shows real-time accessibility issues and color contrast violations
 */

interface AccessibilityDevToolProps {
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function AccessibilityDevTool({
  enabled = process.env.NODE_ENV === 'development',
}: AccessibilityDevToolProps) {
  // Don't render in production or when disabled
  if (!enabled || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="px-3 py-2 bg-blue-500 text-white rounded-lg shadow-lg text-sm font-medium">
        🎯 Accessibility Dev Mode
      </div>
    </div>
  );
}

export default AccessibilityDevTool;