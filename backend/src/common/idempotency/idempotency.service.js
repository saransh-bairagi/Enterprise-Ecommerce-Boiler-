// Simple idempotency service for demonstration
// In production, use a persistent store (e.g., Redis, DB)
const store = new Map();

module.exports = {
  async get(key) {
    return store.get(key) || null;
  },
  async save(key, response) {
    store.set(key, { response });
  }
};
