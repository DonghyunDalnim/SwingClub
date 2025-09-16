import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Settings, MapPin, Calendar, Award, Heart, MessageCircle, Users, FileText, Bell, Lock, Smartphone, HelpCircle, Mail, LogOut } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <ArrowLeft className="h-6 w-6" />
            <span className="font-semibold text-lg">내 정보</span>
          </div>
          <div className="flex items-center space-x-3">
            <Edit className="h-6 w-6" />
            <Settings className="h-6 w-6" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-bold mb-2">댄스러버</h2>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>중급</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>강남구</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>가입일: 2024.01.15</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dance Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎵 선호 스타일</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg mb-1">린디합</div>
                <div className="flex justify-center">
                  {[1,2,3].map(i => <span key={i} className="text-yellow-400">⭐</span>)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg mb-1">찰스턴</div>
                <div className="flex justify-center">
                  {[1,2].map(i => <span key={i} className="text-yellow-400">⭐</span>)}
                  <span className="text-gray-300">⭐</span>
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg mb-1">발보아</div>
                <div className="flex justify-center">
                  <span className="text-yellow-400">⭐</span>
                  {[1,2].map(i => <span key={i} className="text-gray-300">⭐</span>)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg mb-1">이스트코스트</div>
                <div className="flex justify-center">
                  {[1,2,3].map(i => <span key={i} className="text-gray-300">⭐</span>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 활동 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">15</div>
                <div className="text-sm text-gray-600">작성한 글</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">47</div>
                <div className="text-sm text-gray-600">댓글</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">89</div>
                <div className="text-sm text-gray-600">받은 좋아요</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600">참여한 모임</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🏆 내 배지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {[
                { emoji: '🌟', name: '신입
댄서' },
                { emoji: '👥', name: '모임
러버' },
                { emoji: '💬', name: '댓글
킹' },
                { emoji: '📝', name: '글
작성' },
                { emoji: '🎯', name: '출석
왕' }
              ].map((badge, i) => (
                <div key={i} className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <div className="text-xs text-gray-600">{badge.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💭 자기소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              안녕하세요! 스윙댄스를 사랑하는 댄스러버입니다 🎵<br/>
              린디합을 가장 좋아하고, 주로 강남 쪽에서 활동해요.<br/>
              초보자분들 환영하고 함께 성장했으면 좋겠어요!<br/>
              언제든 연락주세요~ 😊
            </p>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <span>알림 설정</span>
              </div>
              <span className="text-gray-400">></span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-gray-600" />
                <span>개인정보 설정</span>
              </div>
              <span className="text-gray-400">></span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <span>계정 연결 관리</span>
              </div>
              <span className="text-gray-400">></span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-gray-600" />
                <span>도움말</span>
              </div>
              <span className="text-gray-400">></span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <span>문의하기</span>
              </div>
              <span className="text-gray-400">></span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 text-gray-600" />
                <span>로그아웃</span>
              </div>
              <span className="text-gray-400">></span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}