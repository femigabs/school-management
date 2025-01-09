const assert = require('assert');
const mongoose = require('mongoose');
const SchoolModel = require('../managers/entities/school/school.mongoModel.js');
const UserModel = require('../managers/entities/user/user.mongoModel.js');
const SchoolManager = require('../managers/entities/school/School.manager.js');
const TokenManager = require('../managers/token/Token.manager.js');
const config = require('../config/index.config.js');
const ValidatorsLoader = require("../loaders/ValidatorsLoader.js");

describe('School Integration Tests', () => {
    let user, school;
    const validatorsLoader = new ValidatorsLoader({
        models: require("../managers/_common/schema.models.js"),
        customValidators: require("../managers/_common/schema.validators.js"),
    });

    const schoolService = new SchoolManager({
        mongomodels: { school: SchoolModel, user: UserModel },
        validators: validatorsLoader.load(),
        managers: {
            token: new TokenManager({ config }),
        },
        utils: {},
        cache: null,
        config: null,
        cortex: null,
    });

    before(async () => {
        school = new SchoolModel({
            name: 'Super School',
            email: 'school@example.com',
            phone: '1234567890',
            address: '123 Super St',
        });

        await school.save();

        user = new UserModel({
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            password: 'TestPassword123',
        });

        await user.save();
    });

    after(async () => {
        await UserModel.deleteMany({});
        await SchoolModel.deleteMany({});
    });

    describe('Create', () => {
        it("should create a new school successfully", async () => {
            const payload = {
                __token: { role: "superadmin" },
                email: "newschool@example.com",
                name: "New School",
                phone: "9876543210",
                address: "456 New St",
            };

            const result = await schoolService.create(payload);

            assert.strictEqual(result.status, 201, "Status should be 201 Created");
            assert(result.school, "School should be returned");

            const savedSchool = await SchoolModel.findOne({ email: payload.email });
            assert(savedSchool, "School should exist in the database");
            assert.strictEqual(savedSchool.email, payload.email, "Emails should match");
            assert.strictEqual(savedSchool.name, payload.name, "Names should match");
            assert.strictEqual(savedSchool.phone, payload.phone, "Phones should match");
            assert.strictEqual(savedSchool.address, payload.address, "Addresses should match");
        });

        it("should not create a school with an existing name", async () => {
            const name = "Duplicate School";

            await SchoolModel.create({
                name,
                email: "duplicate@example.com",
                phone: "1234567890",
                address: "123 Duplicate St",
            });

            const payload = {
                __token: { role: "superadmin" },
                email: "newschool@example.com",
                name,
                phone: "9876543210",
                address: "456 New St",
            };

            const result = await schoolService.create(payload);

            assert.strictEqual(result.code, 409, "Status should be 409 Conflict");
            assert.strictEqual(result.message, "School already exists", "Error message should match");
        });

        it("should not allow creating a school without proper authorization", async () => {
            const payload = {
                __token: { role: "admin" },
                email: "unauthorizedschool@example.com",
                name: "Unauthorized School",
                phone: "1234567890",
                address: "123 Unauthorized St",
            };

            const result = await schoolService.create(payload);

            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should match");
        });
    });

    describe('Get', () => {
        it("should fetch all schools successfully", async () => {
            const payload = {
                __token: { role: "superadmin" },
            };

            const result = await schoolService.get(payload);

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert(Array.isArray(result.school), "Schools should be returned as an array");
            assert(result.school.length > 0, "Schools should not be empty");
        });

        it("should not fetch schools with insufficient permissions", async () => {
            const payload = {
                __token: { role: "admin" },
            };

            const result = await schoolService.get(payload);

            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should match");
        });
    });

    describe('Get By ID', () => {
        it("should fetch a school by ID successfully", async () => {
            const school = await SchoolModel.create({
                email: "schoolbyid@example.com",
                name: "School By ID",
                phone: "1234567890",
                address: "789 ID St",
            });

            const payload = {
                __token: { role: "superadmin" },
                __params: { id: school._id },
            };

            const result = await schoolService.getById(payload);

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert(result.school, "School should be returned");
            assert.strictEqual(result.school.name, school.name, "School name should match");
        });

        it("should return an error if school is not found by ID", async () => {
            const payload = {
                __token: { role: "superadmin" },
                __params: { id: new mongoose.Types.ObjectId() },
            };

            const result = await schoolService.getById(payload);

            assert.strictEqual(result.code, 404, "Status should be 404 Not Found");
            assert.strictEqual(result.message, "School not found", "Error message should match");
        });
    });

    describe('Update', () => {
        it("should update a school's details", async () => {
            const school = await SchoolModel.create({
                email: "update@example.com",
                name: "Update School",
                phone: "1234567890",
                address: "123 Update St",
            });

            const updatedData = {
                email: "updatedschool@example.com",
                name: "Updated School",
                phone: "9876543210",
                address: "456 Updated St",
            };

            const payload = {
                __token: { role: "superadmin" },
                __params: { id: school._id },
                ...updatedData,
            };

            const result = await schoolService.update(payload);

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.school.name, updatedData.name, "School name should match");
            assert.strictEqual(result.school.email, updatedData.email, "School email should match");
            assert.strictEqual(result.school.phone, updatedData.phone, "School phone should match");
            assert.strictEqual(result.school.address, updatedData.address, "School address should match");
        });

        it("should return an error if the school ID is invalid", async () => {
            const payload = {
                __token: { role: "superadmin" },
                __params: { id: "invalid-id" },
                email: "invalidschool@example.com",
                name: "Invalid School",
                phone: "1234567890",
                address: "123 Invalid St",
            };

            const result = await schoolService.update(payload);

            assert.strictEqual(result.code, 400, "Status should be 400 Bad Request");
            assert.strictEqual(result.message, "Invalid ID passed", "Error message should match");
        });
    });

    describe('Delete', () => {
        it("should delete a school by ID", async () => {
            const school = await SchoolModel.create({
                email: "delete@example.com",
                name: "Delete School",
                phone: "1234567890",
                address: "123 Delete St",
            });

            const payload = {
                __token: { role: "superadmin" },
                __params: { id: school._id },
            };

            const result = await schoolService.delete(payload);

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.school, null, "School should be deleted");
        });
    });

    describe('assignAdmin', () => {
        it('should assign an admin to a school successfully', async () => {
            const superAdminToken = { role: 'superadmin' };

            const result = await schoolService.assignAdmin({
                __token: superAdminToken,
                userId: user._id,
                schoolId: school._id,
            });

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            const updatedUser = await UserModel.findById(user._id);
            assert.strictEqual(updatedUser.school.toString(), school._id.toString(), "User should be assigned to the school");
        });

        it('should return access denied for non-superadmin role', async () => {
            const adminToken = { role: 'admin' };
            const user = await UserModel.findOne({ email: 'admin@example.com' });
            const school = await SchoolModel.findOne({ email: 'school@example.com' });

            const result = await schoolService.assignAdmin({
                __token: adminToken,
                userId: user._id,
                schoolId: school._id,
            });

            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should match");
        });

        it('should return invalid userId passed when the userId is not a valid ObjectId', async () => {
            const superAdminToken = { role: 'superadmin' };
            const invalidUserId = 'invalidUserId';
            const school = await SchoolModel.findOne({ email: 'school@example.com' });

            const result = await schoolService.assignAdmin({
                __token: superAdminToken,
                userId: invalidUserId,
                schoolId: school._id,
            });

            assert.strictEqual(result.code, 400, "Status should be 400 Bad Request");
            assert.strictEqual(result.message, "Invalid User ID passed", "Error message should match");
        });

        it('should return invalid schoolId passed when the schoolId is not a valid ObjectId', async () => {
            const superAdminToken = { role: 'superadmin' };
            const user = await UserModel.findOne({ email: 'admin@example.com' });
            const invalidSchoolId = 'invalidSchoolId';

            const result = await schoolService.assignAdmin({
                __token: superAdminToken,
                userId: user._id,
                schoolId: invalidSchoolId,
            });

            assert.strictEqual(result.code, 400, "Status should be 400 Bad Request");
            assert.strictEqual(result.message, "Invalid School ID passed", "Error message should match");
        });

        it('should return user not found if the user does not exist', async () => {
            const superAdminToken = { role: 'superadmin' };
            const nonExistentUserId = new mongoose.Types.ObjectId();
            const school = await SchoolModel.findOne({ email: 'school@example.com' });

            const result = await schoolService.assignAdmin({
                __token: superAdminToken,
                userId: nonExistentUserId,
                schoolId: school._id,
            });

            assert.strictEqual(result.code, 404, "Status should be 404 Not Found");
            assert.strictEqual(result.message, "Student not found", "Error message should match");
        });

        it('should return school not found if the school does not exist', async () => {
            const superAdminToken = { role: 'superadmin' };
            const user = await UserModel.findOne({ email: 'admin@example.com' });
            const nonExistentSchoolId = new mongoose.Types.ObjectId();

            const result = await schoolService.assignAdmin({
                __token: superAdminToken,
                userId: user._id,
                schoolId: nonExistentSchoolId,
            });


            assert.strictEqual(result.code, 404, "Status should be 404 Not Found");
            assert.strictEqual(result.message, "School not found", "Error message should match");
        });

        it('should return validation error if user is not an admin', async () => {
            const superAdminToken = { role: 'superadmin' };
            const user = new UserModel({
                email: 'nonadmin@example.com',
                name: 'Non Admin User',
                role: 'superadmin',
                password: 'TestPassword123',
            });

            await user.save();

            const result = await schoolService.assignAdmin({
                __token: superAdminToken,
                userId: user._id,
                schoolId: school._id,
            });

            assert.strictEqual(result.code, 400, "Status should be 400 Bad Request");
            assert.strictEqual(result.message, "Only an admin can be assigned to a school", "Error message should match");
        });
    });

});
