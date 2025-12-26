const { catchAsync } = require('../../core/catchAsync');
const { sendSuccess, sendError } = require('../../core/response');
const { CatalogService, CatalogAdminService } = require('./catalog.service');

/**
 * CATALOG CONTROLLER
 * Handles catalog HTTP requests
 */

// ----------------------------------------------------------
// USER CONTROLLER
// ----------------------------------------------------------

const CatalogController = {
  /**
   * GET CATEGORY
   */
  getCategory: catchAsync(async (req, res) => {
    const { id } = req.params;
    const category = await CatalogService.getCategory(id);
    sendSuccess(res, category, 'Category retrieved successfully', 200);
  }),

  /**
   * GET CATEGORY BY SLUG
   */
  getCategoryBySlug: catchAsync(async (req, res) => {
    const { slug } = req.params;
    const category = await CatalogService.getCategoryBySlug(slug);
    sendSuccess(
      res,
      category,
      'Category with attributes retrieved successfully',
      200
    );
  }),

  /**
   * LIST CATEGORIES
   */
  listCategories: catchAsync(async (req, res) => {
    const { page, limit, parentId } = req.query;
    const categories = await CatalogService.listCategories({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      parentId: parentId || null,
    });
    sendSuccess(res, categories, 'Categories retrieved successfully', 200);
  }),

  /**
   * GET CATEGORY TREE
   */
  getCategoryTree: catchAsync(async (req, res) => {
    const { parentId } = req.query;
    const tree = await CatalogService.getCategoryTree(parentId || null);
    sendSuccess(res, tree, 'Category tree retrieved successfully', 200);
  }),

  /**
   * GET CATEGORY WITH ATTRIBUTES
   */
  getCategoryWithAttributes: catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await CatalogService.getCategoryWithAttributes(id);
    sendSuccess(
      res,
      data,
      'Category with attributes retrieved successfully',
      200
    );
  }),

  /**
   * GET CATEGORY ATTRIBUTES
   */
  getAttributes: catchAsync(async (req, res) => {
    const { categoryId } = req.params;
    const { page, limit, isFilterable } = req.query;

    const attributes = await CatalogService.getAttributesByCategory(
      categoryId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        isFilterable: isFilterable === 'true',
      }
    );

    sendSuccess(res, attributes, 'Attributes retrieved successfully', 200);
  }),
};

// ----------------------------------------------------------
// ADMIN CONTROLLER
// ----------------------------------------------------------

const CatalogAdminController = {
  /**
   * CREATE CATEGORY
   */
  createCategory: catchAsync(async (req, res) => {
    const { name, description, image, parentId } = req.body;

    if (!name) {
      return sendError(res, 'Category name is required', 400);
    }

    const category = await CatalogAdminService.createCategory({
      name,
      description,
      image,
      parentId,
    });

    sendSuccess(res, category, 'Category created successfully', 201);
  }),

  /**
   * UPDATE CATEGORY
   */
  updateCategory: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, description, image, parentId, isActive } = req.body;

    const category = await CatalogAdminService.updateCategory(id, {
      name,
      description,
      image,
      parentId,
      isActive,
    });

    sendSuccess(res, category, 'Category updated successfully', 200);
  }),

  /**
   * DELETE CATEGORY
   */
  deleteCategory: catchAsync(async (req, res) => {
    const { id } = req.params;
    const category = await CatalogAdminService.deleteCategory(id);
    sendSuccess(res, category, 'Category deleted successfully', 200);
  }),

  /**
   * CREATE ATTRIBUTE
   */
  createAttribute: catchAsync(async (req, res) => {
    const { name, type, values, categoryId, isRequired, isFilterable } =
      req.body;

    if (!name || !categoryId) {
      return sendError(res, 'Name and categoryId are required', 400);
    }

    const attribute = await CatalogAdminService.createAttribute({
      name,
      type: type || 'text',
      values: values || [],
      categoryId,
      isRequired: isRequired || false,
      isFilterable: isFilterable !== false,
    });

    sendSuccess(res, attribute, 'Attribute created successfully', 201);
  }),

  /**
   * UPDATE ATTRIBUTE
   */
  updateAttribute: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, type, values, isRequired, isFilterable } = req.body;

    const attribute = await CatalogAdminService.updateAttribute(id, {
      name,
      type,
      values,
      isRequired,
      isFilterable,
    });

    sendSuccess(res, attribute, 'Attribute updated successfully', 200);
  }),

  /**
   * DELETE ATTRIBUTE
   */
  deleteAttribute: catchAsync(async (req, res) => {
    const { id } = req.params;
    const attribute = await CatalogAdminService.deleteAttribute(id);
    sendSuccess(res, attribute, 'Attribute deleted successfully', 200);
  }),

  /**
   * ADD ATTRIBUTE VALUE
   */
  addAttributeValue: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { value, label } = req.body;

    if (!value) {
      return sendError(res, 'Value is required', 400);
    }

    const attribute = await CatalogAdminService.addAttributeValue(id, {
      value,
      label: label || value,
    });

    sendSuccess(res, attribute, 'Attribute value added successfully', 200);
  }),
};

module.exports = {
  CatalogController,
  CatalogAdminController,
};
