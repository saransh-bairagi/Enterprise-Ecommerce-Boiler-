// Delhivery API constants and static values
module.exports = {
  PROVIDER: 'DELHIVERY',
  API_BASE_URL: 'https://api.delhivery.com',
  API_SHIPMENT_CREATE: '/v1/create_shipment',
  API_SHIPMENT_TRACK: '/v1/track',
  API_SHIPMENT_CANCEL: '/v1/cancel',
  API_RATES: '/v1/rates',
  API_WEBHOOK: '/v1/webhook',
  STATUS: {
    CREATED: 'CREATED',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
  },
  RETRY_LIMIT: 3,
  RETRY_BACKOFF_MS: 1000,
};