// Simple Redis client using ioredis
const Redis = require('ioredis');
const { REDIS_URL } = process.env;

const redis = new Redis(REDIS_URL || 'redis://localhost:6379');

module.exports = redis;
