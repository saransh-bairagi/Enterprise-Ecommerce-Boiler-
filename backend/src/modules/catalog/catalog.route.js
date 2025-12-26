const router = require('express').Router();

const { CatalogController, CatalogAdminController } = require('./catalog.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES (NO AUTH)
// ----------------------------------------------------------

/**
 * GET CATEGORY BY ID
 */
router.get('/category/:id', CatalogController.getCategory);

/**
 * GET CATEGORY BY SLUG WITH ATTRIBUTES
 */
router.get('/category-slug/:slug', CatalogController.getCategoryBySlug);

/**
 * LIST ALL CATEGORIES
 */
router.get('/categories', CatalogController.listCategories);

/**
 * GET CATEGORY TREE (HIERARCHY)
 */
router.get('/categories/tree', CatalogController.getCategoryTree);

/**
 * GET CATEGORY WITH ATTRIBUTES
 */
router.get(
  '/category/:id/attributes',
  CatalogController.getCategoryWithAttributes
);

/**
 * GET CATEGORY ATTRIBUTES
 */
router.get(
  '/category/:categoryId/filters',
  CatalogController.getAttributes
);

// ----------------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------------

/**
 * CREATE CATEGORY
 */
router.post(
  '/admin/category',
  auth,
  rbac('admin'),
  CatalogAdminController.createCategory
);

/**
 * UPDATE CATEGORY
 */
router.patch(
  '/admin/category/:id',
  auth,
  rbac('admin'),
  CatalogAdminController.updateCategory
);

/**
 * DELETE CATEGORY
 */
router.delete(
  '/admin/category/:id',
  auth,
  rbac('admin'),
  CatalogAdminController.deleteCategory
);

/**
 * CREATE ATTRIBUTE
 */
router.post(
  '/admin/attribute',
  auth,
  rbac('admin'),
  CatalogAdminController.createAttribute
);

/**
 * UPDATE ATTRIBUTE
 */
router.patch(
  '/admin/attribute/:id',
  auth,
  rbac('admin'),
  CatalogAdminController.updateAttribute
);

/**
 * DELETE ATTRIBUTE
 */
router.delete(
  '/admin/attribute/:id',
  auth,
  rbac('admin'),
  CatalogAdminController.deleteAttribute
);

/**
 * ADD ATTRIBUTE VALUE
 */
router.post(
  '/admin/attribute/:id/value',
  auth,
  rbac('admin'),
  CatalogAdminController.addAttributeValue
);

module.exports = router;
