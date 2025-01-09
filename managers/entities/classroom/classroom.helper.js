
const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
} = require("../../_common/error.handler");

class ClassroomHelper {
    static async checkAuthorization({ role, schoolId }, requiredScopes, entitySchoolId = null) {
        if (requiredScopes.length && !requiredScopes.includes(role)) {
            throw nonAuthorizedError("Access denied");
        }

        if (role !== "superadmin" && entitySchoolId && !entitySchoolId.equals(schoolId)) {
            throw nonAuthorizedError("Access denied");
        }
    }

    static async fetchClassroomById(id, errorMessage, model) {
        const classroom = await model.findOne({ _id: id, deletedAt: null });
        if (!classroom) {
            throw notFoundError(errorMessage);
        }
        return classroom;
    }
}

module.exports = ClassroomHelper;
