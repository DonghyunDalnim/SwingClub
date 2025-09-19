'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Settings } from 'lucide-react';
import { Studio } from '@/lib/types/studio';
import { searchStudiosByLocation } from '@/lib/actions/studios';
import { KakaoLatLng } from '@/lib/types/kakao-map';
import { DEFAULT_CENTER } from '@/lib/kakao-map';
import StudioPopup from '@/components/location/StudioPopup';
import ViewToggle, { ViewMode } from '@/components/location/ViewToggle';
import SearchInput from '@/components/location/SearchInput';
import StudioFilter from '@/components/location/StudioFilter';
import StudioList from '@/components/location/StudioList';

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
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // 뷰 모드 변경 핸들러
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // 검색어 변경 핸들러
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 필터링된 스튜디오 목록 계산
  const filteredStudios = useMemo(() => {
    let filtered = studios;

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (studio) =>
          studio.name.toLowerCase().includes(query) ||
          studio.location.address.toLowerCase().includes(query) ||
          studio.location.region.toLowerCase().includes(query) ||
          (studio.description && studio.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [studios, searchQuery]);

  // 카테고리별 스튜디오 개수 계산
  const studioCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredStudios.forEach((studio) => {
      counts[studio.category] = (counts[studio.category] || 0) + 1;
    });
    return counts;
  }, [filteredStudios]);

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
            <Settings className="h-6 w-6" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 검색 및 뷰 토글 */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchQueryChange}
              placeholder="스튜디오명 또는 주소로 검색"
            />
          </div>
          <ViewToggle
            currentView={viewMode}
            onViewChange={handleViewModeChange}
          />
        </div>

        {/* 필터 */}
        <StudioFilter
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
          studioCounts={studioCounts}
        />

        {/* 지도뷰 */}
        {viewMode === 'map' && (
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
              <Map
                height="320px"
                className="w-full"
                onMapCreated={(map) => {
                  console.log('카카오맵이 생성되었습니다:', map);
                }}
                onCenterChanged={handleMapCenterChanged}
                studios={filteredStudios}
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
        )}

        {/* 리스트뷰 */}
        {viewMode === 'list' && (
          <StudioList
            studios={filteredStudios}
            selectedStudioId={selectedStudio?.id}
            onStudioSelect={handleStudioSelect}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        )}
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