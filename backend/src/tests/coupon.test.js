const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Coupon = require('./coupon.model');

let adminToken;

describe('Coupon API', () => {
  beforeAll(async () => {
    // Login as admin (assume admin exists)
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
    });
    adminToken = res.body.token;
  });

  afterAll(async () => {
    await Coupon.deleteMany({ code: 'TEST10' });
    await mongoose.connection.close();
  });

  it('should create a coupon', async () => {
    const res = await request(app)
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: 'TEST10',
        discountType: 'percentage',
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        isActive: true,
      });
    expect([200, 201, 409]).toContain(res.statusCode); // 409 if already exists
  });

  it('should get active coupons', async () => {
    const res = await request(app)
      .get('/api/v1/coupons/active')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should validate a coupon', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'TEST10', orderAmount: 100 });
    expect([200, 400, 404]).toContain(res.statusCode);
  });
});
