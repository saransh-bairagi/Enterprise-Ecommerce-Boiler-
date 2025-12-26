const { CatalogDAO, CatalogAdminDAO } = require('./catalog.dao');
const {
  categoryDTO,
  categoryListDTO,
  attributeDTO,
  attributeListDTO,
  catalogDTO,
} = require('./catalog.dto');
const AppError = require('../../core/appError');

/**
 * CATALOG SERVICE
 * Business logic for categories and attributes
 */

const CatalogService = {
  /**
   * GET CATEGORY
   */
  async getCategory(categoryId) {
    const category = await CatalogDAO.findCategoryById(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return categoryDTO(category);
  },

  /**
   * GET CATEGORY BY SLUG
   */
  async getCategoryBySlug(slug) {
    const category = await CatalogDAO.findCategoryBySlug(slug);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const attributes = await CatalogDAO.getFilterableAttributes(
      category._id
    );

    return catalogDTO(category, attributes);
  },

  /**
   * LIST CATEGORIES
   */
  async listCategories(options = {}) {
    const categories = await CatalogDAO.listCategories(options);
    return {
      ...categories,
      items: categoryListDTO(categories.items),
    };
  },

  /**
   * GET CATEGORY TREE
   */
  async getCategoryTree(parentId = null) {
    const categories = await CatalogDAO.getCategoryHierarchy(parentId);
    return categoryListDTO(categories);
  },

  /**
   * GET CATEGORY WITH ATTRIBUTES
   */
  async getCategoryWithAttributes(categoryId) {
    const category = await CatalogDAO.findCategoryById(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const attributes = await CatalogDAO.listAttributesByCategory(
      category._id,
      { limit: 100 }
    );

    return catalogDTO(category, attributes.items);
  },

  /**
   * GET ATTRIBUTES FOR CATEGORY
   */
  async getAttributesByCategory(categoryId, options = {}) {
    const attributes = await CatalogDAO.listAttributesByCategory(
      categoryId,
      options
    );
    return {
      ...attributes,
      items: attributeListDTO(attributes.items),
    };
  },
};

// ----------------------------------------------------------
// ADMIN SERVICE
// ----------------------------------------------------------

const CatalogAdminService = {
  /**
   * CREATE CATEGORY
   */
  async createCategory(data) {
    const category = await CatalogAdminDAO.createCategory(data);
    return categoryDTO(category);
  },

  /**
   * UPDATE CATEGORY
   */
  async updateCategory(categoryId, data) {
    const category = await CatalogAdminDAO.updateCategory(categoryId, data);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return categoryDTO(category);
  },

  /**
   * DELETE CATEGORY
   */
  async deleteCategory(categoryId) {
    const category = await CatalogAdminDAO.deleteCategory(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return categoryDTO(category);
  },

  /**
   * CREATE ATTRIBUTE
   */
  async createAttribute(data) {
    const attribute = await CatalogAdminDAO.createAttribute(data);
    return attributeDTO(attribute);
  },

  /**
   * UPDATE ATTRIBUTE
   */
  async updateAttribute(attributeId, data) {
    const attribute = await CatalogAdminDAO.updateAttribute(
      attributeId,
      data
    );
    if (!attribute) {
      throw new AppError('Attribute not found', 404);
    }
    return attributeDTO(attribute);
  },

  /**
   * DELETE ATTRIBUTE
   */
  async deleteAttribute(attributeId) {
    const attribute = await CatalogAdminDAO.deleteAttribute(attributeId);
    if (!attribute) {
      throw new AppError('Attribute not found', 404);
    }
    return attributeDTO(attribute);
  },

  /**
   * ADD ATTRIBUTE VALUE
   */
  async addAttributeValue(attributeId, value) {
    const attribute = await CatalogAdminDAO.addAttributeValue(
      attributeId,
      value
    );
    if (!attribute) {
      throw new AppError('Attribute not found', 404);
    }
    return attributeDTO(attribute);
  },
};

module.exports = {
  CatalogService,
  CatalogAdminService,
};
