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
const { __ } = require('../../../../lib/PxpError');
const BaseUser = require('../User'); 
class User extends BaseUser {
  
  insertSql = `INSERT INTO 
                user1(username, email, password) 
                VALUES(?, ?, ?);`;
                
  listSql = ` SELECT * 
              FROM user1
              LIMIT ? OFFSET ?
              `; 
  async list(client, params) {    
    const res = await __(client.query(this.listSql, [params.limit, params.start]));
    
    return res;
  }

}

module.exports = User;
