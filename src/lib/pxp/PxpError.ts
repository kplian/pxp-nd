/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Error class and middlewares.
 *
 * @summary Here is defined Pxp error class, middleware and promise handler __.
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-20 18:20:43
 */

import express from 'express';

const genericMessage = 'Web server error. Contact the administrator';
let showError = false;

class PxpError extends Error {
  statusCode: number;
  message: string;
  tecMessage: string;
  errorObject: undefined;
  constructor(statusCode: number, message: string, errorObject?: undefined, stack?: undefined) {
    super();
    this.statusCode = statusCode;
    this.message = statusCode === 500 ? genericMessage : message;
    this.errorObject = errorObject;
    this.tecMessage = message;
    this.stack = stack || this.stack;
  }
}

// Pxp async promise error handler
const __ = (promise: Promise<any>, myShowError = false): Promise<any> => (
  promise
    .then((data) => data)
    .catch((error) => {
      showError = myShowError || showError;
      if (error instanceof PxpError) {
        throw error;
      } else {
        throw new PxpError(showError ? 406 : 500, error.message, undefined, error.stack);
      }
    })
);

// error handler middleware
const errorMiddleware = (err: PxpError, req: express.Request, res: express.Response): void => {
  const {
    statusCode, message, stack, tecMessage, errorObject
  } = err;
  console.log('name:', err.constructor.name);
  const extraObj = process.env.NODE_ENV === 'production' ? {} : { extendedMessage: tecMessage, stack };

  // @todo if production not show tecMessage and stack
  res.status(500).json(
    {
      error: {
        ...{
          code: statusCode,
          message,
          logId: res.logId ? res.logId : undefined,
          errorObject,
        },
        ...extraObj,
      },
    },
  );

};

export { PxpError, errorMiddleware, __ };
