'use client';

import React from 'react';
import { Studio, STUDIO_CATEGORIES } from '@/lib/types/studio';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Star } from 'lucide-react';

interface StudioCardProps {
  studio: Studio;
  isSelected?: boolean;
  onClick?: (studio: Studio) => void;
  showDetailsButton?: boolean;
  searchQuery?: string;
  className?: string;
}

// 검색어 하이라이팅 함수
const highlightSearchQuery = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const StudioCard: React.FC<StudioCardProps> = ({
  studio,
  isSelected = false,
  onClick,
  showDetailsButton = true,
  searchQuery = '',
  className = '',
}) => {
  const handleCardClick = () => {
    onClick?.(studio);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(studio);
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">
                {highlightSearchQuery(studio.name, searchQuery)}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {STUDIO_CATEGORIES[studio.category]}
              </Badge>
              {studio.metadata.verified && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  인증
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{highlightSearchQuery(studio.location.region, searchQuery)}</span>
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

            {/* 주소 정보 */}
            <div className="text-sm text-gray-500 mb-2">
              {highlightSearchQuery(studio.location.address, searchQuery)}
            </div>

            {/* 설명 */}
            {studio.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {highlightSearchQuery(studio.description, searchQuery)}
              </p>
            )}

            {/* 시설 정보 (간단히) */}
            {studio.facilities && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                {studio.facilities.area && (
                  <span>{studio.facilities.area}m²</span>
                )}
                {studio.facilities.capacity && (
                  <span>•</span>
                )}
                {studio.facilities.capacity && (
                  <span>최대 {studio.facilities.capacity}명</span>
                )}
                {studio.facilities.parking && (
                  <>
                    <span>•</span>
                    <span>주차가능</span>
                  </>
                )}
                {studio.facilities.soundSystem && (
                  <>
                    <span>•</span>
                    <span>음향시설</span>
                  </>
                )}
              </div>
            )}
          </div>

          {showDetailsButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetailsClick}
            >
              상세보기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudioCard;