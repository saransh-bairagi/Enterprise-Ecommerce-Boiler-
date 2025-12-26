// src/core/constants.js

module.exports = {
    // User roles
    ROLES: {
        USER: "user",
        ADMIN: "admin",
        SUPER_ADMIN: "super-admin",
    },
    // Error messages
    ERRORS: {
        PRODUCT_NOT_FOUND: "Product not found",
        SLUG_EXISTS: "Slug already exists",
        DUPLICATE_VARIANT_SKU: "Duplicate variant SKUs",
        VARIANT_NOT_FOUND: "Product or Variant not found",
        SKU_NOT_FOUND: "Product or SKU not found",
        UNAUTHORIZED: "You are not allowed to perform this action",
        INVALID_PAYLOAD: "Invalid payload",
        USER_NOT_FOUND: "User not found",
        LOGIN_FAILED: "Login failed",
        PLEASE_LOGIN: "Please login to continue",
        TEMPERED_TOKEN: "Token has been tampered with",
        TOKEN_NOT_ACTIVE: "Token is not active yet",
        LOGOUT_FAILED: "Logout failed",
        ACCOUNT_DELETION_FAILED: "Account deletion failed",
        ACCOUNT_CREATION_FAILED: "Account creation failed",
        ROUTE_NOT_FOUND: "Route not found",
        INVALID_CREDENTIALS: "Invalid email or password",
        EMAIL_EXISTS: "Email already exists",
        PHONE_EXISTS: "Phone number already exists",
        COULD_NOT_ATTACH_SECRET: "Could not attach secret to request",
        PRODUCT_NOT_FOUND_OR_ISDELETED: "Product not found or is deleted",
        PRODUCT_SOFT_DELELED: "Product is already soft deleted",
    },
    MESSAGES: {
        PRODUCT_CREATED: "Product created successfully",
        PRODUCT_UPDATED: "Product updated successfully",
        PRODUCT_DELETED: "Product deleted successfully",
        PROFILE_FETCHED: "Profile fetched successfully",
        PROFILE_UPDATED: "Profile updated successfully",
        PROFILE_DELTED: "Profile deleted successfully",
        USERS_FETCHED: "Users list fetched successfully",
        ACCOUNT_CREATED: "Account created successfully",
        ACCOUNT_DELETED: "Account deleted successfully",
    },
    // Order status
    ORDER_STATUS: {
        PENDING: "pending",
        PROCESSING: "processing",
        SHIPPED: "shipped",
        DELIVERED: "delivered",
        CANCELLED: "cancelled",
        RETURNED: "returned",
    },

    // Payment status
    PAYMENT_STATUS: {
        PENDING: "pending",
        COMPLETED: "completed",
        FAILED: "failed",
        REFUNDED: "refunded",
    },

    // General constants
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // Regex patterns
    REGEX: {
        EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        PHONE: /^[0-9]{10}$/,
    },

    // Environment modes
    ENV: {
        DEV: "development",
        PROD: "production",
        TEST: "test",
    },
};
