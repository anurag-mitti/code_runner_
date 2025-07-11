
const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6378,
  maxRetriesPerRequest: 5,  // Maximum retries for each request then throws an error
  retryStrategy: (times) => {
    
    return Math.min(times * 50, 2000); //how long to wait between reconnect attempts, everytime it fails the time increase, but its capped to 2sec
  },
});


redis.on('connect', () => {
  console.log(' Redis client connected');
});

redis.on('ready', () => {
  console.log('Redis is ready to use');
});

redis.on('error', (err) => {
  console.error(' Redis error:', err);
});

redis.on('end', () => {
  console.log('Redis connection closed');
});

module.exports = redis;
