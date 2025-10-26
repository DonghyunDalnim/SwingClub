import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#693BF2] text-white rounded-lg hover:bg-[#5A2FD9] transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
