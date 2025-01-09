const assert = require('assert');
const bcrypt = require('bcrypt');
const request = require('supertest');
const mongoose = require("mongoose");
const app = require('../app.js');
const UserModel = require('../managers/entities/user/user.mongoModel.js');
const UserManager = require('../managers/entities/user/User.manager.js');
const TokenManager = require('../managers/token/Token.manager.js');
const config = require('../config/index.config.js');
const ValidatorsLoader = require("../loaders/ValidatorsLoader.js");


describe('User Integration Tests', () => {
  const validatorsLoader = new ValidatorsLoader({
    models: require("../managers/_common/schema.models.js"),
    customValidators: require("../managers/_common/schema.validators.js"),
  });

  const userService = new UserManager({
    mongomodels: { user: UserModel },
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
    const superadmin = new UserModel({
      name: 'Superadmin',
      email: 'superadmin@example.com',
      role: 'superadmin',
      password: 'SuperSecurePassword123',
    });

    await superadmin.save();

  });

  after(async () => {
    // Clear the users collection after each test
    await UserModel.deleteMany({});
  });

  describe('Create', () => {
    it("should create a new user successfully", async () => {
      const payload = {
        __token: { role: "superadmin" },
        email: "newuser@example.com",
        name: "New User",
        role: "admin",
        schoolId: new mongoose.Types.ObjectId(),
      };

      const result = await userService.create(payload);

      assert.strictEqual(result.status, 201, "Status should be 201 Created");
      assert(result.user, "User should be returned");
      assert(result.longToken, "Token should be returned");

      const savedUser = await UserModel.findOne({ email: payload.email });
      assert(savedUser, "User should exist in the database");
      assert.strictEqual(savedUser.email, payload.email, "Emails should match");
      assert.strictEqual(savedUser.name, payload.name, "Names should match");
      assert.strictEqual(savedUser.role, payload.role, "Roles should match");
      assert.strictEqual(savedUser.temporaryPassword, true, "temporaryPassword should be true");

      const isPasswordHashed = await bcrypt.compare("anystring", savedUser.password);
      assert.strictEqual(isPasswordHashed, false, "Password should be hashed");
    });

    it("should not create a user with an existing email", async () => {
      const email = "duplicate@example.com";

      await UserModel.create({
        email,
        name: "Existing User",
        password: await bcrypt.hash("password123", 10),
        role: "admin",
        school: new mongoose.Types.ObjectId(),
      });

      const payload = {
        __token: { role: "superadmin" },
        email,
        name: "Duplicate User",
        role: "admin",
        schoolId: new mongoose.Types.ObjectId(),
      };

      const result = await userService.create(payload);

      assert.strictEqual(result.code, 409, "Status should be 409 Conflict");
      assert.strictEqual(result.message, "This user already exists", "Error message should match");
    });

    it("should not allow creating a user without proper authorization", async () => {
      const payload = {
        __token: { role: "admin" },
        email: "unauthorized@example.com",
        name: "Unauthorized User",
        role: "admin",
        schoolId: new mongoose.Types.ObjectId(),
      };

      const result = await userService.create(payload);

      assert.strictEqual(result.code, 403, "Status should be 403 Forbidden");
      assert.strictEqual(result.message, "Access denied", "Error message should match");
    });
  });

  describe('Login', () => {
    it("should log in a user with valid credentials", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        email: "login@example.com",
        name: "Login User",
        password: hashedPassword,
        role: "admin",
        school: new mongoose.Types.ObjectId(),
      });

      const loginPayload = {
        email: user.email,
        password,
      };

      const result = await userService.login(loginPayload);

      assert(result, "Result should be returned");
      assert(result.token, "Token should be returned");
      assert(result.result, "Result object should be returned");
      assert.strictEqual(result.result.email, user.email, "Emails should match");
    });

    it("should not log in a user with incorrect credentials", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);

      await UserModel.create({
        email: "wrongpassword@example.com",
        name: "Wrong Password User",
        password: hashedPassword,
        role: "admin",
        school: new mongoose.Types.ObjectId(),
      });

      const loginPayload = {
        email: "wrongpassword@example.com",
        password: "wrongpassword",
      };

      const result = await userService.login(loginPayload);

      assert.strictEqual(result.code, 403, "Status should be 401 Unauthorized");
      assert.strictEqual(result.message, "Invalid credentials", "Error message should match");
    });
  });

  describe('Change Password', () => {
    it("should allow changing the user password", async () => {
      const oldPassword = "oldPassword123";
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

      const user = await UserModel.create({
        email: "changepass@example.com",
        name: "Change Password User",
        password: hashedOldPassword,
        role: "admin",
        school: new mongoose.Types.ObjectId(),
      });

      const newPassword = "newPassword456";

      const changePasswordPayload = {
        __token: { userId: user._id, role: "admin" },
        oldPassword,
        newPassword,
      };

      const result = await userService.changePassword(changePasswordPayload);

      const updatedUser = await UserModel.findById(user._id);
      const isNewPasswordHashed = await bcrypt.compare(newPassword, updatedUser.password);

      assert.strictEqual(isNewPasswordHashed, true, "New password should be hashed and match");
      assert.strictEqual(updatedUser.temporaryPassword, false, "temporaryPassword should be false");
    });

    it("should not allow changing password with incorrect old password", async () => {
      const oldPassword = "oldPassword123";
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

      const user = await UserModel.create({
        email: "wrongchangepass@example.com",
        name: "Wrong Change Password User",
        password: hashedOldPassword,
        role: "admin",
        school: new mongoose.Types.ObjectId(),
      });

      const changePasswordPayload = {
        __token: { userId: user._id, role: "admin" },
        oldPassword: "wrongOldPassword",
        newPassword: "newPassword456",
      };

      const result = await userService.changePassword(changePasswordPayload);

      assert.strictEqual(result.code, 403, "Status should be 401 Unauthorized");
      assert.strictEqual(result.message, "Invalid old password", "Error message should match");
    });
  });
});
