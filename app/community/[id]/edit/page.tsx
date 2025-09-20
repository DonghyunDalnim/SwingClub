import { notFound, redirect } from 'next/navigation'
import { PostForm } from '@/components/community/PostForm'
import { getPostAction } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/auth/server'

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  // 인증 확인
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/community/' + params.id + '/edit')
  }

  // 게시글 데이터 로드
  const postResult = await getPostAction(params.id)

  if (!postResult.success || !postResult.data) {
    notFound()
  }

  const post = postResult.data

  // 작성자 권한 확인
  if (post.metadata.authorId !== user.uid) {
    redirect('/community/' + params.id)
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