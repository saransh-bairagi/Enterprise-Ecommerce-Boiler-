const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { AnalyticsDAO } = require('../modules/analytics/analytics.dao');

// Mock admin JWT (replace with a valid token in real tests)
const ADMIN_JWT = process.env.TEST_ADMIN_JWT || 'mock-admin-jwt';

// Helper for auth header
const authHeader = () => ({ Authorization: `Bearer ${ADMIN_JWT}` });

describe('Analytics Admin Endpoints', () => {
  beforeAll(async () => {
    // Optionally seed analytics data here
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /admin/analytics/dashboard', () => {
    it('should return dashboard summary for admin', async () => {
      const res = await request(app)
        .get('/admin/analytics/dashboard')
        .set(authHeader())
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('sales');
      expect(res.body.data).toHaveProperty('traffic');
      expect(res.body.data).toHaveProperty('revenue');
    });
  });

  describe('GET /admin/analytics/sales', () => {
    it('should validate missing query params', async () => {
      const res = await request(app)
        .get('/admin/analytics/sales')
        .set(authHeader())
        .expect(400);
      expect(res.body.success).toBe(false);
    });
    it('should return sales analytics for valid query', async () => {
      const res = await request(app)
        .get('/admin/analytics/sales?startDate=2024-01-01&endDate=2024-12-31')
        .set(authHeader())
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
    });
  });

  describe('GET /admin/analytics/traffic', () => {
    it('should return traffic analytics for valid query', async () => {
      const res = await request(app)
        .get('/admin/analytics/traffic?startDate=2024-01-01&endDate=2024-12-31')
        .set(authHeader())
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
    });
  });

  describe('GET /admin/analytics/revenue', () => {
    it('should return revenue analytics for valid query', async () => {
      const res = await request(app)
        .get('/admin/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31')
        .set(authHeader())
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
    });
  });

  describe('GET /admin/analytics/top-products', () => {
    it('should return top products for valid query', async () => {
      const res = await request(app)
        .get('/admin/analytics/top-products?startDate=2024-01-01&endDate=2024-12-31&limit=5')
        .set(authHeader())
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /admin/analytics/aggregation', () => {
    it('should return aggregation for valid query', async () => {
      const res = await request(app)
        .get('/admin/analytics/aggregation?startDate=2024-01-01&endDate=2024-12-31&groupBy=month')
        .set(authHeader())
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
