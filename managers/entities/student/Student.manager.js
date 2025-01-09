const mongoose = require("mongoose");
const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
    genericError
} = require("../../_common/error.handler");
const UserHelper = require("../user/user.helper");
const StudentHelper = require("./student.helper");
const HelperManager = require("../../_common/helpers");

class Student {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.httpExposed = [
            "post=enroll",
            "get=getByClassroomId",
            "get=getById",
            "patch=update",
            "delete=delete",
        ];
    }

    async enroll({ __token, name, dateOfBirth, contactEmail, gender, contactPhone, classroomId }) {
        try {
            const { role, schoolId } = __token;

            HelperManager.validateObjectId(classroomId, "Classroom ID");
            await StudentHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"], classroomId, this.mongomodels.classroom);

            const payload = { name, dateOfBirth, contactEmail, gender, contactPhone };
            await HelperManager.validatePayload(this.validators.student.enroll, payload);

            payload.classroomId = classroomId;

            const newStudent = await this.mongomodels.student.create(payload);
            return { status: 201, data: newStudent, message: "Student enrolled successfully" };
        } catch (error) {
            console.error("Error creating student:", error);
            const message = error?.code ? error.message : "An error occurred while creating student";
            return genericError(message, error?.code);
        }
    }

    async update({ __token, __params, name, dateOfBirth, contactEmail, gender, contactPhone }) {
        try {
            const { role, schoolId } = __token;
            const { id } = __params;

            HelperManager.validateObjectId(id, "Student ID");
            await StudentHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"], null, this.mongomodels.classroom);

            const payload = { name, dateOfBirth, contactEmail, gender, contactPhone };
            await HelperManager.validatePayload(this.validators.student.update, payload);

            const student = await HelperManager.fetchModelById(this.mongomodels.student, id, "Student not found");
            await StudentHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"], student.classroomId, this.mongomodels.classroom);

            Object.assign(student, { ...payload, updatedAt: new Date() });
            const updatedStudent = await student.save();
            const data = updatedStudent.toObject();


            return { status: 200, data: data, message: "Student updated successfully" };
        } catch (error) {
            console.error("Error updating student:", error);
            const message = error?.code ? error.message : "An error occurred while updating student";
            return genericError(message, error?.code);
        }
    }

    async getByClassroomId({ __token, __params }) {
        try {
            const { role, schoolId } = __token;
            const { id } = __params;

            HelperManager.validateObjectId(id, "Classroom ID");
            await StudentHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"], id, this.mongomodels.classroom);

            const students = await this.mongomodels.student.find({ classroomId: id, deletedAt: null });
            return { status: 200, data: students, message: "Students fetched successfully" };
        } catch (error) {
            console.error("Error fetching students:", error);
            const message = error?.code ? error.message : "An error occurred while fetching students";
            return genericError(message, error?.code);
        }
    }

    async getById({ __token, __params }) {
        try {
            const { role, schoolId } = __token;
            const { id } = __params;

            HelperManager.validateObjectId(id, "Student ID");

            const student = await HelperManager.fetchModelById(this.mongomodels.student, id, "Student not found");
            await StudentHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"], student.classroomId, this.mongomodels.classroom);

            return { status: 200, data: student, message: "Student fetched successfully" };
        } catch (error) {
            console.error("Error fetching student:", error);
            const message = error?.code ? error.message : "An error occurred while fetching student";
            return genericError(message, error?.code);
        }
    }

    async delete({ __token, __params }) {
        try {
            const { role, schoolId } = __token;
            const { id } = __params;

            HelperManager.validateObjectId(id, "Student ID");

            const student = await HelperManager.fetchModelById(this.mongomodels.student, id, "Student not found");
            await StudentHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"], student.classroomId, this.mongomodels.classroom);

            student.deletedAt = new Date();
            await student.save();

            return { status: 200, data: null, message: "Student deleted successfully" };
        } catch (error) {
            console.error("Error deleting student:", error);
            const message = error?.code ? error.message : "An error occurred while deleting student";
            return genericError(message, error?.code);
        }
    }
}

module.exports = Student;
