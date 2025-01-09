const mongoose = require("mongoose");
const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
} = require("../../_common/error.handler");

class UserHelper {
    static checkAuthorization(currentRole, allowedScopes) {
        if (allowedScopes?.length && !allowedScopes.includes(currentRole)) {
            throw nonAuthorizedError("Access denied");
        }
    }

    static async findUserByEmail(email, model) {
        return model.findOne({ email }).lean();
    }
}

module.exports = UserHelper;
