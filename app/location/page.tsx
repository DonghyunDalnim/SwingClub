'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button, Card, CardContent, Badge, Typography } from '@/components/core';
import { Container, Section, Flex } from '@/components/layout';
import { theme } from '@/lib/theme';
import { ArrowLeft, Search, Settings, MapPin, Users, Star, Filter } from 'lucide-react';
import { Studio } from '@/lib/types/studio';
import { searchStudiosByLocation } from '@/lib/actions/studios';
import { KakaoLatLng } from '@/lib/types/kakao-map';
import { DEFAULT_CENTER } from '@/lib/kakao-map';
import StudioPopup from '@/components/location/StudioPopup';

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
  // 상태 관리
  const [studios, setStudios] = useState<Studio[]>([]);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<KakaoLatLng>(DEFAULT_CENTER);
  const [currentCategory, setCurrentCategory] = useState<string>('all');

  // 스튜디오 데이터 로딩 함수
  const loadStudios = useCallback(async (center: KakaoLatLng, category?: string) => {
    try {
      setIsLoading(true);

      // 반경 5km 내 스튜디오 검색
      const studiosData = await searchStudiosByLocation({
        center,
        radius: 5, // 5km 반경
        limit: 50,
        category: category && category !== 'all' ? category as any : undefined
      });

      setStudios(studiosData);
    } catch (error) {
      console.error('스튜디오 데이터 로딩 실패:', error);
      setStudios([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    loadStudios(mapCenter);
  }, [loadStudios, mapCenter]);

  // 지도 중심 변경 핸들러
  const handleMapCenterChanged = useCallback((center: KakaoLatLng) => {
    setMapCenter(center);
  }, []);

  // 지도 중심 변경 시 스튜디오 재검색 (디바운싱)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudios(mapCenter, currentCategory);
    }, 1000); // 1초 지연

    return () => clearTimeout(timeoutId);
  }, [mapCenter, loadStudios, currentCategory]);

  // 스튜디오 선택 핸들러
  const handleStudioSelect = useCallback((studio: Studio) => {
    setSelectedStudio(studio);
  }, []);

  // 팝업 닫기 핸들러
  const handlePopupClose = useCallback(() => {
    setSelectedStudio(null);
  }, []);

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback((category: string) => {
    setCurrentCategory(category);
    loadStudios(mapCenter, category);
  }, [loadStudios, mapCenter]);

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
          <CardContent className="p-0 relative">
            <Map
              height="320px"
              className="w-full"
              onMapCreated={(map) => {
                console.log('카카오맵이 생성되었습니다:', map);
              }}
              onCenterChanged={handleMapCenterChanged}
              studios={studios}
              selectedStudioId={selectedStudio?.id}
              onStudioSelect={handleStudioSelect}
            />

            {/* 로딩 오버레이 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600">스튜디오를 검색 중...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Badge
            variant={currentCategory === 'all' ? 'category' : 'outline'}
            className="whitespace-nowrap cursor-pointer"
            onClick={() => handleCategoryChange('all')}
          >
            전체 ({studios.length})
          </Badge>
          <Badge
            variant={currentCategory === 'studio' ? 'category' : 'outline'}
            className="whitespace-nowrap cursor-pointer"
            onClick={() => handleCategoryChange('studio')}
          >
            스튜디오
          </Badge>
          <Badge
            variant={currentCategory === 'practice_room' ? 'category' : 'outline'}
            className="whitespace-nowrap cursor-pointer"
            onClick={() => handleCategoryChange('practice_room')}
          >
            연습실
          </Badge>
          <Badge
            variant={currentCategory === 'club' ? 'category' : 'outline'}
            className="whitespace-nowrap cursor-pointer"
            onClick={() => handleCategoryChange('club')}
          >
            클럽/파티
          </Badge>
          <Button variant="secondary" size="sm" className="ml-auto">
            <Filter className="h-4 w-4 mr-1" />
            리스트뷰
          </Button>
        </div>

        {/* Location List */}
        <div className="space-y-4">
          {studios.length === 0 && !isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">주변에 스튜디오가 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">지도를 이동해서 다른 지역을 탐색해보세요.</p>
              </CardContent>
            </Card>
          ) : (
            studios.slice(0, 10).map((studio) => (
              <Card
                key={studio.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedStudio?.id === studio.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleStudioSelect(studio)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{studio.name}</h3>
                        <Badge variant="status" color="secondary" className="text-xs">
                          {studio.category === 'studio' ? '스튜디오' :
                           studio.category === 'practice_room' ? '연습실' :
                           studio.category === 'club' ? '클럽' : studio.category}
                        </Badge>
                        {studio.metadata.verified && (
                          <Badge variant="status" color="success" className="text-xs">
                            인증
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{studio.location.region}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{studio.stats.avgRating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{studio.stats.favorites}명 즐겨찾기</span>
                        </div>
                      </div>
                      {studio.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {studio.description}
                        </p>
                      )}
                    </div>
                    <Button variant="secondary" size="sm">
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* 더보기 버튼 */}
          {studios.length > 10 && (
            <div className="text-center">
              <Button variant="secondary" className="w-full">
                더 많은 스튜디오 보기 ({studios.length - 10}개 더)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 스튜디오 정보 팝업 */}
      <StudioPopup
        studio={selectedStudio}
        isVisible={!!selectedStudio}
        onClose={handlePopupClose}
      />
    </div>
  );
}