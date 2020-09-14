/**
 * Error class and middlewares.
 *
 * Here is defined Pxp error class, middleware and promise handler __.
 *
 * @link   src/lib/PxpError.js
 * @file   Error class and functions.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
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
    console.log('constructor', this);
  }
}

// Pxp async promise error handler
const __ = (promise: Promise<unknown>, myShowError = false): Promise<unknown> => (
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
  const extraObj = process.env.NODE_ENV === 'production' ? {} : { extendedMessage: tecMessage, stack };
  console.log('error middleware:', err);
  // @todo if production not show tecMessage and stack
  res.status(500).json(
    {
      error: {
        ...{
          code: statusCode,
          message,
          errorObject,
        },
        ...extraObj,
      },
    },
  );

};

export { PxpError, errorMiddleware, __ };
