import { Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { Search } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.3) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}></div>
      <div className="relative">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 animate-fadeIn">
              <Typography variant="h1" className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 bg-clip-text text-transparent drop-shadow-2xl">
                  숨은고수
                </span>
              </Typography>
              <Typography variant="h2" className="text-3xl md:text-4xl text-gray-700 mb-8 font-bold animate-fadeIn animation-delay-200">
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

            {/* Category Icons - Enhanced Design */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 max-w-5xl mx-auto">
              {[
                { icon: '🏠', label: '전체보기', color: 'from-purple-500 to-indigo-500' },
                { icon: '💃', label: '레슨/클래스', color: 'from-pink-500 to-rose-500' },
                { icon: '🎵', label: '이벤트/파티', color: 'from-orange-500 to-amber-500' },
                { icon: '👥', label: '파트너매칭', color: 'from-cyan-500 to-blue-500' },
                { icon: '🛍️', label: '중고거래', color: 'from-green-500 to-emerald-500' },
                { icon: '📍', label: '스튜디오/홀', color: 'from-violet-500 to-purple-500' },
                { icon: '🎯', label: '대회준비', color: 'from-red-500 to-pink-500' },
                { icon: '❓', label: '기타', color: 'from-gray-500 to-slate-500' },
              ].map((category, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-center p-5 bg-white rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 shadow-lg shadow-gray-200/50 hover:shadow-purple-300/30"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shadow-lg mb-3 text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {category.icon}
                  </div>
                  <Typography variant="small" className="text-gray-700 text-center font-medium group-hover:text-gray-900">
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