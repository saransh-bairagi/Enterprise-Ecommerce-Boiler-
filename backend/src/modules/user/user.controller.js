const { UserService, UserAdminService } = require("./user.service");
const AppError = require("../../core/appError");
const ERROR = require("../../core/constants").ERRORS;
const MESSAGE = require("../../core/constants").MESSAGES;
const { sendSuccess, sendError } = require("../../core/response");

/* ----------------------------------------------------------

* USER-FACING CONTROLLERS
* ----------------------------------------------------------*/
const UserController = {
    createUser: async (req, res) => {
        try {
            const payload = req.body;
            const created = await UserService.createUser(payload);
            sendSuccess(res, created, MESSAGE.ACCOUNT_CREATED, 201);
        } catch (err) {
            sendError(
                res,
                err.message || ERROR.ACCOUNT_CREATION_FAILED,
                err.statusCode || 500
            );
        }
    },

    login: async (req, res) => {
        // Must return password + user
        const { user, accessToken, refreshToken } = await UserService.login(
            req.body?.email,
            req.body?.password
        );
        res.setHeader("Authorization", `Bearer ${accessToken}`);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        sendSuccess(res,user, MESSAGE.LOGIN_SUCCESS);
    },

    logout: async (req, res) => {
        try {
            const userId = req.attachedSECRET?.userId;
            if (!userId) throw new AppError(ERROR.UNAUTHORIZED, 401);
            req.headers.authorization = null;
            res.clearCookie("refreshToken");
            sendSuccess(res, null, MESSAGE.LOGOUT_SUCCESS);
        } catch (err) {
            sendError(
                res,
                err.message || ERROR.LOGOUT_FAILED,
                err.statusCode || 500
            );
        }
    },
    delete: async (req, res) => {
        try {
            const userId = req.attachedSECRET?.userId;
            if (!userId) throw new AppError(ERROR.UNAUTHORIZED, 401);
            await UserService.deleteUser(userId);
            sendSuccess(res, null, MESSAGE.ACCOUNT_DELETED, 204);
        } catch (err) {
            sendError(
                res,
                err.message || ERROR.ACCOUNT_DELETION_FAILED,
                err.statusCode || 500
            );
        }
    },
    getProfile: async (req, res) => {
        try {
            const userId = req.attachedSECRET?.userId;
            if (!userId) throw new AppError(ERROR.UNAUTHORIZED, 401);

            const user = await UserService.getUser(userId);
            sendSuccess(res, user, MESSAGE.PROFILE_FETCHED);
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to fetch profile",
                err.statusCode || 500
            );
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.attachedSECRET?.userId;
            if (!userId) throw new AppError(ERROR.UNAUTHORIZED, 401);

            const updated = await UserService.updateProfile(userId, req.body);
            sendSuccess(res, updated, MESSAGE.PROFILE_UPDATED);
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to update profile",
                err.statusCode || 500
            );
        }
    },
};

/* ----------------------------------------------------------

* ADMIN CONTROLLERS
* ----------------------------------------------------------*/

const AdminController = {
    listUsers: async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const data = await UserService.listUsers({
                page: Number(page),
                limit: Number(limit),
            });
            sendSuccess(res, data, MESSAGE.USERS_FETCHED);
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to fetch users",
                err.statusCode || 500
            );
        }
    },
    createUser: async (req, res) => {
        try {
            const payload = req.body;
            const created = await UserAdminService.createUser(payload);
            sendSuccess(res, created, "User created successfully", 201);
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to create user",
                err.statusCode || 500
            );
        }
    },

    updateUser: async (req, res) => {
        try {
            const updated = await UserAdminService.updateUser(
                req.params.publicId,
                req.body
            );
            sendSuccess(res, updated, "User updated successfully");
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to update user",
                err.statusCode || 500
            );
        }
    },

    deleteUser: async (req, res) => {
        try {
            await UserAdminService.deleteUser(req.params.publicId);
            sendSuccess(res, null, "User deleted successfully", 204);
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to delete user",
                err.statusCode || 500
            );
        }
    },

    restoreUser: async (req, res) => {
        try {
            const restored = await UserAdminService.restoreUser(
                req.params.publicId
            );
            sendSuccess(res, restored, "User restored successfully");
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to restore user",
                err.statusCode || 500
            );
        }
    },
    hardDeleteUser: async (req, res) => {
        try {
            await UserAdminService.hardDeleteUser(req.params.publicId);
            sendSuccess(res, null, "User permanently deleted", 204);
        } catch (err) {
            sendError(
                res,
                err.message || "Failed to permanently delete user",
                err.statusCode || 500
            );
        }
    },
};

module.exports = {
    UserController,
    AdminController,
};
