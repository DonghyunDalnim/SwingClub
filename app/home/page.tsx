import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Typography } from '@/components/core'
import { Container, Section, Flex, Grid } from '@/components/layout'
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

      <Container>
        <Section spacing="md">
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
                🎵 TODAY'S SWING 🎵
              </Typography>
              <Typography variant="small" className="text-blue-100 mt-2">
                서울 강남구 | 오늘 19:00
              </Typography>
              <Typography variant="h4" className="text-white font-semibold mt-4">
                "초보자 린디합 기초반 모집중!"
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

          {/* Quick Access */}
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

          {/* Hot Topics */}
          <Card>
            <CardHeader>
              <CardTitle>🔥 HOT TOPICS</CardTitle>
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