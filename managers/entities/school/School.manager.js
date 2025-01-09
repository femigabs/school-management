const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
    genericError
} = require("../../_common/error.handler");
const SchoolHelper = require('./school.helper');
const HelperManager = require('../../_common/helpers');

class School {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "school";
        this.httpExposed = [
            "post=create",
            "get=get",
            "get=getById/{id}",
            "patch=update",
            "delete=delete",
            "patch=assignAdmin"
        ];
    }

    async create({ __token, email, name, phone, address }) {
        try {
            SchoolHelper.checkAuthorization(__token.role, ["superadmin"]);

            const payload = { email, name, phone, address };
            await HelperManager.validatePayload(this.validators.school.create, payload);

            const existingSchool = await this.mongomodels.school.findOne({ name });
            if (existingSchool) {
                return conflictError("School already exists");
            }

            const newSchool = new this.mongomodels.school(payload);
            const savedSchool = await newSchool.save();

            return { status: 201, school: savedSchool };
        } catch (error) {
            console.error("Error creating school:", error);
            const message = error?.code ? error.message : "An error occurred while creating school";
            return genericError(message, error?.code);
        }
    }

    async get({ __token }) {
        try {
            SchoolHelper.checkAuthorization(__token.role, ["superadmin"]);

            const schools = await this.mongomodels.school.find({ deletedAt: null });

            return { status: 200, school: schools };
        } catch (error) {
            console.error("Error fetching schools:", error);
            const message = error?.code ? error.message : "An error occurred while fetching schools";
            return genericError(message, error?.code);
        }
    }

    async getById({ __token, __params }) {
        try {
            const { role, schoolId } = __token;
            const { id } = __params;

            SchoolHelper.checkAuthorization(role, ["superadmin", "admin"]);
            HelperManager.validateObjectId(id);

            const school = await this.mongomodels.school.findOne({ _id: id, deletedAt: null });
            if (!school) {
                return notFoundError("School not found");
            }

            if (role !== "superadmin" && schoolId !== school.id) {
                return nonAuthorizedError("Access denied");
            }

            return { status: 200, school };
        } catch (error) {
            console.error("Error fetching school:", error);
            const message = error?.code ? error.message : "An error occurred while fetching school";
            return genericError(message, error?.code);
        }
    }

    async update({ __token, __params, email, name, phone, address }) {
        try {
            SchoolHelper.checkAuthorization(__token.role, ["superadmin"]);

            const { id } = __params;
            HelperManager.validateObjectId(id);

            const payload = { email, name, phone, address };
            await HelperManager.validatePayload(this.validators.school.update, payload);


            const updatedSchool = await this.mongomodels.school.findByIdAndUpdate(id, payload, { new: true });
            if (!updatedSchool) {
                return notFoundError("School not found");
            }

            return { status: 200, school: updatedSchool };
        } catch (error) {
            console.error("Error updating school:", error);
            const message = error?.code ? error.message : "An error occurred while updating school";
            return genericError(message, error?.code);
        }
    }

    async delete({ __token, __params }) {
        try {
            SchoolHelper.checkAuthorization(__token.role, ["superadmin"]);

            const { id } = __params;
            HelperManager.validateObjectId(id);

            const deletedSchool = await this.mongomodels.school.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
            if (!deletedSchool) {
                return notFoundError("School not found");
            }

            return { status: 200, school: null };
        } catch (error) {
            console.error("Error deleting school:", error);
            const message = error?.code ? error.message : "An error occurred while deleting school";
            return genericError(message, error?.code);
        }
    }

    async assignAdmin({ __token, userId, schoolId }) {
        try {
            SchoolHelper.checkAuthorization(__token.role, ["superadmin"]);

            HelperManager.validateObjectId(userId, "User ID");
            HelperManager.validateObjectId(schoolId, "School ID");

            const user = await HelperManager.fetchModelById(this.mongomodels.user, userId, "Student not found");
            await HelperManager.fetchModelById(this.mongomodels.school, schoolId, "School not found");


            if (user.role !== "admin") {
                return validationError("Only an admin can be assigned to a school");
            }

            user.school = schoolId;
            await user.save();

            return { status: 200, school: null };
        } catch (error) {
            console.error("Error assigning admin:", error);
            const message = error?.code ? error.message : "An error occurred while assigning admin";
            return genericError(message, error?.code);
        }
    }
}

module.exports = School;