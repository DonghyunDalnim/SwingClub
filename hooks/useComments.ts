/**
 * 댓글 실시간 구독 및 관리 훅
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Comment } from '@/lib/types/community'

// 댓글 트리 노드 인터페이스
export interface CommentNode extends Comment {
  children: CommentNode[]
  level: number
}

interface UseCommentsOptions {
  enabled?: boolean
  onError?: (error: Error) => void
}

interface UseCommentsReturn {
  comments: CommentNode[]
  loading: boolean
  error: Error | null
  totalCount: number
  refetch: () => void
}

/**
 * 게시글의 댓글을 실시간으로 구독하는 훅
 */
export function useComments(
  postId: string,
  options: UseCommentsOptions = {}
): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, onError } = options

  // 댓글 구독
  useEffect(() => {
    if (!enabled || !postId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe: Unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        try {
          const commentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Comment[]

          setComments(commentsData)
          setLoading(false)
        } catch (err) {
          const error = err instanceof Error ? err : new Error('댓글 조회 중 오류가 발생했습니다.')
          setError(error)
          setLoading(false)
          onError?.(error)
        }
      },
      (err) => {
        const error = err instanceof Error ? err : new Error('댓글 실시간 구독 중 오류가 발생했습니다.')
        setError(error)
        setLoading(false)
        onError?.(error)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [postId, enabled, onError])

  // 댓글을 트리 구조로 변환
  const commentTree = useMemo(() => {
    if (!comments.length) return []

    return buildCommentTree(comments)
  }, [comments])

  // 전체 댓글 수 (삭제된 댓글 포함)
  const totalCount = useMemo(() => {
    return comments.length
  }, [comments])

  // 수동 새로고침 함수
  const refetch = () => {
    // 이미 onSnapshot이 실시간으로 업데이트하므로
    // 별도 작업이 필요없지만 사용자가 명시적으로 호출할 수 있도록 제공
    setLoading(true)
  }

  return {
    comments: commentTree,
    loading,
    error,
    totalCount,
    refetch
  }
}

/**
 * 댓글 배열을 트리 구조로 변환
 */
function buildCommentTree(comments: Comment[]): CommentNode[] {
  const commentMap = new Map<string, CommentNode>()
  const rootComments: CommentNode[] = []

  // 모든 댓글을 맵에 저장하고 초기화
  comments.forEach(comment => {
    const node: CommentNode = {
      ...comment,
      children: [],
      level: comment.depth
    }
    commentMap.set(comment.id, node)
  })

  // 부모-자식 관계 구성
  comments.forEach(comment => {
    const node = commentMap.get(comment.id)!

    if (comment.parentId) {
      // 대댓글인 경우
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.children.push(node)
        // 레벨 계산 (부모 레벨 + 1)
        node.level = parent.level + 1
      } else {
        // 부모가 없는 경우 (삭제된 부모 댓글) 루트로 처리
        rootComments.push(node)
      }
    } else {
      // 원댓글인 경우
      rootComments.push(node)
    }
  })

  // 각 레벨에서 시간순 정렬
  sortCommentTree(rootComments)

  return rootComments
}

/**
 * 댓글 트리를 재귀적으로 시간순 정렬
 */
function sortCommentTree(nodes: CommentNode[]): void {
  // 현재 레벨 정렬 (시간순)
  nodes.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0
    const bTime = b.createdAt?.toMillis?.() || 0
    return aTime - bTime
  })

  // 자식 노드들도 재귀적으로 정렬
  nodes.forEach(node => {
    if (node.children.length > 0) {
      sortCommentTree(node.children)
    }
  })
}

/**
 * 특정 댓글의 대댓글만 조회하는 훅
 */
export function useCommentReplies(
  parentCommentId: string,
  options: UseCommentsOptions = {}
): UseCommentsReturn {
  const [replies, setReplies] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, onError } = options

  useEffect(() => {
    if (!enabled || !parentCommentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const repliesQuery = query(
      collection(db, 'comments'),
      where('parentId', '==', parentCommentId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe: Unsubscribe = onSnapshot(
      repliesQuery,
      (snapshot) => {
        try {
          const repliesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Comment[]

          setReplies(repliesData)
          setLoading(false)
        } catch (err) {
          const error = err instanceof Error ? err : new Error('대댓글 조회 중 오류가 발생했습니다.')
          setError(error)
          setLoading(false)
          onError?.(error)
        }
      },
      (err) => {
        const error = err instanceof Error ? err : new Error('대댓글 실시간 구독 중 오류가 발생했습니다.')
        setError(error)
        setLoading(false)
        onError?.(error)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [parentCommentId, enabled, onError])

  const commentTree = useMemo(() => {
    return replies.map(reply => ({
      ...reply,
      children: [],
      level: 1
    }))
  }, [replies])

  const refetch = () => {
    setLoading(true)
  }

  return {
    comments: commentTree,
    loading,
    error,
    totalCount: replies.length,
    refetch
  }
}

/**
 * 댓글 좋아요 상태를 확인하는 훅
 */
export function useCommentLikes(commentIds: string[], userId?: string) {
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !commentIds.length) {
      setLoading(false)
      return
    }

    // 여기서는 간단하게 구현, 실제로는 getUserLikes 함수 사용
    setLikes({})
    setLoading(false)
  }, [commentIds, userId])

  return { likes, loading }
}