import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Typography } from '@/components/core'
import { Container, Section, Flex } from '@/components/layout'
import { theme } from '@/lib/theme'
import { Search, Edit, Star, Clock } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.neutral.background }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: theme.colors.white, borderBottom: `1px solid ${theme.colors.neutral.lightest}` }}>
        <Container>
          <Flex justify="between" align="center" className="py-3">
          <Typography variant="h4" className="font-semibold">중고거래</Typography>
          <Flex align="center" gap="md">
            <Search className="h-6 w-6" />
            <Edit className="h-6 w-6" />
          </Flex>
          </Flex>
        </Container>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Badge variant="category" className="whitespace-nowrap">👠신발</Badge>
          <Badge variant="outline" className="whitespace-nowrap">👗의상</Badge>
          <Badge variant="outline" className="whitespace-nowrap">💍액세서리</Badge>
          <Badge variant="outline" className="whitespace-nowrap">📱기타</Badge>
        </div>

        {/* Featured Items */}
        <div className="grid gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👠</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">린디합 전용 댄스화 - 거의 새제품!</h3>
                    <Badge className="text-xs bg-red-500">🔥 인기</Badge>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">댄스러버</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs">4.8</span>
                    </div>
                    <Badge variant="outline" className="text-xs">강남구</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    "한 번만 신고 보관만 했어요. 정가 15만원 → 8만원"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">80,000원</span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      2시간전
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👗</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">빈티지 스윙 드레스 판매합니다</h3>
                    <Badge variant="outline" className="text-xs">새상품</Badge>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">스윙걸23</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs">4.6</span>
                    </div>
                    <Badge variant="outline" className="text-xs">홍대</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    "공연용으로 한번 착용. 사이즈 55"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">45,000원</span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      1일전
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💍</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">스윙댄스 액세서리 세트</h3>
                    <Badge variant="status" color="secondary" className="text-xs">세트</Badge>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">액세사랑</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs">4.9</span>
                    </div>
                    <Badge variant="outline" className="text-xs">신촌</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    "모자, 넷타이, 헤어핀 세트로 판매"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">25,000원</span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      3일전
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="fixed bottom-20 right-4">
          <Button size="lg" className="rounded-full shadow-lg">
            <Edit className="h-5 w-5 mr-2" />
            등록
          </Button>
        </div>
      </div>
    </div>
  )
}