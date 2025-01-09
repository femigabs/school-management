
const {
    notFoundError,
    nonAuthorizedError,
} = require("../../_common/error.handler");

class StudentHelper {
    static async checkAuthorization({ role, schoolId }, requiredScopes, classroomId = null, model) {
        if (requiredScopes.length && !requiredScopes.includes(role)) {
            throw nonAuthorizedError("Access denied");
        }

        if (classroomId) {
            const classroom = await model.findById(classroomId);
            if (!classroom) {
                throw notFoundError("Classroom not found");
            }

            if (role !== "superadmin" && !classroom.schoolId.equals(schoolId)) {
                throw nonAuthorizedError("Access denied");
            }
        }
    }

  

}

module.exports = StudentHelper;
