const mongoose = require('mongoose');
const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
    genericError
} = require("../../_common/error.handler");
const ClassroomHelper = require('./classroom.helper');
const HelperManager = require('../../_common/helpers');

class Classroom {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "classroom";
        this.httpExposed = [
            "post=create",
            "get=get",
            "get=getById",
            "patch=update",
            "delete=delete"
        ];
    }

    async create({ __token, name, capacity, resources, schoolId: passedSchoolId }) {
        try {
            const { role, schoolId: adminSchoolId } = __token;
            const schoolId = adminSchoolId || passedSchoolId;
            ClassroomHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"]);
    
            HelperManager.validateObjectId(schoolId, "schoolId");
    
            const payload = { name, capacity, resources };
            await HelperManager.validatePayload(this.validators.classroom.create, payload);
    
            const existingClassroom = await this.mongomodels.classroom.findOne({ name });
            if (existingClassroom) {
                throw conflictError("Classroom already exists");
            }
    
            const newClassroom = new this.mongomodels.classroom({
                ...payload,
                schoolId,
            });
    
            const savedClassroom = await newClassroom.save();
            return { status: 201, data: savedClassroom, message: "classroom created successfully" };
        } catch (error) {
            console.error("Error creating classroom:", error);
            const message = error?.code ? error.message : "An error occurred while creating classrooms";
            return genericError(message, error?.code);
        }
    }

    async update({ __token, __params, name, capacity, resources, schoolId: passedSchoolId }) {
        try {
            const { role, schoolId: adminSchoolId } = __token;
            const { id } = __params;
            const schoolId = adminSchoolId || passedSchoolId;
    
            ClassroomHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"]);
            HelperManager.validateObjectId(id, "Classroom ID");
    
            const payload = { name, capacity, resources };
            await HelperManager.validatePayload(this.validators.classroom.update, payload);
    
            const classroom = await ClassroomHelper.fetchClassroomById(id, "Classroom not found", this.mongomodels.classroom);
    
            if (resources?.length) {
                resources.forEach(({ id: resourceId, ...updates }) => {
                    const resourceIndex = classroom.resources.findIndex((r) => r._id.equals(resourceId));
                    if (resourceIndex === -1) {
                        classroom.resources.push(updates);
                    } else {
                        Object.assign(classroom.resources[resourceIndex], updates);
                    }
                });
            }
    
            classroom.name = name || classroom.name;
            classroom.capacity = capacity || classroom.capacity;
            classroom.updatedAt = new Date();
    
            const updatedClassroom = await classroom.save();
            return { status: 200, data: updatedClassroom, message: "classroom updated successfully" };
        } catch (error) {
            console.error("Error updating classroom:", error);
            const message = error?.code ? error.message : "An error occurred while updating classrooms";
            return genericError(message, error?.code);
        }
    }

    async get({ __token, __query }) {
        try {
            const { role, schoolId: adminSchoolId } = __token;
        const { schoolId: passedSchoolId } = __query;
        const schoolId = passedSchoolId || adminSchoolId;

        ClassroomHelper.checkAuthorization({ role, schoolId }, ["superadmin", "admin"]);

        const classrooms = await this.mongomodels.classroom.find({
            schoolId,
            deletedAt: null,
        });

        return { status: 200, data: classrooms, message: "classrooms fetched successfully" };
        } catch (error) {
            console.error("Error fetching classrooms:", error);
            const message = error?.code ? error.message : "An error occurred while fetching classrooms";
            return genericError(message, error?.code);
        }   
    }


    async getById({ __token, __params }) {
        try {
            const { role, schoolId: adminSchoolId } = __token;
            const { id } = __params;
    
            HelperManager.validateObjectId(id, "Classroom ID");
            const classroom = await ClassroomHelper.fetchClassroomById(id, "Classroom not found");
    
            ClassroomHelper.checkAuthorization({ role, adminSchoolId }, ["superadmin", "admin"], classroom.schoolId);
    
            return { status: 200, data: classroom, message: "classroom fetched successfully" };    
        } catch (error) {
            console.error("Error fetching classroom:", error);
            const message = error?.code ? error.message : "An error occurred while fetching classroom";
            return genericError(message, error?.code);
        }
    }

    async delete({ __token, __params }) {
        try {
            const { role, schoolId: adminSchoolId } = __token;
            const { id } = __params;
    
            HelperManager.validateObjectId(id, "Classroom ID");
            const classroom = await ClassroomHelper.fetchClassroomById(id, "Classroom not found", this.mongomodels.classroom);
    
            ClassroomHelper.checkAuthorization({ role, adminSchoolId }, ["superadmin", "admin"], classroom.schoolId);
    
            classroom.deletedAt = new Date();
            await classroom.save();
    
            return { status: 200, data: null, message: "classroom deleted successfully" };      
        } catch (error) {
            console.error("Error deleting classroom:", error);
            const message = error?.code ? error.message : "An error occurred while deleting classroom";
            return genericError(message, error?.code);
        }
    }
}

module.exports = Classroom;