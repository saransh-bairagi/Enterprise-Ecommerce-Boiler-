const request = require('supertest');
const app = require('../../../app');
const mongoose = require('mongoose');
const Shipment = require('../../../../models/shipment.model');
const ShippingFactory = require('../shippingFactory');

describe('Delhivery Shipping Provider', () => {
  let shipmentId;
  const delhivery = ShippingFactory('DELHIVERY');

  afterAll(async () => {
    await Shipment.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a shipment', async () => {
    const res = await request(app)
      .post('/shipping/delhivery/create-shipment')
      .send({ orderId: 'order1', pickup: { p: 1 }, delivery: { d: 1 } });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    shipmentId = res.body.data.shipmentId;
  });

  it('should track a shipment', async () => {
    const res = await request(app)
      .get(`/shipping/delhivery/track/${shipmentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should cancel a shipment', async () => {
    const res = await request(app)
      .post(`/shipping/delhivery/cancel/${shipmentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should fetch rates', async () => {
    const res = await request(app)
      .get('/shipping/delhivery/rates?weight=1&destination=XYZ');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should process webhook', async () => {
    const res = await request(app)
      .post('/shipping/delhivery/webhook')
      .send({ event: 'DELIVERED', shipmentId });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should switch provider using factory', () => {
    expect(() => ShippingFactory('DELHIVERY')).not.toThrow();
    expect(() => ShippingFactory('SHIPROCKET')).toThrow();
  });
});