const genericMessage = 'Web server error. Contact the administrator';
const APP_ENV = 'development'; //development, production
let showError = false;

// Pxp Error class
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
    const extraObj = APP_ENV === 'production' ? {} : { tecMessage, stack };
    // @todo if production not show tecMessage and stack
    res.status(statusCode).json({
      ...{
        status: "error",
        statusCode,
        message
      }, ...extraObj
    });
  } else {
    const { message, stack } = err;
    // @todo if production not show message and stack
    const extraObj = APP_ENV === 'production' ? {} : { tecMessage: message, stack };
    res.status(500).json({
      ...{
        status: "error",
        statusCode: 500,
        message: genericMessage
      }, ...extraObj
    });

  }

};
module.exports = {
  PxpError,
  handleError,
  __
}
