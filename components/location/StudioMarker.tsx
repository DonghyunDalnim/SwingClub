'use client';

import { useEffect, useRef } from 'react';
import { Studio, StudioCategory } from '@/lib/types/studio';
import { geoPointToKakao } from '@/lib/utils/geo';
import { KakaoLatLng } from '@/lib/types/kakao-map';

interface StudioMarkerProps {
  studio: Studio;
  map: any;
  isSelected: boolean;
  onClick: (studio: Studio) => void;
}

// 스튜디오 카테고리별 마커 이미지 URL
const getMarkerImageUrl = (category: StudioCategory, isSelected: boolean = false): string => {
  const baseUrl = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker';

  if (isSelected) {
    return `${baseUrl}_red.png`;
  }

  // 카테고리별 마커 색상 구분
  switch (category) {
    case 'studio':
      return `${baseUrl}.png`; // 빨간색 (기본)
    case 'practice_room':
      return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'; // 노란색 별
    case 'club':
      return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'; // 빨간색
    case 'public_space':
      return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png'; // 파란색
    case 'cafe':
      return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'; // 빨간색
    default:
      return `${baseUrl}.png`;
  }
};

// 마커 이미지 크기
const MARKER_SIZE = { width: 24, height: 35 };

export const StudioMarker: React.FC<StudioMarkerProps> = ({
  studio,
  map,
  isSelected,
  onClick,
}) => {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !window.kakao || !studio) return;

    // 스튜디오 좌표를 카카오맵 좌표로 변환
    const position = geoPointToKakao(studio.location.geopoint);

    // 마커 이미지 설정
    const imageSrc = getMarkerImageUrl(studio.category, isSelected);
    const imageSize = new window.kakao.maps.Size(MARKER_SIZE.width, MARKER_SIZE.height);
    const imageOption = { offset: new window.kakao.maps.Point(12, 35) }; // 마커 중심점 설정

    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    // 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(position.lat, position.lng),
      image: markerImage,
      title: studio.name,
      clickable: true,
      zIndex: isSelected ? 10 : 1, // 선택된 마커를 위로
    });

    // 마커를 지도에 표시
    marker.setMap(map);

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      onClick(studio);
    });

    markerRef.current = marker;

    // 정리 함수
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [map, studio, onClick]);

  // 선택 상태 변경 시 마커 이미지 업데이트
  useEffect(() => {
    if (!markerRef.current || !window.kakao) return;

    const imageSrc = getMarkerImageUrl(studio.category, isSelected);
    const imageSize = new window.kakao.maps.Size(MARKER_SIZE.width, MARKER_SIZE.height);
    const imageOption = { offset: new window.kakao.maps.Point(12, 35) };

    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
    markerRef.current.setImage(markerImage);
    markerRef.current.setZIndex(isSelected ? 10 : 1);
  }, [isSelected, studio.category]);

  // 이 컴포넌트는 실제 DOM을 렌더링하지 않음
  return null;
};

export default StudioMarker;