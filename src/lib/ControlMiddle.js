const fs = require('fs');
const { PxpError } = require('./PxpError');
class ControlMiddle {

  constructor(method, req, res, next) {
    this.method = method;
    this.req = req;
    this.res = res;
    this.next = next;
    this.params = {};
  }

  async processRequest() {
    if (this.method === 'OPTIONS') {
      this.processRequestOptions();
    } else {
      const myPath = this.req.path.split('/');
      // merge all params
      this.params = { ...this.req.query, ...this.req.body };

      try {
        // check session or token
        this.validateCredentials();
        // check if controller exists
        if (!fs.existsSync(__dirname + '/' + myPath[2] + '/' + myPath[3] + '.js')) {
          throw new PxpError(404, 'Not found Controller');
        }
        //check if api token or session is sent
        // init controller
        const Controller = require(__dirname + '/' + myPath[2] + '/' + myPath[3]);
        const c = new Controller(this.method, this.res, this.next);
        //check if method exists
        if (typeof c[myPath[4]] !== 'function') {
          throw new PxpError(404, 'Not found Method');
        }
        c.setParams(this.params);
        // call to corresponding method
        await eval('c.' + myPath[4] + '()');

      } catch (ex) {
        this.next(ex);
      }

      //
    }

  }

  processRequestOptions() {

  }
  validateCredentials() {
    //validate sesion
    //validate token
    //or is call to auten
  }

}

module.exports = ControlMiddle;
