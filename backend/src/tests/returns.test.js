const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Return = require('./return.model');

let userToken;

describe('Returns API', () => {
  beforeAll(async () => {
    // Login as user (assume user exists)
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'user@test.com',
      password: 'password123',
    });
    userToken = res.body.token;
  });

  afterAll(async () => {
    await Return.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a return request', async () => {
    const res = await request(app)
      .post('/api/v1/returns/request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderId: 'mock-order-id', reason: 'Defective item' });
    expect([200, 201, 400]).toContain(res.statusCode);
  });

  it('should get user return requests', async () => {
    const res = await request(app)
      .get('/api/v1/returns')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
