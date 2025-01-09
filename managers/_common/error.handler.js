const _ = require("lodash");

const errorHandlers = {
  conflictError: (message) => {
    return { ok: false, code: 409, data: null, errors: [message], message };
  },
  validationError: (message) => {
    return { ok: false, code: 400, data: null, errors: [message], message };
  },

  notFoundError: (message) => {
    return { ok: false, code: 404, data: null, errors: [message], message };
  },

  nonAuthorizedError: (message) => {
    return { ok: false, code: 403, data: null, errors: [message], message };
  },

  tooManyRequestError: (message) => {
    return { ok: false, code: 429, data: null, errors: [message], message };
  },

  genericError: (message, code = 400) => {
    return { ok: false, code: code, data: null, errors: [message], message };
  },
};

// Export the object containing both functions
module.exports = errorHandlers;