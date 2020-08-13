/**
 * User Model.
 *
 * All User functionality (not includes authentication).
 *
 * @link   src/modules/pxp/models/User.js
 * @file   User Class.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */
const { PxpError, __ } = require('../../../lib/PxpError');
const BaseModel = require('../../../lib/BaseModel');
 
class User extends BaseModel {
  insertSql = `INSERT INTO 
                  pxp.user1(username, email, password) 
                VALUES($1, $2, $3) 
                RETURNING username`;
  listSql = ` SELECT * 
              FROM pxp.user1
              LIMIT $1 OFFSET $2`;

  constructor() {
    super();
  }

  async add(client, params) {
    const res = await __(client.query(this.insertSql, [params.userName, params.email, params.password]));
    return res.rows;
  }

  async list(client, params) {    
    const res = await __(client.query(this.listSql, [params.limit, params.start]));
    return res.rows;
  }

}

module.exports = User;
