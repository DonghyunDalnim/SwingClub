import { redirect } from 'next/navigation'
import { ProductForm } from '@/components/marketplace/ProductForm'
import { getCurrentUser } from '@/lib/auth/server'

export default async function WriteProductPage() {
  // 인증 확인
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/marketplace/write')
    return null // This line won't be reached due to redirect, but helps TypeScript
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductForm
        userId={user.uid}
        userName={user.displayName || '익명'}
        mode="create"
      />
    </div>
  )
}