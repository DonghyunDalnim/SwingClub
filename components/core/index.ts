// Core UI Components Export
export { Button } from './Button';
export type { ButtonProps } from './Button';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from './Card';
export type { CardProps } from './Card';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { default as SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

export {
  default as Typography,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Body,
  Small
} from './Typography';
export type { TypographyProps } from './Typography';

export { default as Map } from './Map';
export type { KakaoMapProps } from '@/lib/types/kakao-map';

export {
  default as Carousel,
  CarouselItem
} from './Carousel';
export type { CarouselProps, CarouselItemProps } from './Carousel';

export {
  OptimizedImage,
  generateAltText
} from './OptimizedImage';
export type { OptimizedImageProps, ImageAltTextOptions } from './OptimizedImage';

export {
  Avatar,
  AvatarGroup
} from './Avatar';
export type { AvatarProps, AvatarGroupProps } from './Avatar';
export {
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  LoadingDots,
  LoadingPulse
} from './LoadingSpinner';
export type { LoadingSpinnerProps, LoadingOverlayProps, LoadingButtonProps } from './LoadingSpinner';

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonProductCard,
  SkeletonPostCard,
  SkeletonList,
  SkeletonGrid
} from './Skeleton';
export type { SkeletonProps, SkeletonTextProps, SkeletonListProps, SkeletonGridProps } from './Skeleton';

export {
  EmptyState,
  EmptySearch,
  EmptyPosts,
  EmptyProducts,
  EmptyMessages,
  EmptyFavorites,
  EmptyNotifications,
  ErrorState
} from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';
