/**
 * User Controller.
 *
 * All User functionality (not includes authentication).
 *
 * @link   src/modules/pxp/controllers/User.js
 * @file   User Class.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */

const Joi = require('@hapi/joi');
const { __ } = require('../../../lib/PxpError');
const BaseController = require('../../../lib/BaseController');

class User extends BaseController {

  constructor(method, res, next) {
    super(method, res, next);
  }

  async add() {
    this.setMethod('POST');
    this.setTransaction('SEGU_ADDUSER_INS');
    //this.setStoreProcedure('pxp.ft_user');
    this.setModel('pxp/User', 'add');
    //this.setAsync(true);
    const schema = Joi.object({
      userName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required(),
    });
    const params = await __(this.validateSchema(schema));

    // call to database
    // const a = await __(this.execDB(params));

    //call to Model
    const a = await __(this.execModel(params));
    // anything you send here will go inside data object
    this.response(a);
  }

  async list() {
    this.setMethod('GET');
    this.setTransaction('SEGU_ADDUSER_SEL');    
    this.setModel('pxp/User', 'list');
    
    const schema = Joi.object({
      start: Joi.number().required(),
      limit: Joi.number().required(),     
    });

    const params = await __(this.validateSchema(schema)); 
    
    const a = await __(this.execModel(params));    
    this.response(a);
  }

}

module.exports = User;
