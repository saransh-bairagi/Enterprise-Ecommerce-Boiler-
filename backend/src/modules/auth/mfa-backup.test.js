const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { AuthAdminDAO } = require('./auth.dao');

// Mock admin JWT (replace with a valid token in real tests)
const ADMIN_JWT = process.env.TEST_ADMIN_JWT || 'mock-admin-jwt';
const USER_JWT = process.env.TEST_USER_JWT || 'mock-user-jwt';

// Helper for auth header
const adminAuth = () => ({ Authorization: `Bearer ${ADMIN_JWT}` });
const userAuth = () => ({ Authorization: `Bearer ${USER_JWT}` });

describe('MFA Backup Codes', () => {
  let userId;
  let backupCode;

  beforeAll(async () => {
    // Create a user and enable MFA (mock or seed as needed)
    // For this test, assume userId is known and MFA is enabled
    userId = process.env.TEST_USER_ID || 'mock-user-id';
    // Generate new backup codes
    const res = await request(app)
      .post(`/auth/admin/${userId}/mfa/backup/regenerate`)
      .set(adminAuth())
      .expect(200);
    expect(res.body.success).toBe(true);
    // Get a backup code from DB (simulate, as codes are not exposed)
    const mfa = await AuthAdminDAO.updateMFASecret(userId, {});
    backupCode = mfa.backupCodes[0];
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should validate and consume a backup code', async () => {
    const res = await request(app)
      .post('/auth/mfa/backup/validate')
      .set(userAuth())
      .send({ code: backupCode })
      .expect(200);
    expect(res.body.success).toBe(true);
    // Code should be consumed (removed)
    const mfa = await AuthAdminDAO.updateMFASecret(userId, {});
    expect(mfa.backupCodes).not.toContain(backupCode);
  });

  it('should reject an already used backup code', async () => {
    const res = await request(app)
      .post('/auth/mfa/backup/validate')
      .set(userAuth())
      .send({ code: backupCode })
      .expect(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to regenerate backup codes', async () => {
    const res = await request(app)
      .post(`/auth/admin/${userId}/mfa/backup/regenerate`)
      .set(adminAuth())
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.backupCodesCount).toBe(5);
  });
});
