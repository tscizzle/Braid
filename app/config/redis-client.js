var redis = require("redis");

var client = redis.createClient(process.env.REDIS_URL);

module.exports = {
    client: client
};
