const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Payment = require('./payment.model');

let userToken;

describe('Payment API', () => {
  beforeAll(async () => {
    // Login as user (assume user exists)
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'user@test.com',
      password: 'password123',
    });
    userToken = res.body.token;
  });

  afterAll(async () => {
    await Payment.deleteMany({});
    await mongoose.connection.close();
  });

  it('should initiate a payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 100, method: 'razorpay' });
    expect([200, 400]).toContain(res.statusCode);
  });

  it('should get payment history', async () => {
    const res = await request(app)
      .get('/api/v1/payments/history')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
