'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Settings, MapPin, Users, Star, Filter } from 'lucide-react'

// Map 컴포넌트를 동적으로 로드 (SSR 비활성화)
const Map = dynamic(() => import('@/components/core/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 text-sm">지도 컴포넌트를 불러오는 중...</p>
      </div>
    </div>
  )
});

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <ArrowLeft className="h-6 w-6" />
            <span className="font-semibold text-lg">내 주변 댄스 정보</span>
          </div>
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6" />
            <Settings className="h-6 w-6" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 카카오맵 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Map
              height="320px"
              className="w-full"
              onMapCreated={(map) => {
                console.log('카카오맵이 생성되었습니다:', map);
              }}
              onCenterChanged={(center) => {
                console.log('지도 중심이 변경되었습니다:', center);
              }}
            />
          </CardContent>
        </Card>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Badge variant="default" className="whitespace-nowrap">전체</Badge>
          <Badge variant="outline" className="whitespace-nowrap">스튜디오</Badge>
          <Badge variant="outline" className="whitespace-nowrap">연습실</Badge>
          <Badge variant="outline" className="whitespace-nowrap">클럽/파티</Badge>
          <Button variant="outline" size="sm" className="ml-auto">
            <Filter className="h-4 w-4 mr-1" />
            리스트뷰
          </Button>
        </div>

        {/* Location List */}
        <div className="space-y-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">강남 스윙 스튜디오</h3>
                    <Badge variant="secondary" className="text-xs">스튜디오</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>강남구 역삼동</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>12명 활동중</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    초보자부터 고급자까지 환영하는 친근한 분위기의 스튜디오
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">홍대 댄스 홀</h3>
                    <Badge variant="secondary" className="text-xs">댄스홀</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>마포구 홍대입구</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>4.6</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>8명 활동중</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    넓은 공간과 좋은 음향시설로 파티 및 소셜댄스에 최적
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">신촌 연습실</h3>
                    <Badge variant="secondary" className="text-xs">연습실</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>서대문구 신촌동</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>4.9</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>15명 활동중</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    조용하고 깨끗한 연습실, 거울과 음향시설 완비
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}