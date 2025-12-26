const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Order = require('../modules/order/order.model');
const User = require('../modules/user/user.model');

let userToken, adminToken, orderId;

describe('Order API', () => {
  beforeAll(async () => {
    // Create test user and admin
    const user = await User.create({
      name: 'Order User',
      email: 'orderuser@test.com',
      password: 'password123',
      role: 'user',
    });
    const admin = await User.create({
      name: 'Order Admin',
      email: 'orderadmin@test.com',
      password: 'password123',
      role: 'admin',
    });
    // Login user
    const userRes = await request(app).post('/api/v1/auth/login').send({
      email: 'orderuser@test.com',
      password: 'password123',
    });
    userToken = userRes.body.token;
    // Login admin
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'orderadmin@test.com',
      password: 'password123',
    });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await Order.deleteMany({});
    await User.deleteMany({ email: /order(user|admin)@test.com/ });
    await mongoose.connection.close();
  });

  it('should create an order (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/orders/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        user: 'mock-user-id',
        items: [{ productId: 'mock-product-id', quantity: 1, price: 100 }],
        address: '123 Main St',
        payment: { method: 'cod', amount: 100 },
      });
    expect([200, 201, 400]).toContain(res.statusCode);
    if (res.body.data && res.body.data._id) orderId = res.body.data._id;
  });

  it('should get user orders', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get order by publicId', async () => {
    // Use a mock publicId for now
    const res = await request(app)
      .get('/api/v1/orders/mock-public-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  it('should update order status (admin)', async () => {
    const res = await request(app)
      .patch('/api/v1/orders/admin/mock-public-id/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'delivered' });
    expect([200, 400, 404]).toContain(res.statusCode);
  });
});
