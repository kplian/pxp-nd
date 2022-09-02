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

import express from "express";

const genericMessage = "Web server error. Contact the administrator";
let showError = false;

class PxpError extends Error {
  statusCode: number;
  message: string;
  tecMessage: string;
  errorObject: any;
  constructor(
    statusCode: number,
    message: string,
    errorObject: any = undefined,
    stack?: undefined
  ) {
    super();
    this.statusCode = statusCode;
    this.message = statusCode === 500 ? genericMessage : message;
    this.errorObject = errorObject;

    if (errorObject && errorObject.response && errorObject.config) {
      this.tecMessage = `Error in Axios call to ${
        this.errorObject.config.url
      }, response: ${JSON.stringify(this.errorObject.response.data)}`;
    } else {
      this.tecMessage = message;
    }

    this.stack = stack || this.stack;
  }
}

// Pxp async promise error handler
const __ = (promise: Promise<any>, myShowError = false): Promise<any> =>
  promise
    .then((data) => data)
    .catch((error) => {
      showError = myShowError || showError;
      if (error instanceof PxpError) {
        throw error;
      } else {
        throw new PxpError(
          showError ? 406 : 500,
          error.message,
          error,
          error.stack
        );
      }
    });

// error handler middleware
const errorMiddleware = (err: PxpError, req: express.Request, res: any) => {
  const { statusCode, message, stack, tecMessage, errorObject } = err;

  const extraObj =
    process.env.NODE_ENV === "production"
      ? {}
      : { extendedMessage: tecMessage, stack, errorObject };

  // @todo if production not show tecMessage and stack
  return res.status(err.statusCode || 500).json({
    error: {
      ...{
        code: statusCode,
        message,
        logId: res.logId ? res.logId : undefined,
      },
      ...extraObj,
    },
  });
};

export { PxpError, errorMiddleware, __ };
