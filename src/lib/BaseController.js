const fs = require('fs');
const { split } = require('lodash');
const config = require('../../config');
const { __, PxpError } = require('./PxpError');

class BaseController {

  constructor(method, res, next) {
    this.method = method;
    this.res = res;
    this.next = next;
    this.methodValidated = false;
    this.storedProcedure = '';
    this.transaction = '';
    this.async = false;
    this.schemaValidated = false;
    this.model = '';
    this.modelFunction = '';
    this.params = {};
    this.checkPermissions = true;

  }
  setParams(params) {
    this.params = params;
  }
  setMethod(method) {
    if (method !== this.method) {
      throw new PxpError(406, 'Incorrect Method');
    }
    this.methodValidated = true;
  }

  setTransaction(transaction) {
    this.transaction = transaction;
  }
  setStoreProcedure(storedProcedure) {
    if (this.model !== '') {
      throw new PxpError(500, 'Model and stored procedure can not be used at the same time');
    }
    this.storedProcedure = storedProcedure;
  }
  setAsync(async) {
    this.async = async;
  }
  async validateSchema(schema) {
    const value = await __(schema.validateAsync(this.params, { abortEarly: false }), true);
    this.schemaValidated = true;
    return value;
  }

  setModel(model, modelFunction) {
    if (this.storedProcedure !== '') {
      throw new PxpError(500, 'Model and storedProcedure can not be used at the same time');
    }
    this.model = model;
    this.modelFunction = modelFunction;
  }

  setCheckPermissions(checkPermissions) {
    this.checkPermissions = checkPermissions;
  }

  async execDB() {
    if (!this.methodValidated) {
      throw new PxpError(500, 'Method was not validated in controller');
    }
    if (!this.schemaValidated) {
      throw new PxpError(500, 'Schema not validated in controller');
    }
    return ({ success: true, devolucion: 'fdafdasfads' });
  }

  async execModel(params) {
    if (!this.schemaValidated) {
      throw new PxpError(500, 'Schema not validated in controller');
    }
    if (!this.methodValidated) {
      throw new PxpError(500, 'Method was not validated in controller');
    }
    //split subsystem and model
    const subMod = split(this.model, '/');
    if (subMod.length === 1) {
      throw new PxpError(500, 'System and model must be defined with this syntax: system/model');
    }

    // check if postgres model exists and save path
    let modelPath = __dirname + '/../modules/' + subMod[0] + '/models/' + subMod[1] + '.js';
    if (!fs.existsSync(modelPath)) {
      throw new PxpError(500, 'Not found Model');
    }

    const auxPath = __dirname + '/../modules/' + subMod[0] + '/models/' + config.database + '/' + subMod[1] + '.js'
    // if db != postgres check if db model exists and save path
    if (config.dbms !== 'postgres' && fs.existsSync()) {
      modelPath = auxPath;
    }

    const Model = require(modelPath);
    const m = new Model();
    if (typeof m[this.modelFunction] !== 'function') {
      throw new PxpError(500, 'Not found model function');
    }
    const res = await __(m.exec(this.transaction, this.modelFunction, params, this.checkPermissions));
    return res;
  }

  response(data) {
    this.res.json({ error: false, data });
  }

  // @todo make available calls to db without middle
}

module.exports = BaseController;
