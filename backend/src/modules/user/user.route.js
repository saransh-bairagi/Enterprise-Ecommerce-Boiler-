const router = require("express").Router();

const { UserController, AdminController } = require("./user.controller");
const { auth } = require("../../common middlewares/auth");
const { rbac } = require("../../common middlewares/rbac");
const UserMiddleware = require("./user.middleware"); // for validation or file upload

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get own profile
router.get("/", auth, UserController.getProfile);

// Update own profile
router.put(
    "/",
    auth,
    UserMiddleware.validateUpdate,
    UserController.updateProfile
);

router.post("/login", UserController.login);
router.post("/logout", auth, UserController.logout);
router.delete("/delete", auth, UserController.delete);
router.post("/create", UserController.createUser);
// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE USER
 */
router.post(
    "/admin",
    auth,
    rbac("admin"),
    UserMiddleware.validateCreate,
    AdminController.createUser
);

/**
 * UPDATE USER
 */
router.put(
    "/admin/:publicId",
    auth,
    rbac("admin"),
    UserMiddleware.validateUpdate,
    AdminController.updateUser
);

/**
 * DELETE USER (Soft Delete)
 */
router.delete("/admin/:publicId", auth, rbac("admin"), AdminController.deleteUser);

/**
 * RESTORE USER
 */
router.patch(
    "/admin/:ipublicI/restore",
    auth,
    rbac("admin"),
    AdminController.restoreUser
);
// Hard Delete User
router.delete(
    "/admin/:publicId/hard",
    auth,
    rbac("admin"),
    AdminController.hardDeleteUser
);

module.exports = router;
