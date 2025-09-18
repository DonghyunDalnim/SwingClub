'use client';

import React from 'react';
import { StudioCategory, STUDIO_CATEGORIES } from '@/lib/types/studio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface StudioFilterProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  studioCounts?: Record<string, number>;
  className?: string;
}

const FILTER_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'studio', label: '스튜디오' },
  { key: 'practice_room', label: '연습실' },
  { key: 'club', label: '클럽/파티' },
  { key: 'public_space', label: '공공장소' },
  { key: 'cafe', label: '카페' },
] as const;

export const StudioFilter: React.FC<StudioFilterProps> = ({
  currentCategory,
  onCategoryChange,
  studioCounts = {},
  className = '',
}) => {
  const getTotalCount = () => {
    return Object.values(studioCounts).reduce((sum, count) => sum + count, 0);
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') {
      return getTotalCount();
    }
    return studioCounts[category] || 0;
  };

  const hasActiveFilter = currentCategory !== 'all';

  const handleClearFilter = () => {
    onCategoryChange('all');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">카테고리</h4>
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            필터 초기화
          </Button>
        )}
      </div>

      {/* 카테고리 필터 버튼들 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {FILTER_CATEGORIES.map((category) => {
          const count = getCategoryCount(category.key);
          const isActive = currentCategory === category.key;

          return (
            <Badge
              key={category.key}
              variant={isActive ? 'default' : 'outline'}
              className={`whitespace-nowrap cursor-pointer transition-all hover:shadow-sm ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => onCategoryChange(category.key)}
            >
              {category.label}
              {count > 0 && (
                <span className={`ml-1 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                  ({count})
                </span>
              )}
            </Badge>
          );
        })}
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilter && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>적용된 필터:</span>
          <Badge variant="secondary" className="text-xs">
            {FILTER_CATEGORIES.find(cat => cat.key === currentCategory)?.label}
            <button
              onClick={handleClearFilter}
              className="ml-1 hover:text-gray-800"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default StudioFilter;