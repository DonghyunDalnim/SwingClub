import { Button, Card, Badge, Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { Eye, MessageCircle, ChevronRight } from 'lucide-react'

export function CommunitySection() {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 opacity-2" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a855f7' fill-opacity='0.1'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="relative">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Typography variant="h2" className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-purple-800 bg-clip-text text-transparent">
                스윙댄스 커뮤니티에 물어보세요
              </Typography>
            </div>
            <Button variant="ghost" className="group text-purple-600 hover:text-purple-700 hover:scale-105 transition-all duration-300">
              전체보기
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="space-y-4">
              {[
                {
                  category: '스윙댄스 이야기',
                  title: '환갑도 늦지 않았어요, 나다운 삶으로 나아가는 원동력',
                  excerpt: '오랫동안 마음속에 그려온 그림은 마침내 빛을 찾아 세상 앞에 서게 되었습니다. 송미정님은 엄마이자 아내, 며느리로서 긴 시간 가족을 1순위로...',
                  views: '2,230',
                  comments: '7'
                },
                {
                  category: '스윙댄스 이야기',
                  title: '32살, 인생 2막의 변화를 선택한 이유',
                  excerpt: '5년 동안 출판사 번역가로 일하다 이제 막 퇴사한 지 5개월이 된, 32살 청년이 있습니다. 더 이상 퇴사가 낯설지 않은 시대지만...',
                  views: '3,234',
                  comments: '5'
                }
              ].map((post, index) => (
                <Card key={index} className="group hover:shadow-2xl hover:shadow-purple-100/40 transition-all duration-500 cursor-pointer hover:-translate-y-2 bg-gradient-to-br from-white/95 via-white/90 to-purple-50/30 backdrop-blur-md border border-white/80 hover:border-purple-200/60 shadow-inner hover:shadow-lg">
                  <div className="flex">
                    <div className="flex-1 p-6">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">
                          {post.category}
                        </Badge>
                      </div>
                      <Typography variant="h4" className="font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </Typography>
                      <Typography variant="body" className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </Typography>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.views}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {post.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}