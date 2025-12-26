/**
 * DAO: All DB operations for User.
 * Clean separation from service layer.
 */

const { find } = require("lodash");
const User = require("./user.model");
const mongoose = require("mongoose");

const UserDAO = {
    // ──────────────────────────────────────────────────────────────
    // PUBLIC QUERIES
    // ──────────────────────────────────────────────────────────────

    // Convert publicId → _id
    publicIdToId(publicId) {
        return User.findOne({ publicId, isDeleted: false })
            .select("_id")
            .lean()
            .exec();
    },

    // Find user by database ID
    async findById(id, opts = {}) {
        if (!mongoose.isValidObjectId(id)) return null;

        return User.findOne({ _id: id, isDeleted: false })
            .select(opts.select || "-password") // hide password by default
            .populate(opts.populate || [])
            .lean()
            .exec();
    },

    // Find by email
    async findByEmail(email) {
        return User.findOne({ email, isDeleted: false }).lean().exec();
    },

    // Find by phone
    async findByPhone(phone) {
        return User.findOne({ phone, isDeleted: false }).lean().exec();
    },

    // Generic findOne
    async findOne(filter, opts = {}) {
        return User.findOne({ ...filter, isDeleted: false })
            .select(opts.select || "-password")
            .lean()
            .exec();
    },

    // List users (pagination)
    async list(
        filter = {},
        { page = 1, limit = 20, sort = { createdAt: -1 }, select = null } = {}
    ) {
        const skip = (page - 1) * limit;

        const q = User.find({ ...filter, isDeleted: false });
        if (select) q.select(select);
        q.sort(sort).skip(skip).limit(limit);

        const [items, total] = await Promise.all([
            q.lean().exec(),
            User.countDocuments({ ...filter, isDeleted: false }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    },
};

// ──────────────────────────────────────────────────────────────
// ADMIN DAO
// ──────────────────────────────────────────────────────────────

const UserAdminDAO = {
    async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        return User.findById(id).select("-password").lean().exec();
    },
    // Create a new user
    async create(data) {
        const user = new User(data);
        return user.save();
    },

    // Get user with password (used for login)
    async findByEmailWithPassword(email) {
        return User.findOne({ email, isDeleted: false })
            .select("+password")
            .exec();
    },

    // Update user by ID
    async updateById(publicId, data, opts = {}) {
        const userDoc = await UserDAO.publicIdToId(publicId);
        if (!userDoc) return null;
        const id = userDoc._id;
        const finalOpts = {
            new: true,
            runValidators: true,
            ...opts,
        };

        return User.findByIdAndUpdate(id, { $set: data }, finalOpts)
            .select("-password")
            .exec();
    },

    // Soft delete
    async softDelete(id) {
        return User.findByIdAndUpdate(
            id,
            { $set: { isDeleted: true, deletedAt: new Date() } },
            { new: true }
        ).exec();
    },

    // Restore user
    async restore(id) {
        return User.findByIdAndUpdate(
            id,
            { $set: { isDeleted: false, deletedAt: null } },
            { new: true }
        ).exec();
    },

    // Hard delete (permanent)
    async hardDelete(id) {
        return User.findByIdAndDelete(id).exec();
    },

    // Login: find user via email or phone
    async findForLogin(identifier) {
        const user = await User.findOne({
            isDeleted: false,
            $or: [{ email: identifier }, { phone: identifier }],
        })
            .select("+password")
            .exec();

        return user || null;
    },
    // Pagination for admin
    async listUsers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            User.find({ isDeleted: false })
                .select("-password")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean()
                .exec(),

            User.countDocuments({ isDeleted: false }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    },
};

module.exports = {
    UserDAO,
    UserAdminDAO,
};
