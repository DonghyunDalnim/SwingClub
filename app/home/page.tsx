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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 relative overflow-hidden">
      {/* Enhanced multi-layer gradient background */}
      <div className="fixed inset-0 bg-gradient-to-tr from-purple-100/30 via-transparent to-pink-100/30 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-bl from-indigo-100/20 via-transparent to-purple-100/20 pointer-events-none"></div>

      <div className="relative z-10">
        <Header />
        <HeroSection />
        <PopularServicesSection />
        <CommunitySection />
        <InstructorsSection />
        <CallToActionSection />
      </div>
    </div>
  )
}