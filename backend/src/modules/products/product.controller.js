const { ProductService, ProductAdminService } = require("./product.service");
const {catchAsync} = require("../../core/catchAsync");
const { sendSuccess } = require("../../core/response");

/* ----------------------------------------------------------
 * USER-FACING CONTROLLERS (NO CREATE/UPDATE/DELETE)
 * ----------------------------------------------------------*/
const UserController = {
  getByPublicId: catchAsync(async (req, res) => {
    const product = await ProductService.getProduct(req.params.publicId, { by: "publicId" });
    sendSuccess(res, product);
  }),

  getBySlug: catchAsync(async (req, res) => {
    const product = await ProductService.getProduct(req.params.slug, { by: "slug" });
    sendSuccess(res, product);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      sortBy: req.query.sortBy || "-createdAt",
      filters: {},
    };
    if (req.query.category) q.filters.categories = req.query.category;
    if (req.query.brand) q.filters.brand = req.query.brand;

    const data = await ProductService.listProducts(q);
    sendSuccess(res, data);
  }),

  search: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await ProductService.searchProducts(req.query.q || "", q);
    sendSuccess(res, data);
  }),

  addReviewByPublicId: catchAsync(async (req, res) => {
    const payload = {
      userId: req.attachedSECRET.userId,
      rating: req.body.rating,
      title: req.body.title,
      body: req.body.body,
    };
    const updated = await ProductService.addReviewByPublicId(req.params.publicId, payload);
    sendSuccess(res, updated, "Review added", 201);
  }),

  addReviewBySlug: catchAsync(async (req, res) => {
    const payload = {
      userId: req.attachedSECRET.userId,
      rating: req.body.rating,
      title: req.body.title,
      body: req.body.body,
    };
    const updated = await ProductService.addReviewBySlug(req.params.slug, payload);
    sendSuccess(res, updated, "Review added", 201);
  }),
};

/* ----------------------------------------------------------
 * ADMIN CONTROLLERS
 * ----------------------------------------------------------*/
const ProductAdminController = {
  create: catchAsync(async (req, res) => {
    const payload = { ...req.body, createdBy: req.attachedSECRET?.userId };
    const created = await ProductAdminService.createProduct(payload);
    sendSuccess(res, created, "Product created", 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await ProductAdminService.updateProduct(
      req.params.publicId,
      req.body,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, "Product updated");
  }),

  delete: catchAsync(async (req, res) => {
    console.log("Delete request for product:", req.params.publicId);
    const deletedProduct = await ProductAdminService.deleteProduct(
      req.params.publicId,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, deletedProduct, "Product deleted");
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await ProductAdminService.restoreProduct(req.params.publicId);
    sendSuccess(res, restored, "Product restored");
  }),

  adjustStock: catchAsync(async (req, res) => {
    const { sku, qty } = req.body;
    if (!sku || typeof qty !== "number") throw new AppError("Invalid payload", 400);

    const updated = await ProductAdminService.adjustStock(req.params.publicId, sku, qty);
    sendSuccess(res, updated, "Stock adjusted");
  }),

  updateVariant: catchAsync(async (req, res) => {
    const updated = await ProductAdminService.updateVariant(
      req.params.publicId,
      req.body.sku,
      req.body.update
    );
    sendSuccess(res, updated, "Variant updated");
  }),

  bulkCreate: catchAsync(async (req, res) => {
    const docs = req.body.products || [];
    const created = await ProductAdminService.bulkCreate(docs, req.attachedSECRET?.userId);
    sendSuccess(res, { count: created.length, items: created }, "Bulk products created", 201);
  }),

  uploadImages: catchAsync(async (req, res) => {
    const result = await ProductAdminService.uploadImages(req.params.publicId, req.files || []);
    sendSuccess(res, result, "Images uploaded");
  }),
};

module.exports = { UserController, ProductAdminController };
