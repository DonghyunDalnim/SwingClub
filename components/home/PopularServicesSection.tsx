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
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="group hover:scale-110 transition-all duration-300">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              </Button>
              <Button variant="ghost" size="sm" className="group hover:scale-110 transition-all duration-300">
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>

          {/* Popular Services Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                title: '린디합 레슨',
                requests: '255,555',
                image: '💃'
              },
              {
                title: '스윙댄스 파티',
                requests: '186,504',
                image: '🎵'
              },
              {
                title: '파트너 매칭',
                requests: '190,199',
                image: '👥'
              },
              {
                title: '댄스용품 거래',
                requests: '86,061',
                image: '🛍️'
              }
            ].map((service, index) => (
              <Card key={index} className="group hover:shadow-2xl hover:shadow-purple-200/30 transition-all duration-500 cursor-pointer hover:-translate-y-3 bg-gradient-to-br from-white/90 via-white/80 to-gray-50/80 backdrop-blur-md border border-white/70 hover:border-purple-200/50 shadow-inner">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4 filter drop-shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">{service.image}</div>
                  <Typography variant="body" className="font-bold text-lg text-gray-800 mb-2">
                    {service.title}
                  </Typography>
                  <div className="flex items-center justify-center space-x-1 text-gray-500">
                    <MessageCircle className="h-3 w-3" />
                    <Typography variant="small">
                      {service.requests}
                    </Typography>
                    <span className="text-xs">명 요청</span>
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