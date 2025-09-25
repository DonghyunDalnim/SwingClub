import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Typography, Carousel, CarouselItem } from '@/components/core'
import { Container, Section, SectionHeader, Flex, Grid, CategoryGrid } from '@/components/layout'
import { theme } from '@/lib/theme'
import { Bell, Menu, User, Heart, MessageCircle, Eye, MapPin, Users, MessageSquare, HelpCircle, Calendar, ShoppingBag } from 'lucide-react'

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.neutral.background }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          backgroundColor: theme.colors.white,
          borderBottom: `1px solid ${theme.colors.neutral.lightest}`,
          height: theme.components.navigation.height
        }}
      >
        <Container>
          <Flex justify="between" align="center" className="h-full">
            <Flex align="center" gap="md">
              <Menu className="h-6 w-6" style={{ color: theme.colors.neutral.darkest }} />
              <Typography variant="h4" className="font-bold">SWING CONNECT</Typography>
            </Flex>
            <Flex align="center" gap="md">
              <div className="relative">
                <Bell className="h-6 w-6" style={{ color: theme.colors.neutral.darkest }} />
                <Badge
                  variant="rating"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center p-0"
                >
                  3
                </Badge>
              </div>
              <User className="h-6 w-6" style={{ color: theme.colors.neutral.darkest }} />
            </Flex>
          </Flex>
        </Container>
      </header>

      {/* Hero Section - 숨고 표준 패턴 (흰색 배경, 60px 패딩, 중앙 정렬) */}
      <Section variant="hero">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <Typography variant="h1" className="mb-6">
              SWING CONNECT에 오신 것을 환영합니다
            </Typography>
            <Typography variant="body" className="mb-8 text-lg" style={{ color: theme.colors.neutral.medium }}>
              모든 스윙댄스 정보를 한 곳에서 만나보세요.<br />
              커뮤니티, 파트너 매칭, 중고거래까지 - 스윙댄스 라이프의 모든 것
            </Typography>
            <Flex justify="center" gap="md">
              <Button variant="primary" size="lg">
                시작하기
              </Button>
              <Button variant="outline" size="lg">
                더 알아보기
              </Button>
            </Flex>
          </div>
        </Container>
      </Section>

      <Container>
        <Section spacing="md">
          {/* SectionHeader 패턴 시연 - space-between 레이아웃, 24px 하단 마진 */}
          <SectionHeader
            title={<Typography variant="h2">오늘의 스윙댄스</Typography>}
            subtitle="오늘 진행되는 스윙댄스 모임과 이벤트"
            action={
              <Button variant="ghost" size="sm">
                전체보기
              </Button>
            }
          />

          {/* Today's Swing */}
          <Card
            className="text-white text-center"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.accent.blue})`,
              border: 'none'
            }}
          >
            <CardHeader>
              <Typography variant="h4" className="text-white font-bold">
                🎵 TODAY&apos;S SWING 🎵
              </Typography>
              <Typography variant="small" className="text-blue-100 mt-2">
                서울 강남구 | 오늘 19:00
              </Typography>
              <Typography variant="h4" className="text-white font-semibold mt-4">
                &ldquo;초보자 린디합 기초반 모집중!&rdquo;
              </Typography>
            </CardHeader>
            <CardContent>
              <Flex justify="center" gap="md">
                <Button variant="secondary" size="sm">
                  참여하기
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white border border-white hover:bg-white hover:text-purple-600"
                >
                  공유
                </Button>
              </Flex>
            </CardContent>
          </Card>

          {/* SectionHeader + CategoryGrid 패턴 시연 */}
          <SectionHeader
            title={<Typography variant="h3">빠른 액세스</Typography>}
            subtitle="자주 사용하는 기능들에 빠르게 접근하세요"
            action={
              <Button variant="ghost" size="sm">
                설정
              </Button>
            }
          />

          {/* CategoryGrid 패턴 시연 - auto-fit, 최소 80px, 12px 간격 */}
          <CategoryGrid minItemWidth={120} gap="sm" className="mb-6">
            <Card className="text-center p-4">
              <MapPin className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.primary.main }} />
              <Typography variant="small" className="font-medium">내 주변</Typography>
            </Card>
            <Card className="text-center p-4">
              <Users className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.primary.main }} />
              <Typography variant="small" className="font-medium">파트너 찾기</Typography>
            </Card>
            <Card className="text-center p-4">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.primary.main }} />
              <Typography variant="small" className="font-medium">커뮤니티</Typography>
            </Card>
            <Card className="text-center p-4">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.primary.main }} />
              <Typography variant="small" className="font-medium">중고거래</Typography>
            </Card>
            <Card className="text-center p-4">
              <Calendar className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.primary.main }} />
              <Typography variant="small" className="font-medium">이벤트</Typography>
            </Card>
            <Card className="text-center p-4">
              <HelpCircle className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.primary.main }} />
              <Typography variant="small" className="font-medium">도움말</Typography>
            </Card>
          </CategoryGrid>

          {/* Quick Access - 기존 Grid 패턴 */}
          <Grid cols={2} gap="md">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Flex align="center" gap="sm">
                    <MapPin className="h-5 w-5" style={{ color: theme.colors.accent.blue }} />
                    <span>내 주변 댄스 정보</span>
                  </Flex>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['강남 스튜디오', '홍대 연습실', '신촌 댄스홀', '이태원 클럽'].map((location) => (
                    <Flex key={location} align="center" gap="sm">
                      <MapPin className="h-4 w-4" style={{ color: theme.colors.neutral.medium }} />
                      <Typography variant="small" style={{ color: theme.colors.neutral.medium }}>
                        {location}
                      </Typography>
                    </Flex>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Flex align="center" gap="sm">
                    <Users className="h-5 w-5" style={{ color: theme.colors.primary.main }} />
                    <span>커뮤니티</span>
                  </Flex>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { icon: MessageCircle, text: '자유게시판' },
                    { icon: Users, text: '파트너찾기' },
                    { icon: HelpCircle, text: '질문답변' },
                    { icon: Calendar, text: '공연/대회 정보' }
                  ].map((item) => (
                    <Flex key={item.text} align="center" gap="sm">
                      <item.icon className="h-4 w-4" style={{ color: theme.colors.neutral.medium }} />
                      <Typography variant="small" style={{ color: theme.colors.neutral.medium }}>
                        {item.text}
                      </Typography>
                    </Flex>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Carousel 패턴 시연 - Flex 레이아웃, 16px 간격 */}
          <SectionHeader
            title={<Typography variant="h3">🔥 HOT TOPICS</Typography>}
            subtitle="인기 있는 게시물들을 확인해보세요"
            action={
              <Button variant="ghost" size="sm">
                더보기
              </Button>
            }
          />

          <Carousel gap="md" className="mb-6">
            <CarouselItem width="300px">
              <Card className="h-full">
                <CardHeader>
                  <Badge variant="category" className="w-fit">NEW</Badge>
                  <CardTitle>신촌 정기모임</CardTitle>
                  <CardDescription>매주 토 14:00 | 참여자 12명</CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="small" className="mb-4">
                    💃 초보자 환영! 기초부터 차근차근
                  </Typography>
                  <Flex align="center" gap="sm" className="text-xs">
                    <Flex align="center" gap="sm">
                      <Heart className="h-3 w-3" />
                      <span>15</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <MessageCircle className="h-3 w-3" />
                      <span>8</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <Eye className="h-3 w-3" />
                      <span>127</span>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem width="300px">
              <Card className="h-full">
                <CardHeader>
                  <Badge variant="category" className="w-fit">🎪</Badge>
                  <CardTitle>강남 스윙댄스 파티</CardTitle>
                  <CardDescription>3/15(토) 19:00</CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="small" className="mb-4">
                    🎵 라이브 밴드와 함께하는 소셜댄스
                  </Typography>
                  <Flex align="center" gap="sm" className="text-xs">
                    <Flex align="center" gap="sm">
                      <Heart className="h-3 w-3" />
                      <span>23</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <MessageCircle className="h-3 w-3" />
                      <span>15</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <Eye className="h-3 w-3" />
                      <span>201</span>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem width="300px">
              <Card className="h-full">
                <CardHeader>
                  <Badge variant="category" className="w-fit">HOT</Badge>
                  <CardTitle>초보자 린디합 클래스</CardTitle>
                  <CardDescription>매주 일 10:00 | 홍대</CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="small" className="mb-4">
                    🌟 린디합 기초부터 차근차근
                  </Typography>
                  <Flex align="center" gap="sm" className="text-xs">
                    <Flex align="center" gap="sm">
                      <Heart className="h-3 w-3" />
                      <span>31</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <MessageCircle className="h-3 w-3" />
                      <span>22</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <Eye className="h-3 w-3" />
                      <span>156</span>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>
            </CarouselItem>
          </Carousel>

          {/* Hot Topics - 기존 형태 유지 */}
          <Card>
            <CardHeader>
              <CardTitle>📰 최신 소식</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="pl-4 py-2"
                  style={{ borderLeft: `4px solid ${theme.colors.accent.blue}` }}
                >
                  <Flex justify="between" align="center" className="mb-2">
                    <Typography variant="small" className="font-semibold">
                      신촌 정기모임 | 매주 토 14:00 | 참여자 12명
                    </Typography>
                    <Badge variant="outline" color="primary" className="text-xs">NEW</Badge>
                  </Flex>
                  <Typography variant="small" style={{ color: theme.colors.neutral.medium }} className="mb-2">
                    💃 초보자 환영! 기초부터 차근차근
                  </Typography>
                  <Flex align="center" gap="md" className="text-xs" style={{ color: theme.colors.neutral.medium }}>
                    <Flex align="center" gap="sm">
                      <Heart className="h-3 w-3" />
                      <span>15</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <MessageCircle className="h-3 w-3" />
                      <span>8</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <Eye className="h-3 w-3" />
                      <span>127</span>
                    </Flex>
                    <Button variant="ghost" size="sm" className="text-xs h-6">
                      자세히보기
                    </Button>
                  </Flex>
                </div>

                <div
                  className="pl-4 py-2"
                  style={{ borderLeft: `4px solid ${theme.colors.primary.main}` }}
                >
                  <Flex justify="between" align="center" className="mb-2">
                    <Typography variant="small" className="font-semibold">
                      강남 스윙댄스 파티 | 3/15(토) 19:00
                    </Typography>
                    <Badge variant="category" className="text-xs">🎪</Badge>
                  </Flex>
                  <Typography variant="small" style={{ color: theme.colors.neutral.medium }} className="mb-2">
                    🎵 라이브 밴드와 함께하는 소셜댄스
                  </Typography>
                  <Flex align="center" gap="md" className="text-xs" style={{ color: theme.colors.neutral.medium }}>
                    <Flex align="center" gap="sm">
                      <Heart className="h-3 w-3" />
                      <span>23</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <MessageCircle className="h-3 w-3" />
                      <span>15</span>
                    </Flex>
                    <Flex align="center" gap="sm">
                      <Eye className="h-3 w-3" />
                      <span>201</span>
                    </Flex>
                    <Button variant="ghost" size="sm" className="text-xs h-6">
                      자세히보기
                    </Button>
                  </Flex>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Grid cols={2} gap="sm">
            <Button variant="secondary" size="lg" className="h-12">
              <Flex align="center" gap="sm">
                <Users className="h-4 w-4" />
                <span>파트너 찾기</span>
              </Flex>
            </Button>
            <Button variant="secondary" size="lg" className="h-12">
              <Flex align="center" gap="sm">
                <ShoppingBag className="h-4 w-4" />
                <span>중고거래</span>
              </Flex>
            </Button>
          </Grid>
        </Section>
      </Container>
    </div>
  )
}