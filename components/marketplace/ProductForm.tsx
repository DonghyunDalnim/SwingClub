'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/community/ImageUpload'
import { createMarketplaceItem } from '@/lib/actions/marketplace'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  TRADE_METHODS,
  type ProductCategory,
  type ProductCondition,
  type TradeMethod,
  type CreateItemData
} from '@/lib/types/marketplace'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ProductFormProps {
  userId: string
  userName: string
  mode: 'create' | 'edit'
  initialData?: any // TODO: MarketplaceItem type when editing
}

export function ProductForm({ userId, userName, mode }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'shoes' as ProductCategory,
    price: '',
    negotiable: false,
    tradeMethod: 'both' as TradeMethod,
    deliveryFee: '',
    freeDelivery: false,
    condition: 'good' as ProductCondition,
    brand: '',
    size: '',
    color: '',
    material: '',
    gender: 'unisex' as 'unisex' | 'male' | 'female',
    features: [] as string[],
    region: '',
    district: '',
    preferredMeetingPlaces: [] as string[],
    deliveryAvailable: true,
    images: [] as string[],
    tags: [] as string[]
  })

  const [error, setError] = useState<string>('')
  const [tagInput, setTagInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [meetingPlaceInput, setMeetingPlaceInput] = useState('')

  // 카테고리 선택
  const handleCategoryChange = (category: ProductCategory) => {
    setFormData(prev => ({ ...prev, category }))
  }

  // 컨디션 선택
  const handleConditionChange = (condition: ProductCondition) => {
    setFormData(prev => ({ ...prev, condition }))
  }

  // 거래 방식 선택
  const handleTradeMethodChange = (method: TradeMethod) => {
    setFormData(prev => ({ ...prev, tradeMethod: method }))
  }

  // 성별 선택
  const handleGenderChange = (gender: 'unisex' | 'male' | 'female') => {
    setFormData(prev => ({ ...prev, gender }))
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

  // 특징 추가
  const addFeature = () => {
    const feature = featureInput.trim()
    if (feature && !formData.features.includes(feature) && formData.features.length < 5) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }))
      setFeatureInput('')
    }
  }

  // 특징 제거
  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }))
  }

  // 거래 장소 추가
  const addMeetingPlace = () => {
    const place = meetingPlaceInput.trim()
    if (place && !formData.preferredMeetingPlaces.includes(place) && formData.preferredMeetingPlaces.length < 3) {
      setFormData(prev => ({
        ...prev,
        preferredMeetingPlaces: [...prev.preferredMeetingPlaces, place]
      }))
      setMeetingPlaceInput('')
    }
  }

  // 거래 장소 제거
  const removeMeetingPlace = (placeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      preferredMeetingPlaces: prev.preferredMeetingPlaces.filter(place => place !== placeToRemove)
    }))
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }))
  }

  // 가격 포맷팅
  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    setFormData(prev => ({ ...prev, price: formatted }))
  }

  const handleDeliveryFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    setFormData(prev => ({ ...prev, deliveryFee: formatted }))
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

    // 기본 검증
    if (!formData.title.trim()) {
      setError('상품명을 입력해주세요.')
      return
    }

    if (!formData.description.trim()) {
      setError('상품 설명을 입력해주세요.')
      return
    }

    if (!formData.price.trim()) {
      setError('가격을 입력해주세요.')
      return
    }

    if (!formData.region.trim()) {
      setError('지역을 입력해주세요.')
      return
    }

    if (formData.images.length === 0) {
      setError('상품 이미지를 최소 1개 이상 업로드해주세요.')
      return
    }

    startTransition(async () => {
      try {
        const priceNumber = parseInt(formData.price.replace(/,/g, ''))
        const deliveryFeeNumber = formData.deliveryFee ? parseInt(formData.deliveryFee.replace(/,/g, '')) : 0

        const createData: CreateItemData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          pricing: {
            price: priceNumber,
            currency: 'KRW',
            negotiable: formData.negotiable,
            deliveryFee: deliveryFeeNumber,
            freeDelivery: formData.freeDelivery,
            tradeMethod: formData.tradeMethod
          },
          specs: {
            brand: formData.brand.trim() || undefined,
            size: formData.size.trim() || undefined,
            color: formData.color.trim() || undefined,
            condition: formData.condition,
            material: formData.material.trim() || undefined,
            gender: formData.gender,
            features: formData.features.length > 0 ? formData.features : undefined
          },
          location: {
            region: formData.region.trim(),
            district: formData.district.trim() || undefined,
            preferredMeetingPlaces: formData.preferredMeetingPlaces.length > 0 ? formData.preferredMeetingPlaces : undefined,
            deliveryAvailable: formData.deliveryAvailable
          },
          images: formData.images,
          tags: formData.tags.length > 0 ? formData.tags : undefined
        }

        const result = await createMarketplaceItem(createData, userId)

        if (result.success && result.itemId) {
          router.push(`/marketplace/${result.itemId}`)
        } else {
          setError(result.error || '상품 등록에 실패했습니다.')
        }
      } catch (error) {
        console.error('폼 제출 실패:', error)
        setError('오류가 발생했습니다. 다시 시도해주세요.')
      }
    })
  }

  return (
    <div className="page">
      <Header />

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
                <button className="category-item active" onClick={() => handleCategoryClick('용품')}>
                  <span className="category-icon">🛍️</span>
                  <span className="category-name">용품</span>
                  <span className="category-count">199</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('커뮤니티')}>
                  <span className="category-icon">💬</span>
                  <span className="category-name">커뮤니티</span>
                  <span className="category-count">567</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content - 상품 등록 폼 */}
          <main className="main-content">
            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  ✏️ {mode === 'create' ? '상품 등록' : '상품 수정'}
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
                    {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`category-badge ${formData.category === key ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(key as ProductCategory)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 상품명 */}
                <div className="form-group">
                  <label htmlFor="title" className="form-label">상품명 *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                    placeholder="상품명을 입력하세요"
                    maxLength={100}
                    required
                  />
                </div>

                {/* 상품 설명 */}
                <div className="form-group">
                  <label htmlFor="description" className="form-label">상품 설명 *</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="form-textarea"
                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                    rows={8}
                    required
                  />
                </div>

                {/* 가격 정보 */}
                <div className="form-section">
                  <h3 className="section-subtitle">가격 정보</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="price" className="form-label">판매 가격 * (원)</label>
                      <input
                        id="price"
                        type="text"
                        value={formData.price}
                        onChange={handlePriceChange}
                        className="form-input"
                        placeholder="예: 50,000"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="deliveryFee" className="form-label">배송비 (원)</label>
                      <input
                        id="deliveryFee"
                        type="text"
                        value={formData.deliveryFee}
                        onChange={handleDeliveryFeeChange}
                        className="form-input"
                        placeholder="예: 3,000"
                        disabled={formData.freeDelivery}
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.negotiable}
                        onChange={(e) => setFormData(prev => ({ ...prev, negotiable: e.target.checked }))}
                        className="checkbox-input"
                      />
                      가격 협상 가능
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.freeDelivery}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          freeDelivery: e.target.checked,
                          deliveryFee: e.target.checked ? '' : prev.deliveryFee
                        }))}
                        className="checkbox-input"
                      />
                      무료 배송
                    </label>
                  </div>

                  {/* 거래 방식 */}
                  <div className="form-group">
                    <label className="form-label">거래 방식 *</label>
                    <div className="category-badges">
                      {Object.entries(TRADE_METHODS).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          className={`category-badge ${formData.tradeMethod === key ? 'active' : ''}`}
                          onClick={() => handleTradeMethodChange(key as TradeMethod)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 상품 상세 정보 */}
                <div className="form-section">
                  <h3 className="section-subtitle">상품 상세 정보</h3>

                  {/* 상품 상태 */}
                  <div className="form-group">
                    <label className="form-label">상품 상태 *</label>
                    <div className="category-badges">
                      {Object.entries(PRODUCT_CONDITIONS).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          className={`category-badge ${formData.condition === key ? 'active' : ''}`}
                          onClick={() => handleConditionChange(key as ProductCondition)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="brand" className="form-label">브랜드</label>
                      <input
                        id="brand"
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="form-input"
                        placeholder="예: Supadupa"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="size" className="form-label">사이즈</label>
                      <input
                        id="size"
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                        className="form-input"
                        placeholder="예: 250 (신발), M (의상)"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="color" className="form-label">색상</label>
                      <input
                        id="color"
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="form-input"
                        placeholder="예: 블랙, 화이트"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="material" className="form-label">소재</label>
                      <input
                        id="material"
                        type="text"
                        value={formData.material}
                        onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                        className="form-input"
                        placeholder="예: 스웨이드, 가죽"
                      />
                    </div>
                  </div>

                  {/* 성별 구분 */}
                  <div className="form-group">
                    <label className="form-label">성별 구분</label>
                    <div className="category-badges">
                      {[
                        { key: 'unisex', label: '공용' },
                        { key: 'male', label: '남성용' },
                        { key: 'female', label: '여성용' }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          className={`category-badge ${formData.gender === key ? 'active' : ''}`}
                          onClick={() => handleGenderChange(key as 'unisex' | 'male' | 'female')}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 특징/기능 */}
                  <div className="form-group">
                    <label className="form-label">특징/기능</label>
                    <div className="tag-input-group">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className="form-input"
                        placeholder="예: 쿠션솔, 미끄럼방지"
                        maxLength={20}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        disabled={!featureInput.trim()}
                        className="tag-add-button"
                      >
                        추가
                      </button>
                    </div>

                    <div className="tags-list">
                      {formData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="tag-item"
                          onClick={() => removeFeature(feature)}
                        >
                          {feature} ×
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 거래 정보 */}
                <div className="form-section">
                  <h3 className="section-subtitle">거래 정보</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="region" className="form-label">지역 *</label>
                      <input
                        id="region"
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                        className="form-input"
                        placeholder="예: 강남구, 홍대"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="district" className="form-label">상세 지역</label>
                      <input
                        id="district"
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                        className="form-input"
                        placeholder="예: 서울특별시 강남구"
                      />
                    </div>
                  </div>

                  {/* 선호 거래 장소 */}
                  <div className="form-group">
                    <label className="form-label">선호 거래 장소</label>
                    <div className="tag-input-group">
                      <input
                        type="text"
                        value={meetingPlaceInput}
                        onChange={(e) => setMeetingPlaceInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMeetingPlace())}
                        className="form-input"
                        placeholder="예: 강남역, 홍대입구역"
                        maxLength={30}
                      />
                      <button
                        type="button"
                        onClick={addMeetingPlace}
                        disabled={!meetingPlaceInput.trim()}
                        className="tag-add-button"
                      >
                        추가
                      </button>
                    </div>

                    <div className="tags-list">
                      {formData.preferredMeetingPlaces.map((place, index) => (
                        <span
                          key={index}
                          className="tag-item"
                          onClick={() => removeMeetingPlace(place)}
                        >
                          {place} ×
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.deliveryAvailable}
                        onChange={(e) => setFormData(prev => ({ ...prev, deliveryAvailable: e.target.checked }))}
                        className="checkbox-input"
                      />
                      택배 거래 가능
                    </label>
                  </div>
                </div>

                {/* 이미지 업로드 */}
                <div className="form-group">
                  <label className="form-label">상품 이미지 *</label>
                  <ImageUpload
                    onUpload={handleImageUpload}
                    userId={userId}
                    existingImages={formData.images}
                    maxImages={10}
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
                    disabled={isPending || !formData.title.trim() || !formData.description.trim() || !formData.price.trim() || !formData.region.trim() || formData.images.length === 0}
                    className="submit-button"
                  >
                    {isPending ? (
                      <>
                        <div className="spinner" />
                        {mode === 'create' ? '등록 중...' : '수정 중...'}
                      </>
                    ) : (
                      mode === 'create' ? '상품 등록' : '상품 수정'
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

        .form-section {
          margin-top: var(--space-2xl);
          padding-top: var(--space-2xl);
          border-top: 1px solid rgba(200, 200, 200, 0.2);
        }

        .section-subtitle {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-lg);
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
          width: 100%;
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

        .form-input:disabled {
          background: rgba(200, 200, 200, 0.1);
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 150px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
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

        /* Checkbox Group */
        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-lg);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
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

          .form-grid {
            grid-template-columns: 1fr;
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
