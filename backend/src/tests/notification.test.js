const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Notification = require('./notification.model');

let adminToken, userToken, userId;

describe('Notification API', () => {
  beforeAll(async () => {
    // Create test user
    // (Assume user and admin exist and can login)
    const userRes = await request(app).post('/api/v1/auth/login').send({
      email: 'user@test.com',
      password: 'password123',
    });
    userToken = userRes.body.token;
    userId = userRes.body.user && userRes.body.user._id;
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
    });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  it('should send a notification to user', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, type: 'email', email: 'user@test.com', subject: 'Test', body: 'Test notification' });
    expect([200, 201]).toContain(res.statusCode);
  });

  it('should get user notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should mark all as read', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/mark-all-read')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });
});
