'use client';

import React, { useState } from 'react';
import { Studio } from '@/lib/types/studio';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudioCard from './StudioCard';

interface StudioListProps {
  studios: Studio[];
  selectedStudioId?: string;
  onStudioSelect?: (studio: Studio) => void;
  isLoading?: boolean;
  searchQuery?: string;
  className?: string;
  itemsPerPage?: number;
}

export const StudioList: React.FC<StudioListProps> = ({
  studios,
  selectedStudioId,
  onStudioSelect,
  isLoading = false,
  searchQuery = '',
  className = '',
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지네이션 계산
  const totalPages = Math.ceil(studios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudios = studios.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 빈 상태
  if (studios.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="text-4xl">🏢</div>
              <h3 className="font-semibold text-gray-900">스튜디오가 없습니다</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `'${searchQuery}' 검색 결과가 없습니다. 다른 검색어를 시도해보세요.`
                  : '현재 선택된 조건에 맞는 스튜디오가 없습니다.'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                지도를 이동하거나 필터 조건을 변경해보세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 결과 요약 */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          총 {studios.length}개 스튜디오
          {searchQuery && ` (검색: ${searchQuery})`}
        </span>
        {totalPages > 1 && (
          <span>
            {currentPage} / {totalPages} 페이지
          </span>
        )}
      </div>

      {/* 스튜디오 카드 목록 */}
      <div className="space-y-4">
        {currentStudios.map((studio) => (
          <StudioCard
            key={studio.id}
            studio={studio}
            isSelected={studio.id === selectedStudioId}
            onClick={onStudioSelect}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            이전
          </Button>

          <div className="flex items-center space-x-1">
            {/* 페이지 번호들 */}
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            다음
          </Button>
        </div>
      )}

      {/* 더 많은 결과가 있을 때 안내 */}
      {studios.length >= 50 && (
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>더 정확한 결과를 위해 검색어나 필터를 사용해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default StudioList;