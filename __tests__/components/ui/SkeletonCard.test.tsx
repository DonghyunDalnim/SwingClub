import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')
}));

describe('SkeletonCard', () => {
  describe('Basic Rendering and Default Behavior', () => {
    test('renders with default post type when no type specified', () => {
      render(<SkeletonCard />);

      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading marketplace item')).not.toBeInTheDocument();
    });

    test('renders with explicit post type', () => {
      render(<SkeletonCard type="post" />);

      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading marketplace item')).not.toBeInTheDocument();
    });

    test('renders with marketplace-item type', () => {
      render(<SkeletonCard type="marketplace-item" />);

      expect(screen.getByLabelText('Loading marketplace item')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading post')).not.toBeInTheDocument();
    });

    test('does not render both types simultaneously', () => {
      const { rerender } = render(<SkeletonCard type="post" />);
      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading marketplace item')).not.toBeInTheDocument();

      rerender(<SkeletonCard type="marketplace-item" />);
      expect(screen.getByLabelText('Loading marketplace item')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading post')).not.toBeInTheDocument();
    });
  });

  describe('Post Type Structure and Elements', () => {
    test('has correct container classes for post type', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      expect(container).toHaveClass(
        'bg-white',
        'border',
        'border-[#EFF1F5]',
        'rounded-xl',
        'p-4',
        'shadow-sm',
        'space-y-4'
      );
    });

    test('renders correct number of skeleton elements for post type', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      const skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      // Post type should have 11 skeleton elements:
      // 1. 카테고리, 2. 시간, 3. 제목, 4-5. 내용 2줄, 6. 아바타, 7-8. 작성자 정보 2개, 9-11. 통계 3개
      expect(skeletonElements).toHaveLength(11);
    });

    test('post type has proper layout structure', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');

      // Check for header section with category and time
      const headerElements = container.querySelectorAll('.flex.items-center.justify-between');
      expect(headerElements.length).toBeGreaterThanOrEqual(2);

      // Check for content area with space-y-2
      const contentArea = container.querySelector('.space-y-2');
      expect(contentArea).toBeInTheDocument();

      // Check for avatar with rounded-full class
      const avatarElements = container.querySelectorAll('.h-8.w-8.rounded-full');
      expect(avatarElements).toHaveLength(1);
    });

    test('post type has category badge with rounded-full class', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      const categoryBadge = container.querySelector('.h-6.w-16.rounded-full');
      expect(categoryBadge).toBeInTheDocument();
    });
  });

  describe('Marketplace Item Type Structure and Elements', () => {
    test('has correct container classes for marketplace-item type', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      expect(container).toHaveClass(
        'bg-white',
        'border',
        'border-[#EFF1F5]',
        'rounded-xl',
        'p-4',
        'shadow-sm'
      );
      // Should NOT have space-y-4 unlike post type
      expect(container).not.toHaveClass('space-y-4');
    });

    test('renders correct number of skeleton elements for marketplace-item type', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      // Marketplace-item type should have 9 skeleton elements:
      // 1. 이미지, 2. 제목, 3. 배지, 4-6. 판매자 정보 3개, 7. 설명, 8. 가격, 9. 시간
      expect(skeletonElements).toHaveLength(9);
    });

    test('marketplace-item has main flex layout', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const flexContainer = container.querySelector('.flex.space-x-4');
      expect(flexContainer).toBeInTheDocument();
    });

    test('marketplace-item has image skeleton with correct dimensions', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const imageSkeletons = container.querySelectorAll('.w-20.h-20.rounded-lg.flex-shrink-0');
      expect(imageSkeletons).toHaveLength(1);
    });

    test('marketplace-item has exactly 2 rounded-full badge elements', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const roundedFullElements = container.querySelectorAll('.rounded-full');
      expect(roundedFullElements).toHaveLength(2);
    });

    test('marketplace-item has seller info section', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const sellerInfoSection = container.querySelector('.flex.items-center.space-x-2');
      expect(sellerInfoSection).toBeInTheDocument();
    });
  });

  describe('Background Color Testing (#EFF1F5)', () => {
    test('all skeleton elements have correct background color #EFF1F5', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      const skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      skeletonElements.forEach(element => {
        expect(element).toHaveClass('bg-[#EFF1F5]');
      });
    });

    test('marketplace-item skeleton elements have correct background color #EFF1F5', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      skeletonElements.forEach(element => {
        expect(element).toHaveClass('bg-[#EFF1F5]');
      });
    });

    test('background color is consistent across all skeleton elements', () => {
      const { rerender } = render(<SkeletonCard type="post" />);

      let container = screen.getByLabelText('Loading post');
      let skeletonElements = container.querySelectorAll('[aria-busy="true"]');
      const postElementsWithBg = Array.from(skeletonElements).filter(el =>
        el.classList.contains('bg-[#EFF1F5]')
      );
      expect(postElementsWithBg).toHaveLength(skeletonElements.length);

      rerender(<SkeletonCard type="marketplace-item" />);
      container = screen.getByLabelText('Loading marketplace item');
      skeletonElements = container.querySelectorAll('[aria-busy="true"]');
      const marketplaceElementsWithBg = Array.from(skeletonElements).filter(el =>
        el.classList.contains('bg-[#EFF1F5]')
      );
      expect(marketplaceElementsWithBg).toHaveLength(skeletonElements.length);
    });
  });

  describe('Animation Testing (animate-pulse)', () => {
    test('all skeleton elements have animate-pulse class', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      const skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      skeletonElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse');
      });
    });

    test('marketplace-item skeleton elements have animate-pulse animation', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      skeletonElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse');
      });
    });

    test('animation classes are applied consistently', () => {
      const { rerender } = render(<SkeletonCard type="post" />);

      let animatedElements = screen.getAllByLabelText('Loading post')[0].querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);

      rerender(<SkeletonCard type="marketplace-item" />);
      animatedElements = screen.getAllByLabelText('Loading marketplace item')[0].querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Testing (aria-label, aria-busy)', () => {
    test('post type has correct aria-label', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      expect(container).toHaveAttribute('aria-label', 'Loading post');
    });

    test('marketplace-item type has correct aria-label', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      expect(container).toHaveAttribute('aria-label', 'Loading marketplace item');
    });

    test('all skeleton boxes have aria-busy="true" attribute', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      const busyElements = container.querySelectorAll('[aria-busy="true"]');

      busyElements.forEach(element => {
        expect(element).toHaveAttribute('aria-busy', 'true');
      });
      expect(busyElements.length).toBeGreaterThan(0);
    });

    test('marketplace-item skeleton boxes have aria-busy="true" attribute', () => {
      render(<SkeletonCard type="marketplace-item" />);

      const container = screen.getByLabelText('Loading marketplace item');
      const busyElements = container.querySelectorAll('[aria-busy="true"]');

      busyElements.forEach(element => {
        expect(element).toHaveAttribute('aria-busy', 'true');
      });
      expect(busyElements.length).toBeGreaterThan(0);
    });

    test('aria-label values are type-specific and descriptive', () => {
      const { rerender } = render(<SkeletonCard type="post" />);
      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();

      rerender(<SkeletonCard type="marketplace-item" />);
      expect(screen.getByLabelText('Loading marketplace item')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName Application', () => {
    test('applies custom className to post type', () => {
      render(<SkeletonCard className="custom-post-class" />);

      const container = screen.getByLabelText('Loading post');
      expect(container).toHaveClass('custom-post-class');
    });

    test('applies custom className to marketplace-item type', () => {
      render(<SkeletonCard type="marketplace-item" className="custom-marketplace-class" />);

      const container = screen.getByLabelText('Loading marketplace item');
      expect(container).toHaveClass('custom-marketplace-class');
    });

    test('merges custom className with default classes for post type', () => {
      render(<SkeletonCard type="post" className="my-custom-class" />);

      const container = screen.getByLabelText('Loading post');
      expect(container).toHaveClass('my-custom-class');
      expect(container).toHaveClass('bg-white');
      expect(container).toHaveClass('border-[#EFF1F5]');
      expect(container).toHaveClass('space-y-4');
    });

    test('merges custom className with default classes for marketplace-item type', () => {
      render(<SkeletonCard type="marketplace-item" className="another-custom-class" />);

      const container = screen.getByLabelText('Loading marketplace item');
      expect(container).toHaveClass('another-custom-class');
      expect(container).toHaveClass('bg-white');
      expect(container).toHaveClass('border-[#EFF1F5]');
    });

    test('handles undefined className gracefully', () => {
      render(<SkeletonCard className={undefined} />);

      const container = screen.getByLabelText('Loading post');
      expect(container).toHaveClass('bg-white');
    });
  });

  describe('Type-Specific Structure Differences', () => {
    test('post type has vertical spacing (space-y-4) while marketplace-item does not', () => {
      const { rerender } = render(<SkeletonCard type="post" />);
      let container = screen.getByLabelText('Loading post');
      expect(container).toHaveClass('space-y-4');

      rerender(<SkeletonCard type="marketplace-item" />);
      container = screen.getByLabelText('Loading marketplace item');
      expect(container).not.toHaveClass('space-y-4');
    });

    test('marketplace-item has horizontal layout (flex space-x-4) while post type has vertical sections', () => {
      const { rerender } = render(<SkeletonCard type="marketplace-item" />);
      let container = screen.getByLabelText('Loading marketplace item');
      let flexContainer = container.querySelector('.flex.space-x-4');
      expect(flexContainer).toBeInTheDocument();

      rerender(<SkeletonCard type="post" />);
      container = screen.getByLabelText('Loading post');
      // Post type should not have the same flex space-x-4 structure
      expect(container).toHaveClass('space-y-4');
    });

    test('post type has more skeleton elements than marketplace-item type', () => {
      const { rerender } = render(<SkeletonCard type="post" />);
      let container = screen.getByLabelText('Loading post');
      let postSkeletonElements = container.querySelectorAll('[aria-busy="true"]');

      rerender(<SkeletonCard type="marketplace-item" />);
      container = screen.getByLabelText('Loading marketplace item');
      let marketplaceSkeletonElements = container.querySelectorAll('[aria-busy="true"]');

      expect(postSkeletonElements.length).toBeGreaterThan(marketplaceSkeletonElements.length);
      expect(postSkeletonElements).toHaveLength(11);
      expect(marketplaceSkeletonElements).toHaveLength(9);
    });

    test('skeleton element sizes and shapes differ between types', () => {
      const { rerender } = render(<SkeletonCard type="post" />);
      let container = screen.getByLabelText('Loading post');
      let avatarElements = container.querySelectorAll('.h-8.w-8.rounded-full');
      expect(avatarElements).toHaveLength(1);

      rerender(<SkeletonCard type="marketplace-item" />);
      container = screen.getByLabelText('Loading marketplace item');
      let imageElements = container.querySelectorAll('.w-20.h-20');
      expect(imageElements).toHaveLength(1);
    });
  });

  describe('Consistent Element Properties', () => {
    test('all skeleton elements have rounded corners', () => {
      render(<SkeletonCard type="post" />);

      const container = screen.getByLabelText('Loading post');
      const skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      skeletonElements.forEach(element => {
        expect(element).toHaveClass('rounded-md');
      });
    });

    test('skeleton elements maintain consistency across types', () => {
      const { rerender } = render(<SkeletonCard type="post" />);
      let container = screen.getByLabelText('Loading post');
      let skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      // Check all post skeleton elements have required classes
      skeletonElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse', 'bg-[#EFF1F5]', 'rounded-md');
        expect(element).toHaveAttribute('aria-busy', 'true');
      });

      rerender(<SkeletonCard type="marketplace-item" />);
      container = screen.getByLabelText('Loading marketplace item');
      skeletonElements = container.querySelectorAll('[aria-busy="true"]');

      // Check all marketplace skeleton elements have required classes
      skeletonElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse', 'bg-[#EFF1F5]', 'rounded-md');
        expect(element).toHaveAttribute('aria-busy', 'true');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles invalid type gracefully by defaulting to post', () => {
      // @ts-ignore - intentionally testing invalid type
      render(<SkeletonCard type="invalid-type" />);

      // Should default to post type behavior
      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
    });

    test('renders properly with empty string className', () => {
      render(<SkeletonCard className="" />);

      const container = screen.getByLabelText('Loading post');
      expect(container).toHaveClass('bg-white');
    });

    test('maintains structure when re-rendered with different props', () => {
      const { rerender } = render(<SkeletonCard type="post" />);
      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();

      rerender(<SkeletonCard type="marketplace-item" className="test-class" />);
      const container = screen.getByLabelText('Loading marketplace item');
      expect(container).toHaveClass('test-class');
      expect(container).toHaveClass('bg-white');
    });
  });
});