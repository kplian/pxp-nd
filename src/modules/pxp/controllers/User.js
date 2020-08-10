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

  async addUser() {
    this.setMethod('POST');
    this.setTransaction('SEGU_ADDUSER');
    //this.setStoreProcedure('pxp.ft_user');
    this.setModel('pxp/User', 'addUser');
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

}

module.exports = User;
