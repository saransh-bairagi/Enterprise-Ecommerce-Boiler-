const { Category, Attribute } = require('./catalog.model');

/**
 * CATALOG DAO
 * Handles all catalog queries (categories and attributes)
 */

const CatalogDAO = {
  /**
   * CATEGORY QUERIES
   */

  async findCategoryById(id) {
    return Category.findOne({
      publicId: id,
      isDeleted: false,
    }).lean();
  },

  async findCategoryBySlug(slug) {
    return Category.findOne({
      slug,
      isDeleted: false,
      isActive: true,
    }).lean();
  },

  async listCategories(options = {}) {
    const { page = 1, limit = 50, parentId = null, isActive = true } = options;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (parentId !== undefined) filter.parentId = parentId;
    if (isActive !== undefined) filter.isActive = isActive;

    const total = await Category.countDocuments(filter);

    const items = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async getCategoryHierarchy(parentId = null) {
    return Category.find({
      parentId: parentId || null,
      isDeleted: false,
      isActive: true,
    })
      .sort({ order: 1, name: 1 })
      .lean();
  },

  /**
   * ATTRIBUTE QUERIES
   */

  async findAttributeById(id) {
    return Attribute.findOne({
      publicId: id,
      isDeleted: false,
    }).lean();
  },

  async listAttributesByCategory(categoryId, options = {}) {
    const { page = 1, limit = 50, isFilterable } = options;
    const skip = (page - 1) * limit;

    const filter = {
      categoryId,
      isDeleted: false,
    };

    if (isFilterable !== undefined) filter.isFilterable = isFilterable;

    const total = await Attribute.countDocuments(filter);

    const items = await Attribute.find(filter)
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async getFilterableAttributes(categoryId) {
    return Attribute.find({
      categoryId,
      isFilterable: true,
      isDeleted: false,
    })
      .sort({ order: 1 })
      .lean();
  },
};

// ----------------------------------------------------------
// ADMIN DAO
// ----------------------------------------------------------

const CatalogAdminDAO = {
  /**
   * CATEGORY ADMIN OPERATIONS
   */

  async createCategory(data) {
    const category = new Category(data);
    return category.save();
  },

  async updateCategory(id, data) {
    return Category.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async deleteCategory(id) {
    return Category.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  /**
   * ATTRIBUTE ADMIN OPERATIONS
   */

  async createAttribute(data) {
    const attribute = new Attribute(data);
    return attribute.save();
  },

  async updateAttribute(id, data) {
    return Attribute.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async deleteAttribute(id) {
    return Attribute.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  async addAttributeValue(attributeId, value) {
    return Attribute.findOneAndUpdate(
      { publicId: attributeId, isDeleted: false },
      { $push: { values: value } },
      { new: true }
    );
  },
};

module.exports = {
  CatalogDAO,
  CatalogAdminDAO,
};
