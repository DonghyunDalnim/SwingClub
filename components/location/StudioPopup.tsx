'use client';

import React from 'react';
import { Studio, STUDIO_CATEGORIES } from '@/lib/types/studio';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/core';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Star,
  Users,
  Wifi,
  Car,
  Music,
  Snowflake,
  ShowerHead,
  Lock,
  Clock
} from 'lucide-react';

interface StudioPopupProps {
  studio: Studio | null;
  isVisible: boolean;
  onClose: () => void;
}

export const StudioPopup: React.FC<StudioPopupProps> = ({
  studio,
  isVisible,
  onClose,
}) => {
  if (!isVisible || !studio) {
    return null;
  }

  const formatOperatingHours = (hours: any) => {
    if (!hours) return '운영시간 정보 없음';

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

    const todayHours = days.map((day, index) => {
      const time = hours[day];
      if (!time || time === 'closed') return null;
      return `${dayNames[index]}: ${time}`;
    }).filter(Boolean);

    return todayHours.length > 0 ? todayHours.slice(0, 2).join(', ') : '운영시간 정보 없음';
  };

  const formatPrice = (pricing: any) => {
    if (!pricing) return null;

    const prices = [];
    if (pricing.hourly) prices.push(`시간당 ${pricing.hourly.toLocaleString()}원`);
    if (pricing.daily) prices.push(`일일 ${pricing.daily.toLocaleString()}원`);
    if (pricing.monthly) prices.push(`월간 ${pricing.monthly.toLocaleString()}원`);
    if (pricing.dropIn) prices.push(`드롭인 ${pricing.dropIn.toLocaleString()}원`);

    return prices.length > 0 ? prices.slice(0, 2).join(', ') : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 팝업 컨테이너 */}
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden">
        <Card className="w-full">
          <CardHeader className="relative pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {studio.name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {STUDIO_CATEGORIES[studio.category]}
                  </Badge>
                  {studio.metadata.verified && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      인증완료
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{studio.stats.avgRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{studio.stats.favorites}명 즐겨찾기</span>
                  </div>
                </div>
              </div>

              {/* 닫기 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* 주소 정보 */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{studio.location.address}</p>
                  {studio.location.addressDetail && (
                    <p className="text-gray-600">{studio.location.addressDetail}</p>
                  )}
                  {studio.location.subway && studio.location.subway.length > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      지하철: {studio.location.subway.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 설명 */}
            {studio.description && (
              <div className="text-sm text-gray-700">
                <p className="line-clamp-3">{studio.description}</p>
              </div>
            )}

            {/* 시설 정보 */}
            {studio.facilities && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">시설 정보</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {studio.facilities.area && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>{studio.facilities.area}m² 면적</span>
                    </div>
                  )}
                  {studio.facilities.capacity && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-500" />
                      <span>최대 {studio.facilities.capacity}명</span>
                    </div>
                  )}
                </div>

                {/* 편의시설 아이콘 */}
                <div className="flex items-center gap-3 mt-2">
                  {studio.facilities.soundSystem && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Music className="h-3 w-3" />
                      <span>음향</span>
                    </div>
                  )}
                  {studio.facilities.airConditioning && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Snowflake className="h-3 w-3" />
                      <span>에어컨</span>
                    </div>
                  )}
                  {studio.facilities.parking && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Car className="h-3 w-3" />
                      <span>주차</span>
                    </div>
                  )}
                  {studio.facilities.wifi && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Wifi className="h-3 w-3" />
                      <span>WiFi</span>
                    </div>
                  )}
                  {studio.facilities.shower && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <ShowerHead className="h-3 w-3" />
                      <span>샤워실</span>
                    </div>
                  )}
                  {studio.facilities.lockers && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Lock className="h-3 w-3" />
                      <span>사물함</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 가격 정보 */}
            {studio.pricing && formatPrice(studio.pricing) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">가격 정보</h4>
                <p className="text-sm text-gray-700">{formatPrice(studio.pricing)}</p>
                {studio.pricing.notes && (
                  <p className="text-xs text-gray-500">{studio.pricing.notes}</p>
                )}
              </div>
            )}

            {/* 운영시간 */}
            {studio.operatingHours && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  운영시간
                </h4>
                <p className="text-sm text-gray-700">{formatOperatingHours(studio.operatingHours)}</p>
                {studio.operatingHours.notes && (
                  <p className="text-xs text-gray-500">{studio.operatingHours.notes}</p>
                )}
              </div>
            )}

            {/* 연락처 정보 */}
            {studio.contact && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">연락처</h4>
                <div className="space-y-1">
                  {studio.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <a
                        href={`tel:${studio.contact.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {studio.contact.phone}
                      </a>
                    </div>
                  )}
                  {studio.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-gray-500" />
                      <a
                        href={studio.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        웹사이트 방문
                      </a>
                    </div>
                  )}
                  {studio.contact.kakaoTalk && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-3 h-3 bg-yellow-400 rounded" />
                      <span>카톡: {studio.contact.kakaoTalk}</span>
                    </div>
                  )}
                  {studio.contact.booking && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(studio.contact!.booking, '_blank')}
                      >
                        예약하기
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudioPopup;