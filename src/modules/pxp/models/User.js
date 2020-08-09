const { __ } = require('../PxpError');
const BaseModel = require('../BaseModel');
const PxpError = require('../PxpError');

class User extends BaseModel {
  insertUser = 'INSERT INTO pxp.user1(username, email, password) VALUES($1, $2, $3) RETURNING username';
  constructor() {
    super();
  }

  async addUser(client, params) {
    const res = await __(client.query(this.insertUser, [params.userName, params.email, params.password]));
    return res.rows;
  }

}

module.exports = User;
