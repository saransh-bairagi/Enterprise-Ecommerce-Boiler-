const { PricingRule, BulkPricing, TierPricing } = require('./pricing.model');

/**
 * PRICING DAO
 * Handles all pricing queries
 */

const PricingDAO = {
  async findRuleById(id) {
    return PricingRule.findOne({
      publicId: id,
      isDeleted: false,
    }).lean();
  },

  async listRules(options = {}) {
    const { page = 1, limit = 20, type, isActive = true } = options;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive;

    const total = await PricingRule.countDocuments(filter);

    const items = await PricingRule.find(filter)
      .sort({ priority: -1, createdAt: -1 })
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

  async findApplicableRules(conditions) {
    return PricingRule.find({
      isActive: true,
      isDeleted: false,
      $or: [
        { 'conditions.minQuantity': { $lte: conditions.quantity } },
        { 'conditions.applicableCategories': conditions.category },
        { 'conditions.applicableProducts': conditions.product },
      ],
    })
      .sort({ priority: -1 })
      .lean();
  },

  async findBulkPricingByProduct(productId) {
    return BulkPricing.findOne({
      productId,
      isActive: true,
      isDeleted: false,
    }).lean();
  },

  async listBulkPricings(options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false, isActive: true };
    const total = await BulkPricing.countDocuments(filter);

    const items = await BulkPricing.find(filter)
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

  async findTierById(id) {
    return TierPricing.findOne({
      publicId: id,
      isDeleted: false,
    }).lean();
  },

  async listTiers(options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false, isActive: true };
    const total = await TierPricing.countDocuments(filter);

    const items = await TierPricing.find(filter)
      .sort({ minSpend: 1 })
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

  async findTierBySpend(totalSpend) {
    return TierPricing.findOne({
      minSpend: { $lte: totalSpend },
      isActive: true,
      isDeleted: false,
    })
      .sort({ minSpend: -1 })
      .lean();
  },
};

// ----------------------------------------------------------
// ADMIN DAO
// ----------------------------------------------------------

const PricingAdminDAO = {
  async createRule(data) {
    const rule = new PricingRule(data);
    return rule.save();
  },

  async updateRule(id, data) {
    return PricingRule.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async deleteRule(id) {
    return PricingRule.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  async createBulkPricing(data) {
    const pricing = new BulkPricing(data);
    return pricing.save();
  },

  async updateBulkPricing(id, data) {
    return BulkPricing.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true }
    );
  },

  async deleteBulkPricing(id) {
    return BulkPricing.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  async createTier(data) {
    const tier = new TierPricing(data);
    return tier.save();
  },

  async updateTier(id, data) {
    return TierPricing.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true }
    );
  },

  async deleteTier(id) {
    return TierPricing.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },
};

module.exports = {
  PricingDAO,
  PricingAdminDAO,
};
