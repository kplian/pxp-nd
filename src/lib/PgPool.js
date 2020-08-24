/**
 * Postgres pool Object.
 *
 * Here is created the postgres pool object for database connections.
 *
 * @link   src/lib/PgPool.js
 * @file   pool object.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */
const pg = require('pg');
const config = require('../config');

const pool = new pg.Pool(config.pgPoolConfig);

module.exports = pool;
