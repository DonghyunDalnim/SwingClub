# 🎨 Swing Connect Design System

숨고 테마를 기반으로 한 중앙화된 디자인 시스템 컴포넌트 라이브러리입니다.

## 📁 구조

```
components/
├── core/           # 기본 UI 컴포넌트
├── layout/         # 레이아웃 컴포넌트
├── navigation/     # 네비게이션 컴포넌트
└── README.md       # 이 파일
```

## 🎯 핵심 개념

### 1. **테마 중심 설계**
- 모든 컴포넌트는 `@/lib/theme.ts`의 숨고 테마를 기반으로 구성
- 일관된 색상, 타이포그래피, 간격 시스템 적용

### 2. **중앙화된 관리**
- 디자인 토큰과 스타일 함수는 `@/lib/design-tokens.ts`에서 관리
- 컴포넌트는 props를 통한 유연한 커스터마이징 지원

### 3. **타입 안전성**
- TypeScript 기반으로 완전한 타입 지원
- 프롭스 유효성 검사와 IntelliSense 지원

## 🧩 Core Components

### Button
```tsx
import { Button } from '@/components/core';

// 기본 사용법
<Button variant="primary">클릭하세요</Button>
<Button variant="secondary" size="sm">작은 버튼</Button>
<Button variant="ghost" loading>로딩 중...</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `fullWidth`: boolean

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/core';

<Card variant="default">
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
  </CardHeader>
  <CardContent>
    카드 내용
  </CardContent>
</Card>
```

**Props:**
- `variant`: 'default' | 'service' | 'portfolio'
- `hoverable`: boolean (기본값: true)
- `clickable`: boolean

### Badge
```tsx
import { Badge } from '@/components/core';

<Badge variant="rating">4.9</Badge>
<Badge variant="category">카테고리</Badge>
<Badge variant="outline" color="success">성공</Badge>
```

**Props:**
- `variant`: 'rating' | 'category' | 'status' | 'outline'
- `color`: 'primary' | 'secondary' | 'success' | 'warning' | 'error'

### Typography
```tsx
import { Typography, Heading1, Heading2, Body } from '@/components/core';

<Typography variant="h1">큰 제목</Typography>
<Heading2>섹션 제목</Heading2>
<Body>본문 텍스트</Body>
```

**Props:**
- `variant`: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small'
- `as`: HTML 태그 오버라이드

### SearchInput
```tsx
import { SearchInput } from '@/components/core';

<SearchInput
  placeholder="검색어를 입력하세요"
  onSearch={(value) => console.log(value)}
  showIcon={true}
/>
```

## 📐 Layout Components

### Container
```tsx
import { Container } from '@/components/layout';

<Container size="lg" padding={true}>
  컨텐츠
</Container>
```

### Section
```tsx
import { Section } from '@/components/layout';

<Section spacing="md" background="white">
  섹션 내용
</Section>
```

### Flex
```tsx
import { Flex } from '@/components/layout';

<Flex direction="row" justify="between" align="center" gap="md">
  <div>왼쪽</div>
  <div>오른쪽</div>
</Flex>
```

### Grid
```tsx
import { Grid } from '@/components/layout';

<Grid cols={3} gap="md" responsive={true}>
  <div>아이템 1</div>
  <div>아이템 2</div>
  <div>아이템 3</div>
</Grid>
```

## 🎨 테마 시스템

### 색상 사용법
```tsx
import { theme } from '@/lib/theme';

// 인라인 스타일로 테마 색상 사용
<div style={{ color: theme.colors.primary.main }}>
  텍스트
</div>

// CSS 클래스와 함께 사용
<div className="p-4" style={{ backgroundColor: theme.colors.neutral.background }}>
  배경
</div>
```

### 디자인 토큰 활용
```tsx
import { createButtonStyle, createCardStyle } from '@/lib/design-tokens';

// 커스텀 컴포넌트에서 스타일 함수 사용
<div className={createButtonStyle('primary')}>
  커스텀 버튼
</div>
```

## 📝 사용 예시

### 완전한 홈페이지 섹션
```tsx
import { Card, CardHeader, CardTitle, CardContent, Button, Typography } from '@/components/core';
import { Container, Section, Flex, Grid } from '@/components/layout';
import { theme } from '@/lib/theme';

function HomeSection() {
  return (
    <Container>
      <Section spacing="lg">
        <Card
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.accent.blue})`,
            border: 'none'
          }}
          className="text-white text-center"
        >
          <CardHeader>
            <Typography variant="h2" className="text-white">
              Welcome to Swing Connect
            </Typography>
          </CardHeader>
          <CardContent>
            <Flex justify="center" gap="md">
              <Button variant="secondary">시작하기</Button>
              <Button variant="ghost">더 알아보기</Button>
            </Flex>
          </CardContent>
        </Card>

        <Grid cols={2} gap="md">
          <Card>
            <CardHeader>
              <CardTitle>
                <Typography variant="h4">기능 1</Typography>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body">설명...</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Typography variant="h4">기능 2</Typography>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body">설명...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Section>
    </Container>
  );
}
```

## 🔧 커스터마이징

### 새로운 variant 추가
컴포넌트에 새로운 스타일 variant를 추가하려면:

1. `@/lib/design-tokens.ts`에서 스타일 함수 확장
2. 컴포넌트의 props 타입 업데이트
3. 스타일 로직에 새 variant 추가

### 테마 색상 수정
`@/lib/theme.ts`에서 색상 값을 수정하면 모든 컴포넌트에 자동 반영됩니다.

## 📚 추가 리소스

- **테마 파일**: `@/lib/theme.ts`
- **디자인 토큰**: `@/lib/design-tokens.ts`
- **타입 정의**: 각 컴포넌트 파일의 interface
- **사용 예시**: `app/home/page.tsx`

## 🎯 베스트 프랙티스

1. **일관성**: 항상 디자인 시스템 컴포넌트 사용
2. **타입 안전성**: TypeScript 타입 활용
3. **접근성**: aria 라벨과 키보드 네비게이션 고려
4. **성능**: 불필요한 리렌더링 방지
5. **재사용성**: 컴포넌트를 조합하여 복잡한 UI 구성