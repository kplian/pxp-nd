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
const config = require('../../config');
var myPool = mysql.createPool(config.myPoolConfig);

//Promisify query and pool for async / await usages later
const connection = () => {
    return new Promise((resolve, reject) => {
        myPool.getConnection((err, connection) => {
      if (err) reject(err);      
      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
           connection.query(sql, binding, (err, result) => {
             if (err) reject(err);
             resolve(result);
             });
           });
         };
         const release = () => {
           return new Promise((resolve, reject) => {
             if (err) reject(err);             
             resolve(connection.release());
           });
         };
         resolve({ query, release });
       });
     });
   };
  const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
        myPool.query(sql, binding, (err, result, fields) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  };

module.exports = { myPool, connection, query };
