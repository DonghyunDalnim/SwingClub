import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getCurrentUser } from '@/lib/auth/server'

// Dynamically import heavy form component
const ProductForm = dynamic(
  () => import('@/components/marketplace/ProductForm').then(mod => ({ default: mod.ProductForm })),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">상품 등록 폼을 불러오는 중...</p>
        </div>
      </div>
    )
  }
)

export default async function WriteProductPage() {
  // 인증 확인 (선택적)
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductForm
        userId={user?.uid || 'anonymous'}
        userName={user?.displayName || '익명'}
        mode="create"
      />
    </div>
  )
}