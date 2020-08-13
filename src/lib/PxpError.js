const genericMessage = 'Web server error. Contact the administrator';
let showError = false;

/**
 * Error class and middlewares.
 *
 * Here is defined Pxp error class, middleware and promise handler __.
 *
 * @link   src/lib/PxpError.js
 * @file   pool object.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */

class PxpError extends Error {
  constructor(statusCode, message, stack = undefined) {
    super();
    this.statusCode = statusCode;
    this.message = statusCode === 500 ? genericMessage : message;
    this.tecMessage = message;
    this.stack = stack || this.stack;
  }
}

// Pxp async promise error handler
const __ = (promise, myShowError = false) => (
  promise
    .then(data => data)
    .catch(error => {
      showError = myShowError || showError;
      if (error instanceof PxpError) {
        throw error;
      } else {
        throw new PxpError(showError ? 406 : 500, error.message, error.stack);
      }
    })
);

// error handler middleware
const handleError = (err, res) => {
  if (err instanceof PxpError) {
    const { statusCode, message, stack, tecMessage } = err;
    const extraObj = process.env.NODE_ENV === 'production' ? {} : { extendedMessage: tecMessage, stack };
    // @todo if production not show tecMessage and stack
    res.status(statusCode).json(
      {
        error: {
          ...{
            code: statusCode,
            message
          }, ...extraObj
        }
      });
  } else {
    const { message, stack } = err;
    // @todo if production not show message and stack
    const extraObj = process.env.NODE_ENV === 'production' ? {} : { extendedMessage: message, stack };
    res.status(500).json(
      {
        error: {
          ...{
            code: 500,
            message: genericMessage
          }, ...extraObj
        }
      });

  }

};
module.exports = {
  PxpError,
  handleError,
  __
}
