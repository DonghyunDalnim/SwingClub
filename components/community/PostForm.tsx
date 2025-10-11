'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/Button'
import { Badge } from '@/components/core/Badge'
import { ImageUpload } from './ImageUpload'
import { createPostAction, updatePostAction } from '@/lib/actions/posts'
import { POST_CATEGORIES } from '@/lib/types/community'
import type { Post, PostCategory, CreatePostData, UpdatePostData } from '@/lib/types/community'
import Footer from '@/components/Footer'

interface PostFormProps {
  userId: string
  userName: string
  mode: 'create' | 'edit'
  initialData?: Post
}

export function PostForm({ userId, userName, mode, initialData }: PostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || 'general' as PostCategory,
    tags: initialData?.tags || [],
    visibility: initialData?.visibility || 'public' as const,
    images: initialData?.attachments?.map(att => att.fileUrl) || []
  })

  const [error, setError] = useState<string>('')
  const [tagInput, setTagInput] = useState('')

  // 카테고리 선택
  const handleCategoryChange = (category: PostCategory) => {
    setFormData(prev => ({ ...prev, category }))
  }

  // 태그 추가
  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
    }
  }

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }))
  }

  const handleCategoryClick = (category: string) => {
    switch (category) {
      case '전체':
        router.push('/');
        break;
      case '커뮤니티':
        router.push('/community');
        break;
      case '용품':
        router.push('/marketplace');
        break;
      case '장소':
        router.push('/location');
        break;
      default:
        break;
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('[PostForm] Submit started - userId:', userId, 'userName:', userName)

    // 기본 검증
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    // userId 검증
    if (!userId || userId === 'anonymous') {
      setError('로그인 정보를 확인할 수 없습니다. 페이지를 새로고침하거나 다시 로그인해주세요.')
      console.error('[PostForm] Invalid userId:', userId)
      return
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const createData: CreatePostData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
            tags: formData.tags,
            visibility: formData.visibility,
            attachments: formData.images.map((url, index) => ({
              id: `img_${index}`,
              fileName: `image_${index}.jpg`,
              fileUrl: url,
              fileSize: 0,
              mimeType: 'image/jpeg',
              uploadedAt: new Date() as any
            }))
          }

          console.log('[PostForm] Calling createPostAction...', createData)
          const result = await createPostAction(createData)
          console.log('[PostForm] Result:', result)

          if (result.success && result.postId) {
            router.push(`/community/${result.postId}`)
          } else {
            setError(result.error || '게시글 작성에 실패했습니다.')
            console.error('[PostForm] Failed:', result.error)
          }
        } else if (mode === 'edit' && initialData) {
          const updateData: UpdatePostData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
            tags: formData.tags,
            visibility: formData.visibility,
            attachments: formData.images.map((url, index) => ({
              id: `img_${index}`,
              fileName: `image_${index}.jpg`,
              fileUrl: url,
              fileSize: 0,
              mimeType: 'image/jpeg',
              uploadedAt: new Date() as any
            }))
          }

          const result = await updatePostAction(initialData.id, updateData)

          if (result.success) {
            router.push(`/community/${initialData.id}`)
          } else {
            setError(result.error || '게시글 수정에 실패했습니다.')
          }
        }
      } catch (error) {
        console.error('폼 제출 실패:', error)
        setError('오류가 발생했습니다. 다시 시도해주세요.')
      }
    })
  }

  return (
    <div className="page">

      {/* 2-Column Layout */}
      <div className="main-layout">
        <div className="layout-container">
          {/* Left Sidebar - 카테고리 */}
          <aside className="left-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">카테고리</h3>
              <nav className="category-list">
                <button className="category-item" onClick={() => handleCategoryClick('전체')}>
                  <span className="category-name">전체</span>
                  <span className="category-count">1,234</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('레슨')}>
                  <span className="category-icon">📚</span>
                  <span className="category-name">레슨</span>
                  <span className="category-count">456</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('파티')}>
                  <span className="category-icon">🎉</span>
                  <span className="category-name">파티</span>
                  <span className="category-count">234</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('매칭')}>
                  <span className="category-icon">🤝</span>
                  <span className="category-name">매칭</span>
                  <span className="category-count">345</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('용품')}>
                  <span className="category-icon">🛍️</span>
                  <span className="category-name">용품</span>
                  <span className="category-count">199</span>
                </button>
                <button className="category-item active" onClick={() => handleCategoryClick('커뮤니티')}>
                  <span className="category-icon">💬</span>
                  <span className="category-name">커뮤니티</span>
                  <span className="category-count">567</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content - 게시글 작성 폼 */}
          <main className="main-content">
            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  ✏️ {mode === 'create' ? '게시글 작성' : '게시글 수정'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="form-card">
                {/* 에러 메시지 */}
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {/* 카테고리 선택 */}
                <div className="form-group">
                  <label className="form-label">카테고리 *</label>
                  <div className="category-badges">
                    {Object.entries(POST_CATEGORIES).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`category-badge ${formData.category === key ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(key as PostCategory)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 제목 */}
                <div className="form-group">
                  <label htmlFor="title" className="form-label">제목 *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                    placeholder="제목을 입력하세요"
                    maxLength={100}
                    required
                  />
                </div>

                {/* 내용 */}
                <div className="form-group">
                  <label htmlFor="content" className="form-label">내용 *</label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="form-textarea"
                    placeholder="내용을 입력하세요"
                    rows={12}
                    required
                  />
                </div>

                {/* 태그 */}
                <div className="form-group">
                  <label className="form-label">태그</label>
                  <div className="tag-input-group">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="form-input"
                      placeholder="태그를 입력하고 엔터를 누르세요"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                      className="tag-add-button"
                    >
                      추가
                    </button>
                  </div>

                  {/* 태그 목록 */}
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="tag-item"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} ×
                      </span>
                    ))}
                  </div>
                </div>

                {/* 이미지 업로드 */}
                <div className="form-group">
                  <label className="form-label">이미지</label>
                  <ImageUpload
                    onUpload={handleImageUpload}
                    userId={userId}
                    existingImages={formData.images}
                    maxImages={5}
                  />
                </div>

                {/* 버튼 */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isPending}
                    className="cancel-button"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !formData.title.trim() || !formData.content.trim()}
                    className="submit-button"
                  >
                    {isPending ? (
                      <>
                        <div className="spinner" />
                        {mode === 'create' ? '작성 중...' : '수정 중...'}
                      </>
                    ) : (
                      mode === 'create' ? '게시글 작성' : '게시글 수정'
                    )}
                  </button>
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* 2-Column Layout */
        .main-layout {
          flex: 1;
          background: var(--warm-gray);
        }

        .layout-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-2xl);
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-2xl);
          align-items: start;
        }

        /* Left Sidebar */
        .left-sidebar {
          position: sticky;
          top: 80px;
        }

        .sidebar-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: var(--space-xl);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-lg);
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .category-item:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .category-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .category-icon {
          font-size: 18px;
        }

        .category-name {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
        }

        .category-count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .category-item:not(.active) .category-count {
          color: var(--gray-500);
        }

        /* Main Content */
        .main-content {
          min-width: 0;
        }

        .content-section {
          margin-bottom: var(--space-2xl);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .section-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--gray-900);
        }

        /* Form Card */
        .form-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: var(--space-2xl);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          max-width: 744px;
        }

        .error-message {
          padding: var(--space-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #dc2626;
          font-size: 14px;
          margin-bottom: var(--space-xl);
        }

        .form-group {
          margin-bottom: var(--space-xl);
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--space-sm);
        }

        .form-input,
        .form-textarea {
          width: 744px;
          max-width: 100%;
          padding: 12px 16px;
          border: 1.5px solid rgba(200, 200, 200, 0.3);
          border-radius: 12px;
          font-size: 15px;
          color: var(--gray-900);
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 200px;
        }

        /* Category Badges */
        .category-badges {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .category-badge {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(200, 200, 200, 0.3);
          border-radius: 12px;
          color: var(--gray-700);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-badge:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .category-badge.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
        }

        /* Tag Input */
        .tag-input-group {
          display: flex;
          gap: var(--space-sm);
        }

        .tag-add-button {
          padding: 12px 24px;
          background: rgba(102, 126, 234, 0.1);
          border: 1.5px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tag-add-button:hover:not(:disabled) {
          background: rgba(102, 126, 234, 0.2);
        }

        .tag-add-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin-top: var(--space-md);
        }

        .tag-item {
          padding: 6px 14px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tag-item:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          margin-top: var(--space-2xl);
          padding-top: var(--space-xl);
          border-top: 1px solid rgba(200, 200, 200, 0.2);
        }

        .cancel-button {
          padding: 12px 24px;
          background: transparent;
          border: 1.5px solid rgba(200, 200, 200, 0.3);
          border-radius: 12px;
          color: var(--gray-700);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-button:hover:not(:disabled) {
          background: rgba(200, 200, 200, 0.1);
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .layout-container {
            grid-template-columns: 1fr;
          }

          .left-sidebar {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .layout-container {
            padding: var(--space-lg);
          }

          .form-card {
            padding: var(--space-xl);
          }

          .form-actions {
            flex-direction: column;
          }

          .cancel-button,
          .submit-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
