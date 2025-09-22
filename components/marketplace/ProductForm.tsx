'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/Card'
import { Badge } from '@/components/core/Badge'
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
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>상품 등록</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">카테고리 *</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={formData.category === key ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleCategoryChange(key as ProductCategory)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 상품명 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                상품명 *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="상품명을 입력하세요"
                maxLength={100}
                required
              />
            </div>

            {/* 상품 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                상품 설명 *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="상품에 대한 자세한 설명을 입력하세요"
                rows={6}
                required
              />
            </div>

            {/* 가격 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">가격 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    판매 가격 * (원)
                  </label>
                  <input
                    id="price"
                    type="text"
                    value={formData.price}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 50,000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="deliveryFee" className="block text-sm font-medium mb-2">
                    배송비 (원)
                  </label>
                  <input
                    id="deliveryFee"
                    type="text"
                    value={formData.deliveryFee}
                    onChange={handleDeliveryFeeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 3,000"
                    disabled={formData.freeDelivery}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.negotiable}
                    onChange={(e) => setFormData(prev => ({ ...prev, negotiable: e.target.checked }))}
                    className="mr-2"
                  />
                  가격 협상 가능
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.freeDelivery}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      freeDelivery: e.target.checked,
                      deliveryFee: e.target.checked ? '' : prev.deliveryFee
                    }))}
                    className="mr-2"
                  />
                  무료 배송
                </label>
              </div>

              {/* 거래 방식 */}
              <div>
                <label className="block text-sm font-medium mb-2">거래 방식 *</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TRADE_METHODS).map(([key, label]) => (
                    <Badge
                      key={key}
                      variant={formData.tradeMethod === key ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleTradeMethodChange(key as TradeMethod)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 상품 상세 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">상품 상세 정보</h3>

              {/* 상품 상태 */}
              <div>
                <label className="block text-sm font-medium mb-2">상품 상태 *</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRODUCT_CONDITIONS).map(([key, label]) => (
                    <Badge
                      key={key}
                      variant={formData.condition === key ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleConditionChange(key as ProductCondition)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium mb-2">
                    브랜드
                  </label>
                  <input
                    id="brand"
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: Supadupa"
                  />
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-medium mb-2">
                    사이즈
                  </label>
                  <input
                    id="size"
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 250 (신발), M (의상)"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium mb-2">
                    색상
                  </label>
                  <input
                    id="color"
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 블랙, 화이트"
                  />
                </div>

                <div>
                  <label htmlFor="material" className="block text-sm font-medium mb-2">
                    소재
                  </label>
                  <input
                    id="material"
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 스웨이드, 가죽"
                  />
                </div>
              </div>

              {/* 성별 구분 */}
              <div>
                <label className="block text-sm font-medium mb-2">성별 구분</label>
                <div className="flex gap-2">
                  {[
                    { key: 'unisex', label: '공용' },
                    { key: 'male', label: '남성용' },
                    { key: 'female', label: '여성용' }
                  ].map(({ key, label }) => (
                    <Badge
                      key={key}
                      variant={formData.gender === key ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleGenderChange(key as 'unisex' | 'male' | 'female')}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 특징/기능 */}
              <div>
                <label className="block text-sm font-medium mb-2">특징/기능</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 쿠션솔, 미끄럼방지"
                    maxLength={20}
                  />
                  <Button type="button" onClick={addFeature} disabled={!featureInput.trim()}>
                    추가
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeFeature(feature)}
                    >
                      {feature} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 거래 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">거래 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium mb-2">
                    지역 *
                  </label>
                  <input
                    id="region"
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 강남구, 홍대"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="district" className="block text-sm font-medium mb-2">
                    상세 지역
                  </label>
                  <input
                    id="district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 서울특별시 강남구"
                  />
                </div>
              </div>

              {/* 선호 거래 장소 */}
              <div>
                <label className="block text-sm font-medium mb-2">선호 거래 장소</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={meetingPlaceInput}
                    onChange={(e) => setMeetingPlaceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMeetingPlace())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 강남역, 홍대입구역"
                    maxLength={30}
                  />
                  <Button type="button" onClick={addMeetingPlace} disabled={!meetingPlaceInput.trim()}>
                    추가
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.preferredMeetingPlaces.map((place, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeMeetingPlace(place)}
                    >
                      {place} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.deliveryAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAvailable: e.target.checked }))}
                    className="mr-2"
                  />
                  택배 거래 가능
                </label>
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium mb-2">상품 이미지 *</label>
              <ImageUpload
                onUpload={handleImageUpload}
                userId={userId}
                existingImages={formData.images}
                maxImages={10}
              />
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium mb-2">태그</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="태그를 입력하고 엔터를 누르세요"
                  maxLength={20}
                />
                <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                  추가
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isPending || !formData.title.trim() || !formData.description.trim() || !formData.price.trim() || !formData.region.trim() || formData.images.length === 0}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    등록 중...
                  </>
                ) : (
                  '상품 등록'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}