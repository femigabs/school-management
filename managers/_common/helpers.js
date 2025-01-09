const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
} = require("./error.handler");

module.exports = class HelperManager {

    static async generatePasswordHash(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async validatePayload(validator, payload) {
        const validationResult = await validator(payload);
        if (validationResult) {
            throw validationError(validationResult[0].message);
        }
    }

    static validateObjectId(id, fieldName = "ID") {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw validationError(`Invalid ${fieldName} passed`);
        }
    }

    static async fetchModelById(model, id, errorMessage) {
        const entity = await model.findById(id);
        if (!entity) {
            throw notFoundError(errorMessage);
        }
        return entity;
    }

}