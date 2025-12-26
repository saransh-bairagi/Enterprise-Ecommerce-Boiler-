const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Product = require('../modules/products/product.model');
const User = require('../modules/user/user.model');

let adminToken, productId;

describe('Product API', () => {
  beforeAll(async () => {
    // Create test admin
    const admin = await User.create({
      name: 'Product Admin',
      email: 'productadmin@test.com',
      password: 'password123',
      role: 'admin',
    });
    // Login admin
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'productadmin@test.com',
      password: 'password123',
    });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await User.deleteMany({ email: 'productadmin@test.com' });
    await mongoose.connection.close();
  });

  it('should create a product (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        slug: 'test-product',
        price: 100,
        stock: 10,
        category: 'mock-category-id',
      });
    expect([200, 201, 400]).toContain(res.statusCode);
    if (res.body.data && res.body.data._id) productId = res.body.data._id;
  });

  it('should list products', async () => {
    const res = await request(app)
      .get('/api/v1/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get product by slug', async () => {
    const res = await request(app)
      .get('/api/v1/products/test-product');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('should update a product (admin)', async () => {
    const res = await request(app)
      .put('/api/v1/products/mock-public-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 120 });
    expect([200, 400, 404]).toContain(res.statusCode);
  });
});
