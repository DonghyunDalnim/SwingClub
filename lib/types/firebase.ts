/**
 * Firebase 설정 관련 타입 정의
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FirebaseAdminConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export interface FirebaseProjectInfo {
  projectId: string;
  projectName: string;
  region: string;
  createdAt: string;
  analyticsEnabled: boolean;
  memberCount: number;
}

export interface FirebaseServiceStatus {
  auth: boolean;
  firestore: boolean;
  storage: boolean;
  messaging: boolean;
  analytics: boolean;
}

/**
 * Firebase 프로젝트 설정 검증을 위한 인터페이스
 */
export interface ProjectSetupValidation {
  projectExists: boolean;
  configurationValid: boolean;
  servicesEnabled: FirebaseServiceStatus;
  regionCorrect: boolean;
  analyticsConfigured: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 환경변수 검증을 위한 인터페이스
 */
export interface EnvironmentValidation {
  allVariablesPresent: boolean;
  clientConfigValid: boolean;
  adminConfigValid: boolean;
  vapidKeyPresent: boolean;
  missingVariables: string[];
  invalidVariables: string[];
}