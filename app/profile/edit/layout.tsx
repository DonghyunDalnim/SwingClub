import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프로필 편집 | Swing Connect',
  description: '스윙댄스 커뮤니티 프로필 편집 - 닉네임, 지역, 댄스 레벨, 선호 스타일을 수정하세요'
}

export default function ProfileEditLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
