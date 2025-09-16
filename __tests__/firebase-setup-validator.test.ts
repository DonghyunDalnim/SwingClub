import * as fs from 'fs';
import * as path from 'path';
import { FirebaseSetupValidator } from '../scripts/validate-firebase-setup';
import { EnvironmentValidation, ProjectSetupValidation } from '../lib/types/firebase';

// Mock fs module
jest.mock('fs');
const mockedFs = jest.mocked(fs);

describe('FirebaseSetupValidator', () => {
  let validator: FirebaseSetupValidator;
  const mockEnvPath = path.join(process.cwd(), '.env.local');

  beforeEach(() => {
    validator = new FirebaseSetupValidator();
    jest.clearAllMocks();
  });

  describe('validateEnvironment', () => {
    it('should return all missing variables when .env.local does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.allVariablesPresent).toBe(false);
      expect(result.missingVariables).toContain('.env.local 파일이 존재하지 않습니다');
      expect(mockedFs.existsSync).toHaveBeenCalledWith(mockEnvPath);
    });

    it('should validate all required client variables are present', () => {
      const validEnvContent = `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyTest123456789012345678901234567890
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project-id-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123DEF456
FIREBASE_PROJECT_ID=test-project-id-12345
FIREBASE_PRIVATE_KEY_ID=private-key-id-123456789
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC123456789\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-12345@test-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BL1234567890abcdef123456789`;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(validEnvContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.clientConfigValid).toBe(true);
      expect(result.adminConfigValid).toBe(true);
      expect(result.vapidKeyPresent).toBe(true);
      expect(result.allVariablesPresent).toBe(true);
      expect(result.missingVariables).toHaveLength(0);
      expect(result.invalidVariables).toHaveLength(0);
    });

    it('should detect missing client variables', () => {
      const incompleteEnvContent = `
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyTest123
        # NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project-id
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(incompleteEnvContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.clientConfigValid).toBe(false);
      expect(result.missingVariables).toContain('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
      expect(result.missingVariables).toContain('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
      expect(result.missingVariables).toContain('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
      expect(result.missingVariables).toContain('NEXT_PUBLIC_FIREBASE_APP_ID');
    });

    it('should detect invalid placeholder values', () => {
      const invalidEnvContent = `
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
        NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(invalidEnvContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.clientConfigValid).toBe(false);
      expect(result.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(result.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
      expect(result.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    });

    it('should handle quoted environment variable values', () => {
      const quotedEnvContent = `
        NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyTest123"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN='test-project.firebaseapp.com'
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project-id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
        NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(quotedEnvContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.clientConfigValid).toBe(false); // Still missing admin vars
      expect(result.invalidVariables).not.toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(result.invalidVariables).not.toContain('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    });

    it('should ignore comments and empty lines in env file', () => {
      const envWithCommentsContent = `
        # Firebase Configuration
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyTest123

        # Auth domain
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-project.firebaseapp.com

        NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project-id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
        NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(envWithCommentsContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.invalidVariables).not.toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
    });
  });

  describe('validateProjectSetup', () => {
    it('should return invalid configuration when environment validation fails', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result: ProjectSetupValidation = validator.validateProjectSetup();

      expect(result.projectExists).toBe(false);
      expect(result.configurationValid).toBe(false);
      expect(result.errors).toContain('클라이언트 Firebase 설정이 유효하지 않습니다');
    });

    it('should validate project exists when project ID is valid', () => {
      const validEnvContent = `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyTest123456789012345678901234567890
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-project-id-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project-id-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project-id-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123DEF456`;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(validEnvContent);

      const result: ProjectSetupValidation = validator.validateProjectSetup();

      expect(result.projectExists).toBe(true);
      expect(result.regionCorrect).toBe(true);
      expect(result.analyticsConfigured).toBe(true);
      expect(result.servicesEnabled.auth).toBe(true);
      expect(result.servicesEnabled.firestore).toBe(true);
      expect(result.servicesEnabled.storage).toBe(true);
      expect(result.servicesEnabled.messaging).toBe(true);
      expect(result.servicesEnabled.analytics).toBe(true);
      expect(result.configurationValid).toBe(true);
    });

    it('should detect missing analytics configuration', () => {
      const noAnalyticsEnvContent = `
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyTest123
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-project.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project-id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
        NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
        # No MEASUREMENT_ID
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(noAnalyticsEnvContent);

      const result: ProjectSetupValidation = validator.validateProjectSetup();

      expect(result.analyticsConfigured).toBe(false);
      expect(result.servicesEnabled.analytics).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed env file', () => {
      const malformedEnvContent = `
        NEXT_PUBLIC_FIREBASE_API_KEY
        =
        INVALID_LINE_WITHOUT_EQUALS
        =VALUE_WITHOUT_KEY
        KEY_WITH_MULTIPLE=EQUALS=SIGNS=HERE
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(malformedEnvContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.allVariablesPresent).toBe(false);
    });

    it('should handle empty env file', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('');

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.allVariablesPresent).toBe(false);
      expect(result.clientConfigValid).toBe(false);
      expect(result.adminConfigValid).toBe(false);
    });

    it('should handle env file with only comments', () => {
      const commentsOnlyContent = `
        # Firebase Configuration
        # Add your configuration here
        # NEXT_PUBLIC_FIREBASE_API_KEY=your_key
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(commentsOnlyContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.allVariablesPresent).toBe(false);
    });
  });

  describe('security validations', () => {
    it('should reject keys that are too short (potential placeholder values)', () => {
      const shortKeysContent = `
        NEXT_PUBLIC_FIREBASE_API_KEY=short
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=test
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123
        NEXT_PUBLIC_FIREBASE_APP_ID=app
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(shortKeysContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.clientConfigValid).toBe(false);
      expect(result.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(result.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      expect(result.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
      expect(result.invalidVariables).toContain('NEXT_PUBLIC_FIREBASE_APP_ID');
    });

    it('should accept realistic Firebase configuration values', () => {
      const realisticContent = `
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC7K8J9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=swing-connect-prod.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=swing-connect-prod
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=swing-connect-prod.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
        NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
        FIREBASE_PROJECT_ID=swing-connect-prod
        FIREBASE_PRIVATE_KEY_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC\\n-----END PRIVATE KEY-----\\n"
        FIREBASE_CLIENT_EMAIL=firebase-adminsdk-a1b2c@swing-connect-prod.iam.gserviceaccount.com
        FIREBASE_CLIENT_ID=123456789012345678901
      `;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(realisticContent);

      const result: EnvironmentValidation = validator.validateEnvironment();

      expect(result.allVariablesPresent).toBe(true);
      expect(result.clientConfigValid).toBe(true);
      expect(result.adminConfigValid).toBe(true);
      expect(result.invalidVariables).toHaveLength(0);
    });
  });
});