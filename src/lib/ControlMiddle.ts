/**
 * Control Middle Class.
 *
 * All request must go by this middleware.
 *
 * @link   src/lib/ControlMiddle.js
 * @file   Control Middle Class.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */
import fs from 'fs';
import express from 'express';
import { PxpError } from './PxpError';

class ControlMiddle {
  method: string;
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
  params: Record<string, unknown>;

  constructor(method: string, req: express.Request, res: express.Response, next: express.NextFunction) {
    this.method = method;
    this.req = req;
    this.res = res;
    this.next = next;
    this.params = {};
  }

  async processRequest(): Promise<void> {
    if (this.method === 'OPTIONS') {
      // this.processRequestOptions();
    } else {
      const myPathArr = this.req.path.split('/');
      // merge all params
      this.params = { ...this.req.query, ...this.req.body };

      try {
        if (myPathArr.length < 5) {
          throw new PxpError(404, 'Wrong URL');
        }
        // check session or token
        // this.validateCredentials();
        const myPath = `${__dirname}/../modules/${myPathArr[2]}/controllers/${myPathArr[3]}`;

        // check if controller exists
        if (!fs.existsSync(`${myPath}.js`)) {
          throw new PxpError(404, 'Not found Controller');
        }
        // check if api token or session is sent
        // init controller
        // eslint-disable-next-line global-require
        const ControllerClass = await import(myPath);
        const c = new ControllerClass(this.method, this.res, this.next);
        // check if method exists
        if (typeof c[myPathArr[4]] !== 'function') {
          throw new PxpError(404, 'Not found Method');
        }
        await c.setParams(this.params);
        // call to corresponding method
        c[myPathArr[4]]();
      } catch (ex) {
        this.next(ex);
      }

      //
    }
  }
}
export default ControlMiddle;
