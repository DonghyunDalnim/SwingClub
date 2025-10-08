import { Suspense } from 'react';
import SignupWizard from './components/SignupWizard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입 | Swing Connect',
  description: '스윙댄스 커뮤니티 Swing Connect에 가입하세요',
};

function SignupLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupWizard />
    </Suspense>
  );
}
