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
const mysql = require('mysql');
const config = require('../config');

const myPool = mysql.createPool(config.myPoolConfig);

// Promisify query and pool for async / await usages later
const connection = () => new Promise((resolve, reject) => {
  myPool.getConnection((err, con) => {
    if (err) reject(err);
    const query = (sql, binding) => new Promise((inresolve, inreject) => {
      con.query(sql, binding, (error, result) => {
        if (error) inreject(error);
        inresolve(result);
      });
    });
    const release = () => new Promise((inresolve, inreject) => {
      if (err) inreject(err);
      inresolve(con.release());
    });
    resolve({ query, release });
  });
});
const query = (sql, binding) => new Promise((resolve, reject) => {
  myPool.query(sql, binding, (err, result) => {
    if (err) reject(err);
    resolve(result);
  });
});

module.exports = { myPool, connection, query };
