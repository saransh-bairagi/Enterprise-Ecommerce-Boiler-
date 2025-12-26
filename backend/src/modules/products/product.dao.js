// src/modules/products/product.dao.js

/**
 * DAO: Single place for all DB ops.
 * All queries / updates go through here.
 */

const Product = require("./product.model");
const mongoose = require("mongoose");
const AppError = require("../../core/appError");
const ERROR = require("../../core/constants").ERRORS;
const ProductDAO = {
    // For finding a Product by its publicId
   
    publicIdtoId(publicId,isDeleted=null) {
        if(isDeleted===null)
        return Product.findOne({ publicId })
            .select("_id")
            .lean()
            .exec();
        return Product.findOne({ publicId, isDeleted: isDeleted })
            .select("_id")
            .lean()
            .exec();
    },

    // For finding a Product by its ID
    async findById(id, opts = {}) {
        if (!mongoose.isValidObjectId(id)) return null;
        return Product.findOne({ _id: id, isDeleted: false })
            .populate(opts.populate || [])
            .lean()
            .exec();
    },
    async findByPublicId(publicId) {
        return Product.findOne({ publicId, isDeleted: false }).lean().exec();
    },
    // For finding a Product by its slug
    async findBySlug(slug) {
        return Product.findOne({ slug, isDeleted: false }).lean().exec();
    },

    // Listing products with filters, pagination, sorting
    async list(
        filter = {},
        { page = 1, limit = 20, sort = { createdAt: -1 }, select = null } = {}
    ) {
        const skip = (page - 1) * limit;
        const q = Product.find({ ...filter, isDeleted: false });
        if (select) q.select(select);
        q.sort(sort).skip(skip).limit(limit);

        const [items, total] = await Promise.all([
            q.lean().exec(),
            Product.countDocuments({ ...filter, isDeleted: false }),
        ]);

        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    },

    async searchText(text, options = {}) {
        const { page = 1, limit = 20, filters = {}, sort = {} } = options;
        const skip = (page - 1) * limit;

        const q = Product.find(
            { $text: { $search: text }, ...filters, isDeleted: false },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" }, ...sort })
            .skip(skip)
            .limit(limit)
            .lean();

        const [items, total] = await Promise.all([
            q.exec(),
            Product.countDocuments({
                $text: { $search: text },
                ...filters,
                isDeleted: false,
            }),
        ]);

        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    },

    async addReviewByPublicId(productId, review) {
        const systemId = await this.publicIdtoId(productId);
        if (!systemId) return null;

        productId = systemId._id;
        await Product.findByIdAndUpdate(productId, {
            $push: { reviews: review },
            $inc: { reviewsCount: 1 },
        });

        const product = await Product.findById(productId).exec();
        if (!product) return null;

        const avg =
            (product.reviews || []).reduce((acc, r) => acc + r.rating, 0) /
            (product.reviews.length || 1);

        product.rating = avg;
        await product.save();
        return product;
    },
    async addReviewBySlug(slug, review) {
        const systemId = await this.findBySlug(slug);
        if (!systemId) return null;

        const productId = systemId._id;
        await Product.findByIdAndUpdate(productId, {
            $push: { reviews: review },
            $inc: { reviewsCount: 1 },
        });

        const product = await Product.findById(productId).exec();
        if (!product) return null;

        const avg =
            (product.reviews || []).reduce((acc, r) => acc + r.rating, 0) /
            (product.reviews.length || 1);

        product.rating = avg;
        await product.save();
        return product;
    },
};

// ──────────────────────────────────────────────────────────────
// ADMIN DAO
// ──────────────────────────────────────────────────────────────

const ProductAdminDAO = {
     async updateById(id, update, opts = {}) {
      
        const finalOptions = {
            new: true,
            runValidators: true,
            ...opts,
        };
        return Product.findByIdAndUpdate(id, update, finalOptions).exec();
    },
    async addImages(productId, imagePaths = []) {
         
        return Product.findByIdAndUpdate(
            productId,
            { $push: { images: { $each: imagePaths } } },
            { new: true }
        ).exec();
    },

    async createProduct(data) {
        const product = new Product(data);
        return product.save();
    },

    async getProductById(productId) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        return Product.findById(productId).exec();
    },

    async listProducts(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
    },

    async updateProduct(productId, data) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        return Product.findByIdAndUpdate(
            productId,
            { $set: data },
            { new: true, runValidators: true }
        ).exec();
    },

    async incrementViews(productId) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        return Product.findByIdAndUpdate(
            productId,
            { $inc: { "meta.views": 1 } },
            { new: true }
        ).exec();
    },

    async adjustStockForSku(productId, sku, delta) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) return null;
        productId = systemId._id;
        return Product.findOneAndUpdate(
            { _id: productId, "variants.sku": sku },
            { $inc: { "variants.$.stock": delta } },
            { new: true }
        ).exec();
    },

    async addVariant(productId, variant) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        return Product.findByIdAndUpdate(
            productId,
            { $push: { variants: variant } },
            { new: true }
        ).exec();
    },

    async updateVariant(productId, sku, updateData) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        return Product.findOneAndUpdate(
            { _id: productId, "variants.sku": sku },
            {
                $set: {
                    ...Object.fromEntries(
                        Object.entries(updateData).map(([k, v]) => [
                            `variants.$.${k}`,
                            v,
                        ])
                    ),
                },
            },
            { new: true }
        ).exec();
    },
    async removeVariant(productId, sku) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        return Product.findByIdAndUpdate(
            productId,
            { $pull: { variants: { sku } } },
            { new: true }
        ).exec();
    },
    async isProductSoftDeleted(productId) {
        const systemId = await ProductDAO.publicIdtoId(productId, true);
        if (!systemId) return false;
        const product = await Product.findById(systemId._id).exec();
        return product ? product.isDeleted : false;
    },
    async softDelete(productId) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        console.log("System ID:", systemId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        
        console.log("Soft deleting product:", productId);
        return Product.findByIdAndUpdate(
            productId,
            { $set: { isDeleted: true, deletedAt: new Date() } },
            { new: true }
        ).exec();
    },

    async restore(productId) {
        // FIX: correct field name from "deleted" → "isDeleted"
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) return null;
        productId = systemId._id;
        return Product.findByIdAndUpdate(
            productId,
            { $set: { isDeleted: false, deletedAt: null } },
            { new: true }
        ).exec();
    },

    async hardDelete(productId) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        productId = systemId._id;
        return Product.findByIdAndDelete(productId).exec();
    },

    async updateByPublicId(publicId, update, opts = {}) {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        publicId = systemId._id;
        const finalOptions = {
            new: true,
            runValidators: true,
            ...opts,
        };

        return Product.findByIdAndUpdate(publicId, update, finalOptions).exec();
    },

    async bulkInsert(docs = []) {
        return Product.insertMany(docs, { ordered: false });
    },

    async addReview(productId, review) {
        await Product.findByIdAndUpdate(productId, {
            $push: { reviews: review },
            $inc: { reviewsCount: 1 },
        });

        const product = await Product.findById(productId).exec();
        if (!product) return null;

        const avg =
            (product.reviews || []).reduce((acc, r) => acc + r.rating, 0) /
            (product.reviews.length || 1);

        product.rating = avg;
        await product.save();
        return product;
    },
};

module.exports = {
    ProductDAO,
    ProductAdminDAO,
};
