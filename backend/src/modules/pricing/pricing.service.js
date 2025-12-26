const { PricingDAO, PricingAdminDAO } = require('./pricing.dao');
const {
  pricingRuleDTO,
  bulkPricingDTO,
  tierPricingDTO,
  priceCalculationDTO,
} = require('./pricing.dto');
const AppError = require('../../core/appError');

/**
 * PRICING SERVICE
 * Business logic for dynamic pricing
 */

const PricingService = {
  /**
   * CALCULATE FINAL PRICE WITH ALL APPLICABLE DISCOUNTS
   */
  async calculatePrice(productId, quantity, basePrice, conditions = {}) {
    // Get applicable pricing rules
    const rules = await PricingDAO.findApplicableRules({
      quantity,
      ...conditions,
    });

    let finalPrice = basePrice;
    let totalDiscount = 0;

    // Apply highest priority rule
    if (rules.length > 0) {
      const rule = rules[0];
      if (rule.discount.type === 'percentage') {
        const discount = (basePrice * rule.discount.value) / 100;
        totalDiscount = Math.min(
          discount,
          rule.discount.maxDiscount || discount
        );
      } else if (rule.discount.type === 'fixed_amount') {
        totalDiscount = Math.min(
          rule.discount.value,
          rule.discount.maxDiscount || rule.discount.value
        );
      } else if (rule.discount.type === 'fixed_price') {
        finalPrice = rule.discount.value;
      }
    }

    finalPrice = Math.max(0, basePrice - totalDiscount);

    return {
      originalPrice: basePrice,
      finalPrice,
      discount: totalDiscount,
      savings: totalDiscount,
    };
  },

  /**
   * GET BULK PRICING TIERS FOR PRODUCT
   */
  async getBulkPricingTiers(productId) {
    const bulkPricing = await PricingDAO.findBulkPricingByProduct(productId);
    if (!bulkPricing) {
      return null;
    }
    return bulkPricingDTO(bulkPricing);
  },

  /**
   * APPLY BULK DISCOUNT
   */
  async applyBulkDiscount(productId, quantity, basePrice) {
    const bulkPricing = await PricingDAO.findBulkPricingByProduct(productId);
    if (!bulkPricing) {
      return null;
    }

    // Find applicable tier
    const tier = bulkPricing.tiers.find((t) => {
      return (
        quantity >= t.minQuantity &&
        (!t.maxQuantity || quantity <= t.maxQuantity)
      );
    });

    if (!tier) {
      return null;
    }

    const discount = basePrice - tier.price;
    return priceCalculationDTO(basePrice, tier.price, discount, discount);
  },

  /**
   * GET PRICING RULES
   */
  async listRules(options = {}) {
    const rules = await PricingDAO.listRules(options);
    return {
      ...rules,
      items: rules.items.map(pricingRuleDTO),
    };
  },

  /**
   * GET PRICING TIERS
   */
  async listTiers(options = {}) {
    const tiers = await PricingDAO.listTiers(options);
    return {
      ...tiers,
      items: tiers.items.map(tierPricingDTO),
    };
  },

  /**
   * GET CUSTOMER TIER BASED ON SPENDING
   */
  async getCustomerTier(totalSpend) {
    const tier = await PricingDAO.findTierBySpend(totalSpend);
    return tier ? tierPricingDTO(tier) : null;
  },
};

// ----------------------------------------------------------
// ADMIN SERVICE
// ----------------------------------------------------------

const PricingAdminService = {
  async createRule(data) {
    const rule = await PricingAdminDAO.createRule(data);
    return pricingRuleDTO(rule);
  },

  async updateRule(id, data) {
    const rule = await PricingAdminDAO.updateRule(id, data);
    if (!rule) throw new AppError('Pricing rule not found', 404);
    return pricingRuleDTO(rule);
  },

  async deleteRule(id) {
    const rule = await PricingAdminDAO.deleteRule(id);
    if (!rule) throw new AppError('Pricing rule not found', 404);
    return pricingRuleDTO(rule);
  },

  async createBulkPricing(data) {
    const pricing = await PricingAdminDAO.createBulkPricing(data);
    return bulkPricingDTO(pricing);
  },

  async updateBulkPricing(id, data) {
    const pricing = await PricingAdminDAO.updateBulkPricing(id, data);
    if (!pricing) throw new AppError('Bulk pricing not found', 404);
    return bulkPricingDTO(pricing);
  },

  async deleteBulkPricing(id) {
    const pricing = await PricingAdminDAO.deleteBulkPricing(id);
    if (!pricing) throw new AppError('Bulk pricing not found', 404);
    return bulkPricingDTO(pricing);
  },

  async createTier(data) {
    const tier = await PricingAdminDAO.createTier(data);
    return tierPricingDTO(tier);
  },

  async updateTier(id, data) {
    const tier = await PricingAdminDAO.updateTier(id, data);
    if (!tier) throw new AppError('Pricing tier not found', 404);
    return tierPricingDTO(tier);
  },

  async deleteTier(id) {
    const tier = await PricingAdminDAO.deleteTier(id);
    if (!tier) throw new AppError('Pricing tier not found', 404);
    return tierPricingDTO(tier);
  },
};

module.exports = {
  PricingService,
  PricingAdminService,
};
