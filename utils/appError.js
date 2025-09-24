class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Error class -> this.message = message (in the parameter)

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); // to put the error in the stack trace
  }
}

module.exports = AppError;
