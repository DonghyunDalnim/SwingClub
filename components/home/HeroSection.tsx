import { Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { Search } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.3) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}></div>
      <div className="relative">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Typography variant="h1" className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 bg-clip-text text-transparent">
                  숨은고수
                </span>
              </Typography>
              <Typography variant="h2" className="text-2xl text-gray-600 mb-8 font-medium">
                더 나은 스윙댄스를 위한 변화
              </Typography>
            </div>

            {/* Search Bar - Soomgo Style */}
            <div className="relative mb-8 max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="어떤 스윙댄스 서비스가 필요하세요?"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 focus:shadow-purple-200/50"
                />
              </div>
            </div>

            {/* Category Icons - Soomgo Style */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto">
              {[
                { icon: '🏠', label: '전체보기' },
                { icon: '💃', label: '레슨/클래스' },
                { icon: '🎵', label: '이벤트/파티' },
                { icon: '👥', label: '파트너매칭' },
                { icon: '🛍️', label: '중고거래' },
                { icon: '📍', label: '스튜디오/홀' },
                { icon: '🎯', label: '대회준비' },
                { icon: '❓', label: '기타' },
              ].map((category, index) => (
                <div key={index} className="flex flex-col items-center p-3 hover:bg-white/80 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md shadow-gray-200/60 mb-2 text-xl hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300">
                    {category.icon}
                  </div>
                  <Typography variant="small" className="text-gray-600 text-center">
                    {category.label}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}