const assert = require('assert');
const Classroom = require('../managers/entities/classroom/Classroom.manager.js');
const UserModel = require('../managers/entities/user/user.mongoModel.js');
const SchoolModel = require('../managers/entities/school/school.mongoModel.js');
const ClassroomModel = require('../managers/entities/classroom/classroom.mongoModel.js');
const ValidatorsLoader = require("../loaders/ValidatorsLoader.js");

describe('Classroom Manager Integration Tests', () => {
    const validatorsLoader = new ValidatorsLoader({
        models: require("../managers/_common/schema.models.js"),
        customValidators: require("../managers/_common/schema.validators.js"),
    });

    const classroomService = new Classroom({
        mongomodels: {
            user: UserModel,
            school: SchoolModel,
            classroom: ClassroomModel
        },
        validators: validatorsLoader.load(),
        managers: { token: null },
        utils: {},
        cache: null,
        config: null,
        cortex: null
    });

    let user, school, classroom;

    before(async () => {
        school = new SchoolModel({
            name: 'Test School',
            email: 'school@example.com',
            phone: '1234567890',
            address: '123 School St'
        });
        await school.save();

        user = new UserModel({
            email: 'admin1@example.com',
            name: 'Admin User',
            role: 'admin',
            password: 'TestPassword123',
            schoolId: school._id
        });
        await user.save();

        classroom = new ClassroomModel({
            name: 'Math 101',
            capacity: 30,
            resources: [],
            schoolId: school._id
        });
        await classroom.save();
    });

    after(async () => {
        await UserModel.deleteMany({});
        await SchoolModel.deleteMany({});
        await ClassroomModel.deleteMany({});
    });

    describe('create Classroom', () => {
        it('should create a new classroom successfully', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const newResources = [
                { type: 'book', name: 'Mathematics Textbook', quantity: 25 },
                { type: 'laptop', name: 'Dell Inspiron', quantity: 10 }
            ];
    
            const result = await classroomService.create({
                __token: superAdminToken,
                name: 'Math 105',
                capacity: 30,
                resources: newResources,
                schoolId: school._id
            });
    
            assert.strictEqual(result.status, 201, "Status should be 201 Created");
            assert.strictEqual(result.classroom.name, 'Math 105', "Classroom name should be set correctly");
            assert.strictEqual(result.classroom.capacity, 30, "Classroom capacity should be set correctly");
    
            assert.strictEqual(result.classroom.resources.length, 2, "There should be 2 resources");
        });
    
        it('should return an error if classroom already exists', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const newResources = [
                { type: 'book', name: 'Mathematics Textbook', quantity: 25 },
                { type: 'laptop', name: 'Dell Inspiron', quantity: 10 }
            ];
    
            // First create the classroom
            await classroomService.create({
                __token: superAdminToken,
                name: 'Math 101',
                capacity: 30,
                resources: newResources,
                schoolId: school._id
            });
    
            // Try to create the same classroom again
            const result = await classroomService.create({
                __token: superAdminToken,
                name: 'Math 101',
                capacity: 30,
                resources: newResources,
                schoolId: school._id
            });
    
            assert.strictEqual(result.code, 409, "Status should be 409 Conflict");
            assert.strictEqual(result.message, "Classroom already exists", "Error message should match");
        });
    
        it('should return an error if resource name is missing', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const invalidResource = { type: 'laptop', quantity: 10 };  // Missing name field
    
            const result = await classroomService.create({
                __token: superAdminToken,
                name: 'Math 101 with Invalid Resource',
                capacity: 30,
                resources: [invalidResource],
                schoolId: school._id
            });
    
            assert.strictEqual(result.code, 400, "Status should be 400 Bad Request");
            assert.strictEqual(result.message, "one of the resources items is invalid", "Error message should match");
        });
    
        it('should return an error if an invalid token is provided', async () => {
            const invalidToken = { role: 'guest', schoolId: school._id };
            const newResources = [
                { type: 'book', name: 'Mathematics Textbook', quantity: 25 },
                { type: 'laptop', name: 'Dell Inspiron', quantity: 10 }
            ];
    
            const result = await classroomService.create({
                __token: invalidToken,
                name: 'Math 101',
                capacity: 30,
                resources: newResources,
                schoolId: school._id
            });
    
            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should be access denied due to invalid role");
        });
    });
    

    describe('update Classroom', () => {
        it('should update classroom successfully', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const updatedResources = [
                { type: 'book', name: 'Mathematics Textbook', quantity: 30 },
                { type: 'laptop', name: 'Dell Inspiron', quantity: 12 }
            ];
            const result = await classroomService.update({
                __token: superAdminToken,
                __params: { id: classroom._id },
                name: 'Math 101 - Updated',
                capacity: 35,
                resources: updatedResources,
                schoolId: school._id
            });
    
            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.classroom.name, 'Math 101 - Updated', "Classroom name should be updated");
            assert.strictEqual(result.classroom.capacity, 35, "Classroom capacity should be updated");
    
            assert.strictEqual(result.classroom.resources.length, 2, "There should be 2 resources");
        });
    
        it('should create a new resource if it does not exist', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const newResource = { type: 'projector', name: 'Epson Projector', quantity: 5 };
    
            const result = await classroomService.update({
                __token: superAdminToken,
                __params: { id: classroom._id },
                name: 'Math 101 - Updated with Projector',
                capacity: 35,
                resources: [...classroom.resources, newResource],
                schoolId: school._id
            });
    
            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.classroom.name, 'Math 101 - Updated with Projector', "Classroom name should be updated");
            assert.strictEqual(result.classroom.capacity, 35, "Classroom capacity should be updated");
    
            assert.strictEqual(result.classroom.resources.length, 3, "There should be 3 resources now");
        });
    
        it('should update existing resource if it already exists', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const updatedResource = { type: 'book', name: 'Mathematics Textbook', quantity: 50 };
    
            const result = await classroomService.update({
                __token: superAdminToken,
                __params: { id: classroom._id },
                name: 'Math 101 - Updated Quantity',
                capacity: 40,
                resources: [{ type: 'book', name: 'Mathematics Textbook', quantity: 50 }],
                schoolId: school._id
            });
    
            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.classroom.name, 'Math 101 - Updated Quantity', "Classroom name should be updated");
            assert.strictEqual(result.classroom.capacity, 40, "Classroom capacity should be updated");
    
            // Verify that the existing resource has been updated
            const resource = result.classroom.resources.find(r => r.type === 'book' && r.name === 'Mathematics Textbook');
            assert.strictEqual(resource.quantity, 50, "The quantity of the book resource should be updated");
        });
    
        it('should return an error if resource name is missing', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const invalidResource = { type: 'laptop', quantity: 15 };
    
            const result = await classroomService.update({
                __token: superAdminToken,
                __params: { id: classroom._id },
                name: 'Math 101 - Invalid Resource',
                capacity: 35,
                resources: [invalidResource],
                schoolId: school._id
            });
    
            assert.strictEqual(result.code, 400, "Status should be 400 Bad Request");
            assert.strictEqual(result.message, "one of the resources items is invalid", "Error message should match");
        });
    });
    

    describe('get All Classrooms', () => {
        it('should return a list of classrooms', async () => {
            const adminToken = { role: 'admin', schoolId: school._id };
            const result = await classroomService.get({
                __token: adminToken
            });

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
        });
    });

    describe('get Classroom by ID', () => {
        it('should return classroom by ID', async () => {
            const adminToken = { role: 'admin', schoolId: classroom.schoolId };
            const result = await classroomService.getById({
                __token: adminToken,
                __params: { id: classroom._id }
            });

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.classroom.name, 'Math 101 - Updated Quantity', "Classroom name should be 'Math 101 - Updated Quantity'");
        });

        it('should return access denied for non-admin users', async () => {
            const userToken = { role: 'user', schoolId: school._id };
            const result = await classroomService.getById({
                __token: userToken,
                __params: { id: classroom._id }
            });

            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should match");
        });

        it('should return access denied for admin not assigned to school', async () => {
            const userToken = { role: 'user', schoolId: school._id };
            const result = await classroomService.getById({
                __token: userToken,
                __params: { id: classroom._id }
            });

            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should match");
        });
    });

    describe('delete Classroom', () => {
        it('should delete classroom successfully', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const result = await classroomService.delete({
                __token: superAdminToken,
                __params: { id: classroom._id }
            });

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            const deletedClassroom = await ClassroomModel.findById(classroom._id);
            assert.strictEqual(deletedClassroom.deletedAt !== null, true, "Classroom should be marked as deleted");
        });
    });
});
