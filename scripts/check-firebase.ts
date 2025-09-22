/**
 * Firebase 설정 확인 스크립트
 */

import { config, isFirebaseInitialized } from '../lib/firebase'

console.log('🔥 Firebase Configuration Check')
console.log('================================')
console.log('')

console.log('📋 Configuration:')
console.log(`  Project ID: ${config.projectId}`)
console.log(`  Auth Domain: ${config.authDomain}`)
console.log(`  Storage Bucket: ${config.storageBucket}`)
console.log(`  App ID: ${config.appId}`)
console.log(`  API Key: ${config.apiKey?.substring(0, 20)}...`)
console.log('')

console.log('⚙️ Services Status:')
console.log(`  Firebase Initialized: ${isFirebaseInitialized() ? '✅' : '❌'}`)
console.log('')

if (isFirebaseInitialized()) {
  console.log('✅ Firebase is properly configured!')
} else {
  console.log('❌ Firebase configuration issue detected.')
}