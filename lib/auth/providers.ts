/**
 * Authentication provider configurations for Swing Connect
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type Auth
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  query,
  collection,
  where,
  getDocs
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import type { User, AuthProvider, UserProfile, FirebaseUserToUser } from '../types/auth'
import { validateProfileData, validateProfileImageUrl } from '../validators/profile'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

// Convert Firebase User to our User type
const convertFirebaseUser: FirebaseUserToUser = (firebaseUser: FirebaseUser, provider: AuthProvider): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    provider,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
  }
}

// Create or update user document in Firestore
const createOrUpdateUserDoc = async (user: User, profile?: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', user.id)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    // Create new user document
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      profile: profile || {
        nickname: user.displayName || '',
        danceLevel: 'beginner',
        location: '',
        interests: []
      }
    })
  } else {
    // Update last login time
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      ...(profile && { profile: { ...userDoc.data().profile, ...profile } })
    })
  }

  // Return updated user data
  const updatedDoc = await getDoc(userRef)
  return { ...user, profile: updatedDoc.data()?.profile }
}

// Google Authentication
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = convertFirebaseUser(result.user, 'google')
    return await createOrUpdateUserDoc(user)
  } catch (error: any) {
    console.error('Google sign-in error:', error)

    // Handle specific Firebase auth errors
    if (error.code === 'auth/configuration-not-found') {
      throw new Error('Google 인증이 Firebase 프로젝트에서 활성화되지 않았습니다. Firebase 콘솔에서 Google 인증을 활성화해주세요.')
    }

    if (error.code === 'auth/popup-blocked') {
      throw new Error('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
    }

    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('로그인이 취소되었습니다.')
    }

    throw error
  }
}

// Kakao Authentication (placeholder for now - requires OAuth setup)
export const signInWithKakao = async (): Promise<User> => {
  // For now, we'll show an alert that Kakao auth is coming soon
  // In production, this would integrate with Kakao OAuth
  throw new Error('kakao-not-implemented')
}

// Naver Authentication (placeholder for now - requires OAuth setup)
export const signInWithNaver = async (): Promise<User> => {
  // For now, we'll show an alert that Naver auth is coming soon
  // In production, this would integrate with Naver OAuth
  throw new Error('naver-not-implemented')
}

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = convertFirebaseUser(result.user, 'email')
    return await createOrUpdateUserDoc(user)
  } catch (error: any) {
    console.error('Email sign-in error:', error)
    throw error
  }
}

// Email/Password Registration
export const signUpWithEmail = async (
  email: string,
  password: string,
  profile: Partial<UserProfile>
): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = convertFirebaseUser(result.user, 'email')
    return await createOrUpdateUserDoc(user, profile)
  } catch (error: any) {
    console.error('Email sign-up error:', error)
    throw new Error(error.code || 'email-signup-failed')
  }
}

// Sign Out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    console.error('Sign-out error:', error)
    throw new Error(error.code || 'signout-failed')
  }
}

/**
 * 닉네임 중복 검사 헬퍼 함수
 */
const checkNicknameDuplicate = async (
  nickname: string,
  currentUserId: string
): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users')
    const nicknameQuery = query(
      usersRef,
      where('profile.nickname', '==', nickname)
    )
    const snapshot = await getDocs(nicknameQuery)

    // 다른 사용자가 동일한 닉네임을 사용하고 있는지 확인
    for (const docSnapshot of snapshot.docs) {
      if (docSnapshot.id !== currentUserId) {
        return true // 중복됨
      }
    }

    return false // 중복되지 않음
  } catch (error) {
    console.error('Nickname duplicate check error:', error)
    throw new Error('nickname-check-failed')
  }
}

// Update User Profile (강화 버전)
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile> & { photoURL?: string | null }
): Promise<void> => {
  try {
    const { photoURL, ...profile } = profileData

    // 유효성 검증
    const profileValidation = validateProfileData(profile)
    if (!profileValidation.valid) {
      throw new Error(profileValidation.error || 'profile-validation-failed')
    }

    // 프로필 이미지 URL 검증
    if (photoURL !== undefined) {
      const photoURLValidation = validateProfileImageUrl(photoURL)
      if (!photoURLValidation.valid) {
        throw new Error(photoURLValidation.error || 'photourl-validation-failed')
      }
    }

    // Transaction으로 닉네임 중복 검사 및 업데이트 원자적 처리
    const userRef = doc(db, 'users', userId)

    await runTransaction(db, async (transaction) => {
      // 사용자 문서 존재 확인
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) {
        throw new Error('user-not-found')
      }

      const currentData = userDoc.data()
      const currentNickname = currentData.profile?.nickname

      // 닉네임이 변경되는 경우 중복 검사
      if (profile.nickname && profile.nickname !== currentNickname) {
        const isDuplicate = await checkNicknameDuplicate(profile.nickname, userId)
        if (isDuplicate) {
          throw new Error('nickname-already-in-use')
        }
      }

      // 업데이트할 데이터 구성
      const updateData: Record<string, any> = {
        updatedAt: serverTimestamp()
      }

      // 프로필 필드 업데이트 (기존 프로필과 병합)
      if (Object.keys(profile).length > 0) {
        updateData.profile = {
          ...currentData.profile,
          ...profile
        }
      }

      // 프로필 이미지 URL 업데이트 (최상위 필드)
      if (photoURL !== undefined) {
        updateData.photoURL = photoURL
      }

      // Transaction으로 업데이트
      transaction.update(userRef, updateData)
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    throw new Error(error.message || error.code || 'profile-update-failed')
  }
}

// Get User Profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    return userDoc.exists() ? userDoc.data().profile || null : null
  } catch (error: any) {
    console.error('Get profile error:', error)
    return null
  }
}