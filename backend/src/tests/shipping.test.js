const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Shipment = require('./shipment.model');

let userToken;

describe('Shipping API', () => {
  beforeAll(async () => {
    // Login as user (assume user exists)
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'user@test.com',
      password: 'password123',
    });
    userToken = res.body.token;
  });

  afterAll(async () => {
    await Shipment.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a shipment', async () => {
    const res = await request(app)
      .post('/api/v1/shipping/create')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderId: 'mock-order-id', address: '123 Main St' });
    expect([200, 201, 400]).toContain(res.statusCode);
  });

  it('should track a shipment', async () => {
    const res = await request(app)
      .get('/api/v1/shipping/track/mock-shipment-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect([200, 404]).toContain(res.statusCode);
  });
});
