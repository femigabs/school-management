
const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
} = require("../../_common/error.handler");

class SchoolHelper {
    static checkAuthorization(role, allowedRoles) {
        if (!allowedRoles.includes(role)) {
            throw nonAuthorizedError("Access denied");
        }
    }
}

module.exports = SchoolHelper;
