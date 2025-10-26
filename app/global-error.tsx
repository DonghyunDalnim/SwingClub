'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-4">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              오류가 발생했습니다
            </h2>
            <p className="text-gray-600 mb-8">
              일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-[#693BF2] text-white rounded-lg hover:bg-[#5A2FD9] transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
