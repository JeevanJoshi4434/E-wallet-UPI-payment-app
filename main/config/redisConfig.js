const {Redis} = require('ioredis');

const redisClient = new Redis(
    {
        host: process.env.REDIS_HOST,
        port: 6379
    }
);

module.exports = {
    redisClient
}