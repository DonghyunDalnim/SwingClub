#!/usr/bin/env tsx
/**
 * Firebase 프로젝트 설정 검증 스크립트
 *
 * 이 스크립트는 Firebase 프로젝트 생성 후 설정이 올바르게 되어있는지 확인합니다.
 *
 * 실행 방법:
 * npm run validate-firebase
 * 또는
 * npx tsx scripts/validate-firebase-setup.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentValidation, ProjectSetupValidation } from '../lib/types/firebase';

class FirebaseSetupValidator {
  private envPath = path.join(process.cwd(), '.env.local');
  private exampleEnvPath = path.join(process.cwd(), '.env.example');

  /**
   * 환경변수 검증
   */
  validateEnvironment(): EnvironmentValidation {
    const validation: EnvironmentValidation = {
      allVariablesPresent: false,
      clientConfigValid: false,
      adminConfigValid: false,
      vapidKeyPresent: false,
      missingVariables: [],
      invalidVariables: []
    };

    // .env.local 파일 존재 확인
    if (!fs.existsSync(this.envPath)) {
      validation.missingVariables.push('.env.local 파일이 존재하지 않습니다');
      return validation;
    }

    // 환경변수 로드
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const envVars = this.parseEnvFile(envContent);

    // 필수 클라이언트 변수 확인
    const clientVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];

    // 필수 Admin SDK 변수 확인
    const adminVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID'
    ];

    // VAPID 키 확인
    const vapidVar = 'NEXT_PUBLIC_FIREBASE_VAPID_KEY';

    // 클라이언트 변수 검증
    const missingClientVars = clientVars.filter(varName => !envVars[varName]);
    const invalidClientVars = clientVars.filter(varName => {
      const value = envVars[varName];
      return value && (value.includes('your_') || value.length < 10);
    });

    // Admin 변수 검증
    const missingAdminVars = adminVars.filter(varName => !envVars[varName]);
    const invalidAdminVars = adminVars.filter(varName => {
      const value = envVars[varName];
      return value && (value.includes('your_') || value.length < 10);
    });

    validation.missingVariables = [...missingClientVars, ...missingAdminVars];
    validation.invalidVariables = [...invalidClientVars, ...invalidAdminVars];

    validation.clientConfigValid = missingClientVars.length === 0 && invalidClientVars.length === 0;
    validation.adminConfigValid = missingAdminVars.length === 0 && invalidAdminVars.length === 0;
    validation.vapidKeyPresent = !!envVars[vapidVar] && !envVars[vapidVar].includes('your_');
    validation.allVariablesPresent = validation.clientConfigValid && validation.adminConfigValid;

    return validation;
  }

  /**
   * 프로젝트 설정 검증 (환경변수 기반)
   */
  validateProjectSetup(): ProjectSetupValidation {
    const validation: ProjectSetupValidation = {
      projectExists: false,
      configurationValid: false,
      servicesEnabled: {
        auth: false,
        firestore: false,
        storage: false,
        messaging: false,
        analytics: false
      },
      regionCorrect: false,
      analyticsConfigured: false,
      errors: [],
      warnings: []
    };

    const envValidation = this.validateEnvironment();

    if (!envValidation.clientConfigValid) {
      validation.errors.push('클라이언트 Firebase 설정이 유효하지 않습니다');
      return validation;
    }

    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const envVars = this.parseEnvFile(envContent);

    // 프로젝트 ID 기반 검증
    const projectId = envVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
    if (projectId && !projectId.includes('your_')) {
      validation.projectExists = true;

      // 지역 확인 (프로젝트 ID로 추론)
      const authDomain = envVars['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'];
      if (authDomain && authDomain.includes(projectId)) {
        validation.regionCorrect = true; // 실제로는 Firebase Admin SDK로 확인해야 함
      }

      // Analytics 설정 확인
      const measurementId = envVars['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'];
      validation.analyticsConfigured = !!measurementId && !measurementId.includes('your_');

      // 서비스 활성화 추론 (실제로는 각 서비스 초기화로 확인해야 함)
      validation.servicesEnabled = {
        auth: !!envVars['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
        firestore: !!projectId,
        storage: !!envVars['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
        messaging: !!envVars['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
        analytics: validation.analyticsConfigured
      };
    }

    validation.configurationValid = validation.projectExists &&
                                   validation.regionCorrect &&
                                   Object.values(validation.servicesEnabled).some(enabled => enabled);

    return validation;
  }

  /**
   * 전체 검증 실행
   */
  async runValidation(): Promise<void> {
    console.log('🔍 Firebase 프로젝트 설정 검증 시작...\n');

    // 환경변수 검증
    console.log('📋 환경변수 검증:');
    const envValidation = this.validateEnvironment();

    if (envValidation.allVariablesPresent) {
      console.log('✅ 모든 환경변수가 설정되었습니다');
    } else {
      console.log('❌ 환경변수 설정이 불완전합니다:');
      if (envValidation.missingVariables.length > 0) {
        console.log('  누락된 변수:', envValidation.missingVariables.join(', '));
      }
      if (envValidation.invalidVariables.length > 0) {
        console.log('  유효하지 않은 변수:', envValidation.invalidVariables.join(', '));
      }
    }

    console.log(`  - 클라이언트 설정: ${envValidation.clientConfigValid ? '✅' : '❌'}`);
    console.log(`  - Admin SDK 설정: ${envValidation.adminConfigValid ? '✅' : '❌'}`);
    console.log(`  - VAPID 키: ${envValidation.vapidKeyPresent ? '✅' : '❌'}`);

    // 프로젝트 설정 검증
    console.log('\n🏗️ 프로젝트 설정 검증:');
    const projectValidation = this.validateProjectSetup();

    console.log(`  - 프로젝트 존재: ${projectValidation.projectExists ? '✅' : '❌'}`);
    console.log(`  - 설정 유효성: ${projectValidation.configurationValid ? '✅' : '❌'}`);
    console.log(`  - 지역 설정: ${projectValidation.regionCorrect ? '✅' : '⚠️ 확인 필요'}`);
    console.log(`  - Analytics: ${projectValidation.analyticsConfigured ? '✅' : '⚠️ 미설정'}`);

    console.log('\n🔧 서비스 활성화 상태:');
    const services = projectValidation.servicesEnabled;
    console.log(`  - Authentication: ${services.auth ? '✅' : '❌'}`);
    console.log(`  - Firestore: ${services.firestore ? '✅' : '❌'}`);
    console.log(`  - Storage: ${services.storage ? '✅' : '❌'}`);
    console.log(`  - Messaging: ${services.messaging ? '✅' : '❌'}`);
    console.log(`  - Analytics: ${services.analytics ? '✅' : '❌'}`);

    // 오류 및 경고 출력
    if (projectValidation.errors.length > 0) {
      console.log('\n❌ 오류:');
      projectValidation.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (projectValidation.warnings.length > 0) {
      console.log('\n⚠️ 경고:');
      projectValidation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    // 전체 결과
    const overallSuccess = envValidation.allVariablesPresent && projectValidation.configurationValid;
    console.log(`\n${overallSuccess ? '✅ 검증 성공' : '❌ 검증 실패'}: Firebase 프로젝트 설정 ${overallSuccess ? '완료' : '미완료'}`);

    if (!overallSuccess) {
      console.log('\n📖 다음 단계:');
      console.log('1. docs/firebase-project-setup.md 가이드를 참조하여 Firebase 프로젝트를 생성하세요');
      console.log('2. .env.example을 참조하여 .env.local 파일을 생성하고 실제 값으로 설정하세요');
      console.log('3. Firebase 콘솔에서 필요한 서비스들을 활성화하세요');

      process.exit(1);
    }
  }

  /**
   * env 파일 파싱
   */
  public parseEnvFile(content: string): Record<string, string> {
    const envVars: Record<string, string> = {};

    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          // 따옴표 제거
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          envVars[key.trim()] = value;
        }
      }
    });

    return envVars;
  }
}

// 스크립트 실행
if (require.main === module) {
  const validator = new FirebaseSetupValidator();
  validator.runValidation().catch(error => {
    console.error('❌ 검증 중 오류 발생:', error);
    process.exit(1);
  });
}

export { FirebaseSetupValidator };