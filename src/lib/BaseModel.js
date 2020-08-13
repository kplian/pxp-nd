/**
 * BaseModel Class.
 *
 * All common models functionality should go here (all models should inherit this class).
 *
 * @link   src/lib/BaseModel.js
 * @file   BaseModel Class.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */
const { PxpError, __ } = require('./PxpError');
const config = require('../../config');
class BaseModel {

  constructor() {
    switch (config.dbms) {
      case 'mysql':
        this.mysql = require('./MyPool');
        break;      
      default:
        this.pool = require('./PgPool');
        break;
    }    
  }

  async exec(transaction, modelFunction, params, checkPermissions = true) {
    this.transaction = transaction;
    this.modelFunction = modelFunction;
    let res = {};
    switch (config.dbms) {
      case 'mysql':
        res = await __(this.myExec(params, checkPermissions));
        break;      
      default:
        res = await __(this.pgExec(params, checkPermissions));
        break;
    }     
    return res;    
  }

  async pgExec(params, checkPermissions) {
    const client = await __(this.pool.connect());    
    let res = {};
    try {
      
      await client.query('BEGIN');
      if (checkPermissions) {
        console.log('validate permission for' + this.transaction);
      }
      
      res = await this[this.modelFunction](client, params);// eval('res = this.' + this.modelFunction + '(client, params)');
      
      await client.query('COMMIT');
      console.log('async without wait insert to log');
    } catch (e) {
      await client.query('ROLLBACK');
      console.log('sync without wait insert to log');
      throw e
    } finally {
      client.release();
    }    
    return res;
  }

  async myExec(params, checkPermissions) {
    const client = await __(this.mysql.connection());    
    let res = {};
    try {
      
      await client.query('START TRANSACTION');
      if (checkPermissions) {
        console.log('validate permission for' + this.transaction);
      }
      
      res = await this[this.modelFunction](client, params);// eval('res = this.' + this.modelFunction + '(client, params)');
      
      await client.query('COMMIT');
      console.log('async without wait insert to log');
    } catch (e) {
      await client.query('ROLLBACK');
      console.log('sync without wait insert to log');
      throw e
    } finally {
      client.release();
    }    
    return res;
  }

}

module.exports = BaseModel;
