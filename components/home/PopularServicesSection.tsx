import { Button, Card, CardContent, Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export function PopularServicesSection() {
  return (
    <section className="py-16 relative bg-gradient-to-b from-gray-50 via-slate-50/50 to-white">
      <div className="absolute inset-0 opacity-3" style={{
        backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 75%, transparent 75%), linear-gradient(-45deg, transparent 25%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 75%, transparent 75%)`,
        backgroundSize: '60px 60px'
      }}></div>
      <div className="relative">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <Typography variant="h2" className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              스윙댄스 인기 서비스
            </Typography>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="group hover:scale-110 transition-all duration-300 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-purple-300/50 border-2 border-gray-100 hover:border-purple-300"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-purple-600 group-hover:-translate-x-1 transition-all duration-300" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="group hover:scale-110 transition-all duration-300 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-purple-300/50 border-2 border-gray-100 hover:border-purple-300"
              >
                <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
              </Button>
            </div>
          </div>

          {/* Popular Services Carousel - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: '린디합 레슨',
                requests: '255,555',
                image: '💃',
                gradient: 'from-pink-500 to-rose-500'
              },
              {
                title: '스윙댄스 파티',
                requests: '186,504',
                image: '🎵',
                gradient: 'from-orange-500 to-amber-500'
              },
              {
                title: '파트너 매칭',
                requests: '190,199',
                image: '👥',
                gradient: 'from-cyan-500 to-blue-500'
              },
              {
                title: '댄스용품 거래',
                requests: '86,061',
                image: '🛍️',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 bg-white border-2 border-gray-100 hover:border-transparent overflow-hidden relative"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                <CardContent className="p-8 text-center relative">
                  <div className="text-5xl mb-5 filter drop-shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                    {service.image}
                  </div>
                  <Typography variant="body" className="font-bold text-xl text-gray-800 mb-3 group-hover:text-gray-900">
                    {service.title}
                  </Typography>
                  <div className="flex items-center justify-center space-x-2 text-gray-600 group-hover:text-gray-700">
                    <MessageCircle className="h-4 w-4" />
                    <Typography variant="small" className="font-semibold text-base">
                      {service.requests}
                    </Typography>
                    <span className="text-sm font-medium">명 요청</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    </section>
  )
}