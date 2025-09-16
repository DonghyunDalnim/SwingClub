import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-6">
            <div className="mx-auto text-6xl space-x-4">
              <span>🕺</span>
              <span className="text-2xl">💫</span>
              <span>💃</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                SWING CONNECT
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                스윙댄스 커뮤니티
              </CardDescription>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">환영합니다!</h2>
              <p className="text-sm text-gray-600">
                스윙댄스 동호회에 참여하세요
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              className="w-full h-12 text-black bg-yellow-300 hover:bg-yellow-400 border-0"
              size="lg"
            >
              <span className="mr-2">🟡</span>
              카카오톡으로 로그인
            </Button>

            <Button
              className="w-full h-12 text-white bg-green-500 hover:bg-green-600 border-0"
              size="lg"
            >
              <span className="mr-2">🟢</span>
              네이버로 로그인
            </Button>

            <Button
              className="w-full h-12 text-white bg-blue-500 hover:bg-blue-600 border-0"
              size="lg"
            >
              <span className="mr-2">🔵</span>
              구글로 로그인
            </Button>

            <div className="text-center text-xs text-gray-500 mt-6 space-x-2">
              <span>서비스 이용약관</span>
              <span>|</span>
              <span>개인정보처리방침</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}