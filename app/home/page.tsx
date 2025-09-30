import dynamic from 'next/dynamic'
import {
  Header,
  HeroSection,
  PopularServicesSection,
} from '@/components/home'

// Dynamic imports for below-the-fold sections (performance optimization)
const CommunitySection = dynamic(
  () => import('@/components/home').then(mod => ({ default: mod.CommunitySection })),
  {
    loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
    ssr: true
  }
)

const InstructorsSection = dynamic(
  () => import('@/components/home').then(mod => ({ default: mod.InstructorsSection })),
  {
    loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
    ssr: true
  }
)

const CallToActionSection = dynamic(
  () => import('@/components/home').then(mod => ({ default: mod.CallToActionSection })),
  {
    loading: () => <div className="h-64 bg-purple-600 animate-pulse" />,
    ssr: true
  }
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <Header />
      <HeroSection />
      <PopularServicesSection />
      <CommunitySection />
      <InstructorsSection />
      <CallToActionSection />
    </div>
  )
}