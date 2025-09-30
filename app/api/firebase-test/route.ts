/**
 * Firebase connection test API endpoint (App Router)
 */

import { NextRequest, NextResponse } from 'next/server'
import { testFirebaseConnection, checkFirebaseEnv } from '../../../lib/auth/firebase-test'

type TestResult = {
  success: boolean
  message: string
  env: ReturnType<typeof checkFirebaseEnv>
  connection?: any
}

export async function GET(req: NextRequest) {
  try {
    const envCheck = checkFirebaseEnv()
    const connectionTest = await testFirebaseConnection()

    const result: TestResult = {
      success: connectionTest.success && envCheck.allPresent,
      message: connectionTest.message,
      env: envCheck,
      connection: connectionTest.details
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    const result: TestResult = {
      success: false,
      message: `Firebase test failed: ${error.message}`,
      env: checkFirebaseEnv()
    }

    return NextResponse.json(result, { status: 500 })
  }
}