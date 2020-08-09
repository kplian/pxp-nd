const pg = require('pg');
const config = require('./Config');

var pool = new pg.Pool(config.pgPoolConfig);

module.exports = pool;
