const { PxpError, __ } = require('./PxpError');
const config = require('../../config');
class BaseModel {

  constructor() {
    if (config.dbms === 'postgres') {
      this.pool = require('./PgPool');
    }
  }

  async exec(transaction, modelFunction, params, checkPermissions = true) {
    this.transaction = transaction;
    this.modelFunction = modelFunction;
    const client = await __(this.pool.connect());
    let res = {};
    try {
      await client.query('BEGIN');
      if (checkPermissions) {
        console.log('validar permisos for' + this.transaction);
      }
      await eval('res = this.' + this.modelFunction + '(client, params)');
      await client.query('COMMIT');
      console.log('async without wait insert to log');
    } catch (e) {
      await client.query('ROLLBACK');
      console.log('sync without wait insert to log');
      throw e
    } finally {
      client.release();
    }
    // return res;
    return res;
  }

}

module.exports = BaseModel;
