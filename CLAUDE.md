# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swing Connect is a comprehensive web application for the swing dance community that addresses the fragmentation problem where dance communities currently use 4-5 different platforms simultaneously (KakaoTalk, Naver Cafe, Facebook, Instagram). The platform provides a unified solution for community interaction, location-based services, partner matching, and specialized marketplace for dance equipment.

**Core Value Proposition**: "모든 스윙댄스 정보를 한 곳에서" (All swing dance information in one place)

### Target Users
- **Primary**: Swing dance beginners (20-35) and existing community members (25-45)
- **Secondary**: Community organizers (30-50) and dance equipment traders (20-50)

### Key Features
- Social login with Kakao, Naver, Google authentication
- Location-based studio/venue finder with Kakao Map integration
- Community boards (general, partner-search, Q&A, events, marketplace)
- Specialized marketplace for dance equipment with trust system
- Partner matching based on skill level and location
- Real-time notifications and community management tools

The project is built with Next.js 15.5.3 using the App Router, TypeScript, and Tailwind CSS 4.1.13, with Firebase as the backend infrastructure.

## Development Commands

```bash
# Development
npm run dev        # Start development server (uses standard Next.js, not Turbopack)
npm run build      # Production build
npm run start      # Start production server

# Quality & Testing
npm run lint       # ESLint linting
npm run type-check # TypeScript type checking (tsc --noEmit)

# Dependencies
npm install        # Install dependencies
```

**Important**: The project runs on standard Next.js mode (not Turbopack) due to compatibility issues with Next.js 15.5.3 and Tailwind CSS 4.x. The dev script has been configured to use `next dev` without the `--turbo` flag.

## Architecture Overview

### Backend Infrastructure (Firebase)

The application uses Firebase as a comprehensive backend solution:

- **Database**: Firestore NoSQL database with collections for users, posts, comments, regions, studios, and notifications
- **Authentication**: Firebase Auth with social login providers (Google, Kakao, Naver)
- **Storage**: Firebase Storage for image uploads and file management
- **Messaging**: Firebase Cloud Messaging (FCM) for push notifications
- **Analytics**: Firebase Analytics for user behavior tracking
- **Hosting**: Vercel for frontend hosting with automatic deployments

### Data Model Structure

**Key Collections**:
- `users`: User profiles with dance levels, preferences, location, and statistics
- `posts`: Community posts with categories (general, partner-search, marketplace, events)
- `comments`: Nested comment system with like functionality
- `regions`: Geographic regions for location-based features
- `studios`: Dance studios/venues with ratings and contact information
- `notifications`: Real-time notification system

### Design System Architecture

The project uses a centralized design system based on Soomgo's theme with two-tier component organization:

**Theme Layer** (`lib/`):
- `lib/theme.ts` - Central theme configuration with Soomgo branding colors, typography, spacing
- `lib/design-tokens.ts` - Style utility functions and design tokens (`createButtonStyle`, `createCardStyle`, etc.)

**Component Layer** (`components/`):
- `components/core/` - Basic UI components (Button, Card, Badge, Typography, SearchInput)
- `components/layout/` - Layout components (Container, Section, Flex, Grid)
- `components/navigation/` - Navigation components (BottomNav)
- `components/ui/` - Legacy Shadcn UI components (being phased out)

### Import Patterns

**Always use centralized imports**:
```tsx
// Correct - use centralized design system
import { Button, Card, Typography } from '@/components/core';
import { Container, Section, Flex, Grid } from '@/components/layout';
import { theme } from '@/lib/theme';

// Avoid - old Shadcn imports
import { Button } from '@/components/ui/button';
```

### Page Architecture

Next.js App Router structure with mobile-first design and planned backend integration:
```
app/
├── page.tsx           # Root redirect to /home
├── layout.tsx         # Root layout with BottomNav
├── (auth)/            # Authentication routes
│   ├── login/page.tsx # Social authentication
│   └── signup/page.tsx
├── (main)/            # Protected main application
│   ├── home/page.tsx      # Main dashboard with Today's Swing & Hot Topics
│   ├── location/page.tsx  # Map-based studio/venue finder (Kakao Map)
│   ├── community/page.tsx # Community boards with categories
│   ├── marketplace/page.tsx # Dance equipment trading platform
│   └── profile/page.tsx   # User profiles with dance levels & stats
├── api/               # API routes for server actions
│   ├── auth/          # Authentication endpoints
│   ├── posts/         # Post management
│   ├── marketplace/   # Trading system
│   └── notifications/ # Push notification handling
└── admin/             # Admin interface (future)
```

### External API Integration
- **Kakao Map API**: Location-based studio/venue discovery
- **Social Login APIs**: Kakao, Naver, Google authentication
- **Firebase APIs**: Database, storage, messaging, analytics

### Styling Approach

**Theme-based styling with TypeScript safety**:
```tsx
// Use theme object for colors and spacing
<div style={{ backgroundColor: theme.colors.primary.main }}>

// Use design token functions for consistent styling
<button className={createButtonStyle('primary')}>

// Combine with Tailwind for layout
<div className="flex items-center" style={{ color: theme.colors.neutral.darkest }}>
```

### Configuration Files

- **PostCSS**: Uses `@tailwindcss/postcss` plugin (required for Tailwind CSS 4.x)
- **Next.js**: Standard configuration without Turbopack
- **TypeScript**: Strict mode enabled with Next.js plugin

## Key Design Patterns

### Component Composition
Components are designed for composition with TypeScript props validation:
```tsx
<Container size="lg">
  <Section spacing="md" background="white">
    <Grid cols={2} gap="md" responsive={true}>
      <Card variant="default">
        <CardHeader>
          <CardTitle><Typography variant="h4">Title</Typography></CardTitle>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>
    </Grid>
  </Section>
</Container>
```

### Theme Consistency
All visual elements should reference the central theme system:
- Colors: `theme.colors.primary.main`, `theme.colors.neutral.medium`
- Typography: `theme.typography.headings.h2.fontSize`
- Spacing: `theme.spacing.sections.paddingVertical`

### Mobile-First Responsive Design
- Bottom navigation for mobile UX
- Responsive grid systems with `responsive={true}` prop
- Container components with automatic padding and max-width

## File Structure Conventions

- **Components**: Organized by functionality (core/layout/navigation)
- **Pages**: Follow Next.js App Router conventions
- **Styling**: Centralized in `lib/` directory
- **Types**: Co-located with components using TypeScript interfaces

## Key Development Patterns

### Server Actions (Next.js 14+)
Use Server Actions for backend operations instead of API routes:
```typescript
// src/lib/actions/posts.ts
'use server'

export async function createPost(data: CreatePostData) {
  // Firebase Firestore operations
}

export async function getPostsByCategory(category: string, page: number = 1) {
  // Query Firestore with pagination
}
```

### Firebase Integration
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Security Rules
Firestore security rules enforce user-based access control:
- Users can only edit their own posts and profiles
- All reads require authentication
- Marketplace transactions include trust/rating systems

### Performance Optimization
- Image optimization with Next.js Image component
- Dynamic imports for heavy components (maps, editors)
- Firestore query optimization with compound indexes
- Cursor-based pagination for large datasets

## Development Notes

- The project uses Soomgo's purple primary color (`#693BF2`) throughout the design system
- Mobile-first approach with responsive breakpoints defined in theme
- TypeScript strict mode enforced for type safety
- All components export both default and named exports for flexibility
- Firebase security rules prevent unauthorized access to user data
- Marketplace features include rating system and transaction safety measures

## Business Context & Requirements

### Problem Statement
Korean swing dance communities currently face significant fragmentation, with each group using 4-5 different platforms simultaneously:
- **Information Scatter**: Meeting announcements, reviews, and photos spread across different platforms
- **High Participation Barrier**: New members must join multiple platforms
- **Management Burden**: Organizers must post identical content across multiple platforms
- **Poor Accessibility**: Especially difficult for swing dance beginners to find information

### Success Metrics (KPIs)
- **User Growth**: 1,000 MAU within 6 months, 5,000 MAU within 1 year
- **Engagement**: 20% DAU/MAU ratio, 8+ minute average session time
- **Community Health**: 50+ posts/day, 30%+ comment rate on posts
- **Marketplace**: 80%+ transaction completion rate, <5% dispute rate

### Development Roadmap

**Phase 1 (MVP - 1-3 months)**:
- Core authentication and user management
- Basic community features (posts, comments)
- Location-based information with map integration
- Basic marketplace functionality

**Phase 2 (Feature Expansion - 4-6 months)**:
- Advanced marketplace (pricing suggestions, trust ratings)
- Social feed functionality
- Partner matching system
- Mobile app development

**Phase 3 (Monetization - 7-12 months)**:
- Premium membership features
- Advanced partner matching algorithms
- Online lesson platform integration
- Marketplace commission model

### Security & Privacy Considerations
- All user data encrypted in transit and at rest
- Rate limiting to prevent abuse (30 requests/minute per user)
- Content sanitization to prevent XSS attacks
- Personal information masking for privacy protection
- GDPR-compliant data handling procedures

### External Dependencies
- **Kakao APIs**: Map services and social login
- **Naver/Google**: Social authentication providers
- **Firebase**: All backend services and infrastructure
- **Vercel**: Frontend hosting and deployment