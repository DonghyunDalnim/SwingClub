import { Button, Card, CardContent, Badge, Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { MessageCircle, Eye, Search, Star, ChevronRight, ChevronLeft } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header - Enhanced with shadow and gradient */}
      <header
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-lg shadow-gray-900/5"
        role="banner"
        aria-label="사이트 헤더"
      >
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Left Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Typography variant="h4" className="font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 bg-clip-text text-transparent">
                  Swing Connect
                </Typography>
              </div>
              <nav
                className="hidden md:flex items-center space-x-6"
                role="navigation"
                aria-label="주요 네비게이션"
              >
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900" aria-label="견적요청 페이지로 이동">
                  견적요청
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900" aria-label="고수찾기 페이지로 이동">
                  고수찾기
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900" aria-label="마켓 페이지로 이동">
                  마켓
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900" aria-label="커뮤니티 페이지로 이동">
                  커뮤니티
                </Button>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4" role="group" aria-label="사용자 계정 액션">
              <Button variant="ghost" className="text-gray-700" aria-label="로그인 또는 회원가입">
                로그인 / 회원가입
              </Button>
              <Button variant="primary" size="sm" aria-label="고수로 가입하기">
                고수가입
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section - Enhanced with multi-layer gradients and patterns */}
      <section
        className="relative py-20 overflow-hidden"
        role="banner"
        aria-labelledby="hero-title"
        aria-describedby="hero-subtitle"
      >
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
              <h1 id="hero-title" className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 bg-clip-text text-transparent">
                  숨은고수
                </span>
              </h1>
              <p id="hero-subtitle" className="text-2xl text-gray-600 mb-8 font-medium">
                더 나은 스윙댄스를 위한 변화
              </p>
            </div>

            {/* Search Bar - Soomgo Style */}
            <div className="relative mb-8 max-w-2xl mx-auto">
              <form role="search" aria-label="서비스 검색">
                <label htmlFor="service-search" className="sr-only">
                  스윙댄스 서비스 검색
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <input
                    id="service-search"
                    type="text"
                    placeholder="어떤 스윙댄스 서비스가 필요하세요?"
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 focus:shadow-purple-200/50"
                    aria-describedby="search-help"
                  />
                </div>
                <div id="search-help" className="sr-only">
                  원하는 스윙댄스 서비스를 입력하세요. 예: 레슨, 파트너 매칭, 이벤트
                </div>
              </form>
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

      {/* Popular Services Section - Enhanced with gradient background and texture */}
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

      {/* Community Section - Enhanced with subtle pattern */}
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
                      <Badge variant="outline" className="mb-2 text-purple-600 border-purple-200">
                        {post.category}
                      </Badge>
                      <Typography variant="body" className="font-bold text-lg text-gray-800 mb-3 leading-relaxed">
                        {post.title}
                      </Typography>
                      <Typography variant="small" className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </Typography>
                      <div className="flex items-center space-x-4 text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 via-purple-150 to-purple-200 rounded-lg m-4 flex items-center justify-center shadow-lg shadow-purple-200/40">
                      <span className="text-2xl filter drop-shadow-sm">💃</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              {[
                {
                  category: '레슨/클래스',
                  title: '초보자를 위한 린디합 기초 가이드',
                  author: '춤추는고수'
                },
                {
                  category: '파트너매칭',
                  title: '강남 지역 스윙댄스 파트너 구해요',
                  author: '스윙러버'
                }
              ].map((post, index) => (
                <Card key={index} className="group hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-500 cursor-pointer hover:-translate-y-2 bg-gradient-to-br from-white/95 via-white/90 to-blue-50/20 backdrop-blur-md border border-white/80 hover:border-blue-200/50 shadow-inner">
                  <div className="flex items-center p-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 via-blue-150 to-blue-200 rounded-lg flex items-center justify-center mr-4 shadow-md shadow-blue-200/50 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <span className="text-xl filter drop-shadow-sm">{index === 0 ? '📚' : '👥'}</span>
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-1 text-blue-600 border-blue-200">
                        {post.category}
                      </Badge>
                      <Typography variant="small" className="font-semibold mb-1">
                        {post.title}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        {post.author}
                      </Typography>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
        </div>
      </section>

      {/* Popular Instructors Section - Enhanced with gradient and texture */}
      <section className="py-16 relative bg-gradient-to-b from-white via-gray-50/50 to-slate-50">
        <div className="absolute inset-0 opacity-3" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(147, 51, 234, 0.1) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
        <div className="relative">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Typography variant="h2" className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                지금 인기 있는 고수
              </Typography>
            </div>
            <Button variant="ghost" className="group text-purple-600 hover:text-purple-700 hover:scale-105 transition-all duration-300">
              전체보기
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          <div className="flex space-x-2 mb-6">
            {['린디합 레슨', '스윙댄스 파티', '파트너 매칭', '댄스용품 거래'].map((category, index) => (
              <Button
                key={category}
                variant={index === 0 ? 'primary' : 'outline'}
                size="sm"
                className="rounded-full hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                rating: '4.9',
                name: '압도적1위! - 스윙클럽',
                badge: '숨고페이',
                experience: '경력 10년·평균 1시간 내 응답'
              },
              {
                rating: '5.0',
                name: '김민수',
                badge: '숨고페이',
                experience: '경력 8년·평균 2시간 내 응답'
              },
              {
                rating: '4.8',
                name: '스윙마스터',
                badge: '숨고페이',
                experience: '경력 15년·평균 30분 내 응답'
              }
            ].map((instructor, index) => (
              <Card key={index} className="group hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 cursor-pointer hover:-translate-y-3 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/50 backdrop-blur-md border border-white/80 hover:border-gray-200/60 shadow-inner hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 font-semibold">{instructor.rating}</span>
                    </div>
                  </div>
                  <Typography variant="body" className="font-bold text-lg text-gray-800 mb-2">
                    {instructor.name}
                  </Typography>
                  <div className="flex items-center mb-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {instructor.badge}
                    </Badge>
                  </div>
                  <Typography variant="small" className="text-gray-600">
                    {instructor.experience}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
        </div>
      </section>

      {/* Call to Action - Enhanced with gradient and shadows */}
      <section className="py-16 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative">
        <Container>
          <div className="text-center">
            <Typography variant="h2" className="text-4xl font-extrabold mb-4 text-white drop-shadow-lg">
              전문가로 활동하시나요?
            </Typography>
            <Typography variant="body" className="text-xl text-purple-100 mb-8 font-medium leading-relaxed">
              스윙댄스 커뮤니티에서 새로운 고객을 만나보세요
            </Typography>
            <Button variant="secondary" size="lg" className="group hover:scale-110 hover:shadow-2xl hover:shadow-white/50 transition-all duration-500 bg-white/90 hover:bg-white backdrop-blur-sm">
              <span className="group-hover:scale-105 transition-transform duration-300">고수가입</span>
            </Button>
          </div>
        </Container>
        </div>
      </section>
    </div>
  )
}