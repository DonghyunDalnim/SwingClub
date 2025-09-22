import { redirect } from 'next/navigation'
import { PostForm } from '@/components/community/PostForm'
import { getCurrentUser } from '@/lib/auth/server'

export default async function WritePostPage() {
  // 인증 확인
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/community/write')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostForm
        userId={user.uid}
        userName={user.displayName || '익명'}
        mode="create"
      />
    </div>
  )
}