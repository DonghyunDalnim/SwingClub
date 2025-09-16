import {
  FirebaseConfig,
  FirebaseAdminConfig,
  FirebaseProjectInfo,
  FirebaseServiceStatus,
  ProjectSetupValidation,
  EnvironmentValidation
} from '../lib/types/firebase';

describe('Firebase Types', () => {
  describe('FirebaseConfig', () => {
    it('should create a valid Firebase config object', () => {
      const config: FirebaseConfig = {
        apiKey: 'AIzaSyTest123',
        authDomain: 'test-project.firebaseapp.com',
        projectId: 'test-project-id',
        storageBucket: 'test-project.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abcdef',
        measurementId: 'G-ABC123DEF'
      };

      expect(config.apiKey).toBe('AIzaSyTest123');
      expect(config.authDomain).toBe('test-project.firebaseapp.com');
      expect(config.projectId).toBe('test-project-id');
      expect(config.storageBucket).toBe('test-project.appspot.com');
      expect(config.messagingSenderId).toBe('123456789');
      expect(config.appId).toBe('1:123456789:web:abcdef');
      expect(config.measurementId).toBe('G-ABC123DEF');
    });

    it('should allow config without measurementId (Analytics is optional)', () => {
      const config: FirebaseConfig = {
        apiKey: 'AIzaSyTest123',
        authDomain: 'test-project.firebaseapp.com',
        projectId: 'test-project-id',
        storageBucket: 'test-project.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abcdef'
      };

      expect(config.measurementId).toBeUndefined();
      expect(config.apiKey).toBe('AIzaSyTest123');
    });
  });

  describe('FirebaseAdminConfig', () => {
    it('should create a valid Firebase Admin config object', () => {
      const adminConfig: FirebaseAdminConfig = {
        type: 'service_account',
        project_id: 'test-project-id',
        private_key_id: 'private-key-id-123',
        private_key: '-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC\\n-----END PRIVATE KEY-----\\n',
        client_email: 'firebase-adminsdk-12345@test-project.iam.gserviceaccount.com',
        client_id: '123456789012345678901',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-12345%40test-project.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com'
      };

      expect(adminConfig.type).toBe('service_account');
      expect(adminConfig.project_id).toBe('test-project-id');
      expect(adminConfig.client_email).toContain('firebase-adminsdk');
      expect(adminConfig.private_key).toContain('BEGIN PRIVATE KEY');
    });
  });

  describe('FirebaseProjectInfo', () => {
    it('should create a valid Firebase project info object', () => {
      const projectInfo: FirebaseProjectInfo = {
        projectId: 'swing-connect-prod',
        projectName: 'Swing Connect',
        region: 'asia-northeast3',
        createdAt: '2024-01-15T09:30:00Z',
        analyticsEnabled: true,
        memberCount: 3
      };

      expect(projectInfo.projectId).toBe('swing-connect-prod');
      expect(projectInfo.projectName).toBe('Swing Connect');
      expect(projectInfo.region).toBe('asia-northeast3');
      expect(projectInfo.analyticsEnabled).toBe(true);
      expect(projectInfo.memberCount).toBe(3);
    });

    it('should handle project without analytics', () => {
      const projectInfo: FirebaseProjectInfo = {
        projectId: 'test-project',
        projectName: 'Test Project',
        region: 'us-central1',
        createdAt: '2024-01-15T09:30:00Z',
        analyticsEnabled: false,
        memberCount: 1
      };

      expect(projectInfo.analyticsEnabled).toBe(false);
    });
  });

  describe('FirebaseServiceStatus', () => {
    it('should create service status with all services enabled', () => {
      const serviceStatus: FirebaseServiceStatus = {
        auth: true,
        firestore: true,
        storage: true,
        messaging: true,
        analytics: true
      };

      expect(serviceStatus.auth).toBe(true);
      expect(serviceStatus.firestore).toBe(true);
      expect(serviceStatus.storage).toBe(true);
      expect(serviceStatus.messaging).toBe(true);
      expect(serviceStatus.analytics).toBe(true);
    });

    it('should create service status with partial services enabled', () => {
      const serviceStatus: FirebaseServiceStatus = {
        auth: true,
        firestore: true,
        storage: false,
        messaging: false,
        analytics: false
      };

      expect(serviceStatus.auth).toBe(true);
      expect(serviceStatus.firestore).toBe(true);
      expect(serviceStatus.storage).toBe(false);
      expect(serviceStatus.messaging).toBe(false);
      expect(serviceStatus.analytics).toBe(false);
    });
  });

  describe('ProjectSetupValidation', () => {
    it('should create a successful validation result', () => {
      const validation: ProjectSetupValidation = {
        projectExists: true,
        configurationValid: true,
        servicesEnabled: {
          auth: true,
          firestore: true,
          storage: true,
          messaging: true,
          analytics: true
        },
        regionCorrect: true,
        analyticsConfigured: true,
        errors: [],
        warnings: []
      };

      expect(validation.projectExists).toBe(true);
      expect(validation.configurationValid).toBe(true);
      expect(validation.regionCorrect).toBe(true);
      expect(validation.analyticsConfigured).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
      expect(Object.values(validation.servicesEnabled).every(Boolean)).toBe(true);
    });

    it('should create a validation result with errors and warnings', () => {
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
        errors: [
          'Firebase 프로젝트가 존재하지 않습니다',
          '환경변수 설정이 유효하지 않습니다'
        ],
        warnings: [
          '지역 설정을 확인하세요',
          'Analytics 설정이 필요합니다'
        ]
      };

      expect(validation.projectExists).toBe(false);
      expect(validation.configurationValid).toBe(false);
      expect(validation.errors).toHaveLength(2);
      expect(validation.warnings).toHaveLength(2);
      expect(validation.errors[0]).toBe('Firebase 프로젝트가 존재하지 않습니다');
      expect(validation.warnings[0]).toBe('지역 설정을 확인하세요');
    });
  });

  describe('EnvironmentValidation', () => {
    it('should create a successful environment validation', () => {
      const envValidation: EnvironmentValidation = {
        allVariablesPresent: true,
        clientConfigValid: true,
        adminConfigValid: true,
        vapidKeyPresent: true,
        missingVariables: [],
        invalidVariables: []
      };

      expect(envValidation.allVariablesPresent).toBe(true);
      expect(envValidation.clientConfigValid).toBe(true);
      expect(envValidation.adminConfigValid).toBe(true);
      expect(envValidation.vapidKeyPresent).toBe(true);
      expect(envValidation.missingVariables).toHaveLength(0);
      expect(envValidation.invalidVariables).toHaveLength(0);
    });

    it('should create environment validation with missing variables', () => {
      const envValidation: EnvironmentValidation = {
        allVariablesPresent: false,
        clientConfigValid: false,
        adminConfigValid: false,
        vapidKeyPresent: false,
        missingVariables: [
          'NEXT_PUBLIC_FIREBASE_API_KEY',
          'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
          'FIREBASE_PRIVATE_KEY'
        ],
        invalidVariables: [
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
        ]
      };

      expect(envValidation.allVariablesPresent).toBe(false);
      expect(envValidation.missingVariables).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(envValidation.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    });
  });

  describe('Type compatibility and integration', () => {
    it('should allow FirebaseServiceStatus to be used in ProjectSetupValidation', () => {
      const services: FirebaseServiceStatus = {
        auth: true,
        firestore: true,
        storage: false,
        messaging: false,
        analytics: true
      };

      const validation: ProjectSetupValidation = {
        projectExists: true,
        configurationValid: true,
        servicesEnabled: services,
        regionCorrect: true,
        analyticsConfigured: true,
        errors: [],
        warnings: []
      };

      expect(validation.servicesEnabled).toEqual(services);
      expect(validation.servicesEnabled.auth).toBe(true);
      expect(validation.servicesEnabled.storage).toBe(false);
    });

    it('should validate realistic Firebase configuration structure', () => {
      // Simulate real Firebase configuration scenario
      const config: FirebaseConfig = {
        apiKey: 'AIzaSyC7K8J9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z',
        authDomain: 'swing-connect-prod.firebaseapp.com',
        projectId: 'swing-connect-prod',
        storageBucket: 'swing-connect-prod.appspot.com',
        messagingSenderId: '123456789012',
        appId: '1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k',
        measurementId: 'G-ABCDEFGHIJ'
      };

      const projectInfo: FirebaseProjectInfo = {
        projectId: config.projectId,
        projectName: 'Swing Connect',
        region: 'asia-northeast3',
        createdAt: new Date().toISOString(),
        analyticsEnabled: !!config.measurementId,
        memberCount: 2
      };

      expect(projectInfo.projectId).toBe(config.projectId);
      expect(projectInfo.analyticsEnabled).toBe(true);
      expect(config.authDomain).toContain(config.projectId);
      expect(config.storageBucket).toContain(config.projectId);
    });
  });
});