const assert = require('assert');
const Student = require('../managers/entities/student/Student.manager.js');
const UserModel = require('../managers/entities/user/user.mongoModel.js');
const SchoolModel = require('../managers/entities/school/school.mongoModel.js');
const ClassroomModel = require('../managers/entities/classroom/classroom.mongoModel.js');
const StudentModel = require('../managers/entities/student/student.mongoModel.js');

const ValidatorsLoader = require("../loaders/ValidatorsLoader.js");

describe('Student Manager Integration Tests', () => {
    const validatorsLoader = new ValidatorsLoader({
        models: require("../managers/_common/schema.models.js"),
        customValidators: require("../managers/_common/schema.validators.js"),
    });

    const studentService = new Student({
        mongomodels: {
            user: UserModel,
            school: SchoolModel,
            classroom: ClassroomModel,
            student: require('../managers/entities/student/student.mongoModel.js')
        },
        validators: validatorsLoader.load(),
        managers: { token: null },
        utils: {},
        cache: null,
        config: null,
        cortex: null
    });

    let adminUser, school, classroom, student;

    before(async () => {
        school = new SchoolModel({
            name: 'Test School',
            email: 'school@example.com',
            phone: '1234567890',
            address: '123 School St'
        });
        await school.save();

        adminUser = new UserModel({
            email: 'admin3@example.com',
            name: 'Admin User',
            role: 'admin',
            password: 'TestPassword123',
            schoolId: school._id
        });
        await adminUser.save();

        classroom = new ClassroomModel({
            name: 'Math 101',
            capacity: 30,
            resources: [],
            schoolId: school._id
        });
        await classroom.save();

        student = new StudentModel({
            name: 'Jane Doe',
                dateOfBirth: '2000-01-01',
                contactEmail: 'jane.doe@example.com',
                gender: 'female',
                contactPhone: '9876543210',
                classroomId: classroom._id
        });
        await student.save();

    });

    after(async () => {
        // Clean up the database
        await UserModel.deleteMany({});
        await SchoolModel.deleteMany({});
        await ClassroomModel.deleteMany({});
        await StudentModel.deleteMany({});

    });

    describe('enroll Student', () => {
        it('should enroll a new student successfully', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const studentData = {
                name: 'John Doe',
                dateOfBirth: '2000-01-01',
                contactEmail: 'john.doe@example.com',
                gender: 'male',
                contactPhone: '9876543210',
                classroomId: classroom._id
            };

            const result = await studentService.enroll({
                __token: superAdminToken,
                ...studentData
            });

            assert.strictEqual(result.status, 201, "Status should be 201 Created");
            assert.strictEqual(result.student.name, 'John Doe', "Student name should be set correctly");
            assert.strictEqual(result.student.contactEmail, 'john.doe@example.com', "Student email should be set correctly");
            assert.strictEqual(result.student.classroomId.toString(), classroom._id.toString(), "Student should be assigned to correct classroom");
        });

        it('should return an error if classroomId is invalid', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const invalidClassroomId = 'invalidClassroomId';
            const studentData = {
                name: 'Jane Doe',
                dateOfBirth: '2000-01-01',
                contactEmail: 'jane.doe@example.com',
                gender: 'female',
                contactPhone: '9876543210',
                classroomId: invalidClassroomId
            };

            const result = await studentService.enroll({
                __token: superAdminToken,
                ...studentData
            });

            assert.strictEqual(result.code, 400, "Status should be 404 Not Found");
            assert.strictEqual(result.message, "Invalid Classroom ID passed", "Error message should match");
        });

        it('should return an error if classroom does not exist', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const invalidClassroomId = '677feb02bebb454a8faf8da3';
            const studentData = {
                name: 'Jane Doe',
                dateOfBirth: '2000-01-01',
                contactEmail: 'jane.doe@example.com',
                gender: 'female',
                contactPhone: '9876543210',
                classroomId: invalidClassroomId
            };

            const result = await studentService.enroll({
                __token: superAdminToken,
                ...studentData
            });

            assert.strictEqual(result.code, 404, "Status should be 404 Not Found");
            assert.strictEqual(result.message, "Classroom not found", "Error message should match");
        });

        it('should return an error if user role is invalid', async () => {
            const invalidToken = { role: 'guest', schoolId: school._id };
            const studentData = {
                name: 'Alice Johnson',
                dateOfBirth: '1999-06-15',
                contactEmail: 'alice.johnson@example.com',
                gender: 'female',
                contactPhone: '9998887776',
                classroomId: classroom._id
            };

            const result = await studentService.enroll({
                __token: invalidToken,
                ...studentData
            });

            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should match");
        });
    });

    describe('update Student', () => {
        it('should update student information successfully', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const updatedStudentData = {
                name: 'John Doe Updated',
                dateOfBirth: '2000-01-01',
                contactEmail: 'john.doe.updated@example.com',
                gender: 'male',
                contactPhone: '9876543210',
                classroomId: classroom._id
            };

            const result = await studentService.update({
                __token: superAdminToken,
                __params: { id: student._id },
                ...updatedStudentData
            });

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.student.name, 'John Doe Updated', "Student name should be updated");
            assert.strictEqual(result.student.contactEmail, 'john.doe.updated@example.com', "Student email should be updated");
        });

        it('should return an error if invalid id is passed', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const result = await studentService.update({
                __token: superAdminToken,
                __params: { id: 'invalidStudentId' },
                name: 'John Doe Updated',
                dateOfBirth: '2000-01-01',
                contactEmail: 'john.doe.updated@example.com',
                gender: 'male',
                contactPhone: '9876543210',
                classroomId: classroom._id
            });

            assert.strictEqual(result.code, 400, "Status should be 400 Bad Request");
            assert.strictEqual(result.message, "Invalid Student ID passed", "Error message should match");
        });
    });

    describe('get Student by ID', () => {
        it('should return student by ID', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const result = await studentService.getById({
                __token: superAdminToken,
                __params: { id: student._id }
            });

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            assert.strictEqual(result.student.name, 'John Doe Updated', "Student name should be 'John Doe Updated'");
        });

        it('should return access denied for non-superadmin users', async () => {
            const userToken = { role: 'user', schoolId: school._id };
            const result = await studentService.getById({
                __token: userToken,
                __params: { id: student._id }
            });

            assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
            assert.strictEqual(result.message, "Access denied", "Error message should match");
        });
    });

    describe('delete Student', () => {
        it('should delete student successfully', async () => {
            const superAdminToken = { role: 'superadmin', schoolId: school._id };
            const result = await studentService.delete({
                __token: superAdminToken,
                __params: { id: student._id }
            });

            assert.strictEqual(result.status, 200, "Status should be 200 OK");
            const deletedStudent = await studentService.mongomodels.student.findById(student._id);
            assert.strictEqual(deletedStudent.deletedAt !== null, true, "Student should be marked as deleted");
        });
    });
});
