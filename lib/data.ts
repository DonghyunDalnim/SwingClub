export interface Space {
  id: string;
  title: string;
  category: string;
  requests: number;
  rating: number;
  tags: string[];
  rank?: number;
}

export const spaces: Space[] = [
  {
    id: '1',
    title: '린디팝 레슨',
    category: '레슨',
    requests: 255555,
    rating: 4.9,
    tags: ['린디홉', '강남', '주말'],
    rank: 1
  },
  {
    id: '2',
    title: '스윙 파티',
    category: '파티',
    requests: 123456,
    rating: 4.8,
    tags: ['주말', '홍대', '라이브밴드']
  },
  {
    id: '3',
    title: '댄스 파트너 찾기',
    category: '매칭',
    requests: 98765,
    rating: 4.7,
    tags: ['초보환영', '강남', '평일']
  },
  {
    id: '4',
    title: '댄스화 판매',
    category: '용품',
    requests: 54321,
    rating: 4.9,
    tags: ['새상품', '배송가능', '협상가능']
  }
];

export const stories = [
  {
    id: '1',
    title: '스윙댄스 처음 시작하는 분들을 위한 완벽 가이드',
    excerpt:
      '스윙댄스를 처음 시작하려는 분들을 위해 준비했습니다. 기초부터 차근차근 배워나가는 방법을 알려드립니다.',
    author: '김스윙',
    date: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
    readTime: '5분',
  },
  {
    id: '2',
    title: '강남 스윙댄스 파티 후기 - 200명이 함께한 열기',
    excerpt:
      '지난 주말 강남에서 열린 대규모 스윙댄스 파티에 다녀왔습니다. 200명이 넘는 댄서들이 함께한 뜨거운 현장을 공유합니다.',
    author: '이재즈',
    date: '2024-01-12',
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800',
    readTime: '7분',
  },
  {
    id: '3',
    title: '초보자가 알아야 할 스윙댄스 에티켓 10가지',
    excerpt:
      '스윙댄스를 시작하면서 알아두면 좋은 기본 에티켓들을 정리했습니다. 함께 춤추는 파트너를 배려하는 마음이 가장 중요합니다.',
    author: '박린디',
    date: '2024-01-10',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
    readTime: '4분',
  },
];
