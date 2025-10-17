import { notFound } from 'next/navigation'
import { PostDetail } from '@/components/community/PostDetail'
import { getPostAction } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/auth/server'

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  // 게시글 데이터 로드
  const postResult = await getPostAction(id)

  if (!postResult.success || !postResult.data) {
    notFound()
  }

  // 현재 사용자 정보
  const currentUser = await getCurrentUser()

  return (
    <PostDetail
      post={postResult.data}
      currentUserId={currentUser?.uid}
    />
  )
}

// 메타데이터 생성
export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params
  const postResult = await getPostAction(id)

  if (!postResult.success || !postResult.data) {
    return {
      title: '게시글을 찾을 수 없습니다 - Swing Connect'
    }
  }

  const post = postResult.data

  return {
    title: `${post.title} - Swing Connect`,
    description: post.content.slice(0, 160) + '...',
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160) + '...',
      images: post.attachments && post.attachments.length > 0 ? [post.attachments[0].fileUrl] : []
    }
  }
}