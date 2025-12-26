/**
 * PRICING DTO
 * Data Transfer Objects for pricing responses
 */

const pricingRuleDTO = (rule) => {
  if (!rule) return null;

  return {
    id: rule.publicId,
    name: rule.name,
    description: rule.description,
    type: rule.type,
    priority: rule.priority,
    conditions: rule.conditions || {},
    discount: rule.discount || {},
    isActive: rule.isActive,
    createdAt: rule.createdAt,
  };
};

const bulkPricingDTO = (pricing) => {
  if (!pricing) return null;

  return {
    id: pricing.publicId,
    productId: pricing.productId,
    tiers: pricing.tiers || [],
    isActive: pricing.isActive,
    createdAt: pricing.createdAt,
  };
};

const tierPricingDTO = (tier) => {
  if (!tier) return null;

  return {
    id: tier.publicId,
    name: tier.name,
    description: tier.description,
    discount: tier.discount,
    minSpend: tier.minSpend,
    benefits: tier.benefits || [],
    isActive: tier.isActive,
    createdAt: tier.createdAt,
  };
};

const priceCalculationDTO = (originalPrice, finalPrice, discount, savings) => {
  return {
    originalPrice,
    finalPrice,
    discount,
    savings,
    discountPercentage: discount > 0 ? ((discount / originalPrice) * 100).toFixed(2) : 0,
  };
};

module.exports = {
  pricingRuleDTO,
  bulkPricingDTO,
  tierPricingDTO,
  priceCalculationDTO,
};
