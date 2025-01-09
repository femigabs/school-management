const bcrypt = require("bcrypt");
const {
    validationError,
    conflictError,
    notFoundError,
    nonAuthorizedError,
    genericError
} = require("../../_common/error.handler");
const HelperManager = require("../../_common/helpers");
const UserHelper = require("./user.helper");

class User {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "users";
        this.httpExposed = [
            "post=create",
            "post=login",
            "patch=changePassword"
        ];
    }

    async create({ __token, email, name, role, schoolId }) {
        try {
            UserHelper.checkAuthorization(__token.role, ["superadmin"]);

            const userData = { email, name, role };
            await HelperManager.validatePayload(this.validators.user.create, userData);

            const existingUser = await UserHelper.findUserByEmail(email, this.mongomodels.user);
            if (existingUser) {
                return conflictError("This user already exists");
            }

            const temporaryPassword = Math.random().toString(36).slice(-8);
            const passwordHash = await HelperManager.generatePasswordHash(temporaryPassword);

            const newUser = new this.mongomodels.user({
                ...userData,
                school: schoolId,
                password: passwordHash,
                temporaryPassword: true,
            });

            const savedUser = await newUser.save();
            const longToken = this.tokenManager.genLongToken({
                userId: savedUser._id,
                role,
                schoolId,
            });

            // Todo: send through email
            savedUser.password = temporaryPassword;

            return { status: 201, user: savedUser, longToken };
        } catch (error) {
            console.error("Error creating user:", error);
            const message = error?.code ? error.message : "An error occurred while creating user";
            return genericError(message, error?.code);
        }
    }

    async login({ email, password }) {
        try {
            if (!email || !password) {
                return validationError("Both email and password are required");
            }

            const loginData = { email, password };
            await HelperManager.validatePayload(this.validators.user.login, loginData);

            const user = await UserHelper.findUserByEmail(email, this.mongomodels.user);
            if (!user) {
                return nonAuthorizedError("Invalid credentials");
            }

            const isMatchHash = await bcrypt.compare(password, user.password);
            if (!isMatchHash) {
                return nonAuthorizedError("Invalid credentials");
            }

            const token = this.tokenManager.genLongToken({
                userId: user._id,
                role: user.role,
                schoolId: user.school,
            });

            const { password: hashedPassword, ...result } = user;
            return { result, token };
        } catch (error) {
            console.error("Login Error:", error);
            const message = error?.code ? error.message : "An error occurred while logging in";
            return genericError(message, error?.code);
        }
    }

    async changePassword({ __token, oldPassword, newPassword }) {
        try {
            const { userId } = __token;

            const changePasswordData = { oldPassword, newPassword };
            await HelperManager.validatePayload(this.validators.user.changePassword, changePasswordData);

            const user = await this.mongomodels.user.findById(userId);
            if (!user) {
                return notFoundError("User not found");
            }

            const isMatchHash = await bcrypt.compare(oldPassword, user.password);
            if (!isMatchHash) {
                return nonAuthorizedError("Invalid old password");
            }

            if (oldPassword === newPassword) {
                return validationError("You cannot use your old password");
            }

            user.password = await HelperManager.generatePasswordHash(newPassword);
            user.temporaryPassword = false;
            await user.save();

            return { status: 200, message: "Password changed successfully" };
        } catch (error) {
            console.error("Change password Error:", error);
            const message = error?.code ? error.message : "An error occurred while changing the password";
            return genericError(message, error?.code);
        }
    }

}

module.exports = User;