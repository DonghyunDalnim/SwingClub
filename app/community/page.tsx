import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Edit, Heart, MessageCircle, Eye, Pin } from 'lucide-react'

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <ArrowLeft className="h-6 w-6" />
            <span className="font-semibold text-lg">커뮤니티</span>
          </div>
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6" />
            <Edit className="h-6 w-6" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Badge variant="default" className="whitespace-nowrap">💬자유</Badge>
          <Badge variant="outline" className="whitespace-nowrap">🤝파트너</Badge>
          <Badge variant="outline" className="whitespace-nowrap">❓질문</Badge>
          <Badge variant="outline" className="whitespace-nowrap">🎭공연</Badge>
          <Badge variant="outline" className="whitespace-nowrap">🛍거래</Badge>
          <Badge variant="outline" className="whitespace-nowrap">📢공지</Badge>
        </div>

        {/* Pinned Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Pin className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="default" className="text-xs">공지</Badge>
                  <span className="text-sm font-semibold">3월 정기모임 일정 안내</span>
                  <span className="text-xs text-gray-500">2시간전</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">운영자 | 조회 256 | 댓글 12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔥</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm">초보자도 쉽게! 린디합 기본스텝 정리</span>
                    <Badge variant="destructive" className="text-xs">NEW</Badge>
                    <span className="text-xs text-gray-500">5분전</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    댄스러버 | "오늘 배운 기본스텝 정리해봤어요~ 초보분들 참고!"
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      15
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      8
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      89
                    </span>
                    <Badge variant="outline" className="text-xs">이미지 3장</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🤝</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm">홍대 근처 파트너 구해요! (여성/초급)</span>
                    <Badge variant="outline" className="text-xs">파트너</Badge>
                    <span className="text-xs text-gray-500">30분전</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    스윙걸23 | "매주 일요일 오후 2시 정기모임 함께하실 분~"
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      3
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      12
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      45
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎭</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm">4월 스윙댄스 페스티벌 참가자 모집!</span>
                    <Badge variant="secondary" className="text-xs">이벤트</Badge>
                    <span className="text-xs text-gray-500">2시간전</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    이벤트킹 | "대형 라이브밴드와 함께! 선착순 50명"
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      24
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      18
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      156
                    </span>
                    <Badge variant="outline" className="text-xs">포스터</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Load More */}
        <div className="text-center py-4">
          <Button variant="outline">더보기</Button>
        </div>
      </div>
    </div>
  )
}