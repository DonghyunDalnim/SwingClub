import { Button, Card, CardContent, Badge, Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { Star, ChevronRight } from 'lucide-react'

export function InstructorsSection() {
  return (
    <section className="py-16 relative bg-gradient-to-b from-white via-gray-50/50 to-slate-50">
      <div className="absolute inset-0 opacity-3" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(147, 51, 234, 0.08) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }}></div>
      <div className="relative">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Typography variant="h2" className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-800 bg-clip-text text-transparent">
                인기 스윙댄스 강사
              </Typography>
              <Typography variant="body" className="text-gray-600 mt-2">
                전문 강사님들과 함께 스윙댄스를 배워보세요
              </Typography>
            </div>
            <Button variant="ghost" className="group text-purple-600 hover:text-purple-700 hover:scale-105 transition-all duration-300">
              더 보기
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: '김린디',
                specialty: '린디합 전문',
                experience: '10년',
                rating: '4.9',
                reviews: '124',
                image: '👩‍🏫',
                badge: '전문가'
              },
              {
                name: '이스윙',
                specialty: '찬스퇴 최고수',
                experience: '8년',
                rating: '4.8',
                reviews: '98',
                image: '👨‍🏫',
                badge: '달인'
              },
              {
                name: '박재즈',
                specialty: '빅밴드 재즈',
                experience: '12년',
                rating: '4.9',
                reviews: '156',
                image: '👩‍🏫',
                badge: '전문가'
              },
              {
                name: '정미로',
                specialty: '비밥 어쏘시어이션',
                experience: '6년',
                rating: '4.7',
                reviews: '87',
                image: '👨‍🏫',
                badge: '신예'
              }
            ].map((instructor, index) => (
              <Card key={index} className="group hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-500 cursor-pointer hover:-translate-y-3 bg-gradient-to-br from-white/95 via-white/90 to-indigo-50/30 backdrop-blur-md border border-white/80 hover:border-indigo-200/60 shadow-inner hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto text-4xl flex items-center justify-center bg-gradient-to-br from-white/90 to-gray-50/80 rounded-full shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 backdrop-blur-sm border border-white/60">
                      {instructor.image}
                    </div>
                    <Badge variant="outline" className={`absolute -top-1 -right-2 text-xs px-2 py-1 ${
                      instructor.badge === '전문가' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400' :
                      instructor.badge === '달인' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-300' :
                      'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400'
                    }`}>
                      {instructor.badge}
                    </Badge>
                  </div>
                  <Typography variant="h4" className="font-bold text-gray-800 mb-1 group-hover:text-indigo-700 transition-colors duration-300">
                    {instructor.name}
                  </Typography>
                  <Typography variant="body" className="text-gray-600 text-sm mb-2">
                    {instructor.specialty}
                  </Typography>
                  <Typography variant="small" className="text-gray-500 mb-3">
                    경력 {instructor.experience}
                  </Typography>
                  <div className="flex items-center justify-center space-x-1 text-amber-500 mb-1">
                    <Star className="h-4 w-4 fill-current" />
                    <Typography variant="small" className="font-semibold">
                      {instructor.rating}
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                      ({instructor.reviews})
                    </Typography>
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