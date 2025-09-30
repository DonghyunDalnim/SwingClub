import { notFound, redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getPostAction } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/auth/server'

// Dynamically import heavy form component for edit page
const PostForm = dynamic(
  () => import('@/components/community/PostForm').then(mod => ({ default: mod.PostForm })),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">게시글 수정 폼을 불러오는 중...</p>
        </div>
      </div>
    )
  }
)

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  // 인증 확인
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/community/' + id + '/edit')
  }

  // 게시글 데이터 로드
  const postResult = await getPostAction(id)

  if (!postResult.success || !postResult.data) {
    notFound()
  }

  const post = postResult.data

  // 작성자 권한 확인
  if (post.metadata.authorId !== user.uid) {
    redirect('/community/' + id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostForm
        userId={user.uid}
        userName={user.displayName || '익명'}
        mode="edit"
        initialData={post}
      />
    </div>
  )
}