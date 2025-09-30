import { Button, Typography } from '@/components/core'
import { Container } from '@/components/layout'

export function CallToActionSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
        backgroundSize: '30px 30px'
      }}></div>
      <div className="relative">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Typography variant="h2" className="text-4xl font-extrabold mb-4">
              지금 바로 스윙댄스를 시작하세요!
            </Typography>
            <Typography variant="body" className="text-xl mb-8 text-purple-100">
              전문 강사님과 함께하는 즐거운 스윙댄스 여정을 시작해보세요.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-50 font-bold px-8 py-4 text-lg shadow-2xl shadow-black/30 hover:shadow-3xl hover:scale-105 transition-all duration-300">
                지금 시작하기
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-700 font-bold px-8 py-4 text-lg shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                더 알아보기
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}