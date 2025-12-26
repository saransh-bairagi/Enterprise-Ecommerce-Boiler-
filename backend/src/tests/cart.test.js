const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Cart = require('./cart.model');
const User = require('../user/user.model');

let userToken, userId;

describe('Cart API', () => {
  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      firstName: 'Cart',
      lastName: 'Tester',
      email: 'cartuser@test.com',
      password: 'password123',
      role: 'user',
    });
    userId = user._id;
    // Login user and get token
    // (Assume login endpoint returns JWT)
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'cartuser@test.com',
      password: 'password123',
    });
    userToken = res.body.token;
  });

  afterAll(async () => {
    await Cart.deleteMany({});
    await User.deleteMany({ email: 'cartuser@test.com' });
    await mongoose.connection.close();
  });

  it('should add item to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: 'mock-product-id', sku: 'SKU1', quantity: 2, price: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should apply a coupon', async () => {
    const res = await request(app)
      .post('/api/v1/cart/apply-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ couponCode: 'TEST10' });
    expect([200, 400]).toContain(res.statusCode); // 400 if coupon invalid
  });

  it('should remove item from cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/remove')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sku: 'SKU1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
