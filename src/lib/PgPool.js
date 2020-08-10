const pg = require('pg');
const config = require('../../config');

var pool = new pg.Pool(config.pgPoolConfig);

module.exports = pool;
