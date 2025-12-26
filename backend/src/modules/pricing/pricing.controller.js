const { catchAsync } = require('../../core/catchAsync');
const { sendSuccess, sendError } = require('../../core/response');
const { PricingService, PricingAdminService } = require('./pricing.service');

/**
 * PRICING CONTROLLER
 * Handles pricing HTTP requests
 */

// ----------------------------------------------------------
// USER CONTROLLER
// ----------------------------------------------------------

const PricingController = {
  /**
   * CALCULATE PRICE
   */
  calculatePrice: catchAsync(async (req, res) => {
    const { productId, quantity, basePrice } = req.body;

    if (!productId || !quantity || !basePrice) {
      return sendError(
        res,
        'productId, quantity, and basePrice are required',
        400
      );
    }

    const pricing = await PricingService.calculatePrice(
      productId,
      parseInt(quantity),
      parseFloat(basePrice)
    );

    sendSuccess(res, pricing, 'Price calculated successfully', 200);
  }),

  /**
   * GET BULK PRICING TIERS
   */
  getBulkTiers: catchAsync(async (req, res) => {
    const { productId } = req.params;
    const tiers = await PricingService.getBulkPricingTiers(productId);

    if (!tiers) {
      return sendSuccess(
        res,
        null,
        'No bulk pricing available for this product',
        200
      );
    }

    sendSuccess(res, tiers, 'Bulk pricing tiers retrieved successfully', 200);
  }),

  /**
   * APPLY BULK DISCOUNT
   */
  applyBulkDiscount: catchAsync(async (req, res) => {
    const { productId, quantity, basePrice } = req.body;

    if (!productId || !quantity || !basePrice) {
      return sendError(
        res,
        'productId, quantity, and basePrice are required',
        400
      );
    }

    const discount = await PricingService.applyBulkDiscount(
      productId,
      parseInt(quantity),
      parseFloat(basePrice)
    );

    if (!discount) {
      return sendSuccess(
        res,
        null,
        'No applicable bulk discount for this quantity',
        200
      );
    }

    sendSuccess(res, discount, 'Bulk discount applied successfully', 200);
  }),

  /**
   * LIST PRICING TIERS
   */
  listTiers: catchAsync(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const tiers = await PricingService.listTiers({
      page: parseInt(page),
      limit: parseInt(limit),
    });
    sendSuccess(res, tiers, 'Pricing tiers retrieved successfully', 200);
  }),

  /**
   * GET CUSTOMER TIER
   */
  getCustomerTier: catchAsync(async (req, res) => {
    const { totalSpend } = req.query;

    if (!totalSpend) {
      return sendError(res, 'totalSpend query parameter is required', 400);
    }

    const tier = await PricingService.getCustomerTier(parseFloat(totalSpend));

    sendSuccess(
      res,
      tier,
      'Customer tier determined successfully',
      200
    );
  }),
};

// ----------------------------------------------------------
// ADMIN CONTROLLER
// ----------------------------------------------------------

const PricingAdminController = {
  /**
   * CREATE PRICING RULE
   */
  createRule: catchAsync(async (req, res) => {
    const { name, description, type, conditions, discount, priority } =
      req.body;

    if (!name || !type) {
      return sendError(res, 'name and type are required', 400);
    }

    const rule = await PricingAdminService.createRule({
      name,
      description,
      type,
      conditions,
      discount,
      priority: priority || 0,
    });

    sendSuccess(res, rule, 'Pricing rule created successfully', 201);
  }),

  /**
   * UPDATE PRICING RULE
   */
  updateRule: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, description, conditions, discount, priority, isActive } =
      req.body;

    const rule = await PricingAdminService.updateRule(id, {
      name,
      description,
      conditions,
      discount,
      priority,
      isActive,
    });

    sendSuccess(res, rule, 'Pricing rule updated successfully', 200);
  }),

  /**
   * DELETE PRICING RULE
   */
  deleteRule: catchAsync(async (req, res) => {
    const { id } = req.params;
    const rule = await PricingAdminService.deleteRule(id);
    sendSuccess(res, rule, 'Pricing rule deleted successfully', 200);
  }),

  /**
   * LIST PRICING RULES
   */
  listRules: catchAsync(async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;
    const rules = await PricingService.listRules({
      page: parseInt(page),
      limit: parseInt(limit),
      type,
    });
    sendSuccess(res, rules, 'Pricing rules retrieved successfully', 200);
  }),

  /**
   * CREATE BULK PRICING
   */
  createBulkPricing: catchAsync(async (req, res) => {
    const { productId, tiers } = req.body;

    if (!productId || !tiers || tiers.length === 0) {
      return sendError(res, 'productId and tiers array are required', 400);
    }

    const pricing = await PricingAdminService.createBulkPricing({
      productId,
      tiers,
    });

    sendSuccess(res, pricing, 'Bulk pricing created successfully', 201);
  }),

  /**
   * UPDATE BULK PRICING
   */
  updateBulkPricing: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { tiers, isActive } = req.body;

    const pricing = await PricingAdminService.updateBulkPricing(id, {
      tiers,
      isActive,
    });

    sendSuccess(res, pricing, 'Bulk pricing updated successfully', 200);
  }),

  /**
   * DELETE BULK PRICING
   */
  deleteBulkPricing: catchAsync(async (req, res) => {
    const { id } = req.params;
    const pricing = await PricingAdminService.deleteBulkPricing(id);
    sendSuccess(res, pricing, 'Bulk pricing deleted successfully', 200);
  }),

  /**
   * CREATE TIER
   */
  createTier: catchAsync(async (req, res) => {
    const { name, discount, minSpend, benefits } = req.body;

    if (!name || discount === undefined) {
      return sendError(res, 'name and discount are required', 400);
    }

    const tier = await PricingAdminService.createTier({
      name,
      discount,
      minSpend: minSpend || 0,
      benefits: benefits || [],
    });

    sendSuccess(res, tier, 'Tier created successfully', 201);
  }),

  /**
   * UPDATE TIER
   */
  updateTier: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, discount, minSpend, benefits, isActive } = req.body;

    const tier = await PricingAdminService.updateTier(id, {
      name,
      discount,
      minSpend,
      benefits,
      isActive,
    });

    sendSuccess(res, tier, 'Tier updated successfully', 200);
  }),

  /**
   * DELETE TIER
   */
  deleteTier: catchAsync(async (req, res) => {
    const { id } = req.params;
    const tier = await PricingAdminService.deleteTier(id);
    sendSuccess(res, tier, 'Tier deleted successfully', 200);
  }),
};

module.exports = {
  PricingController,
  PricingAdminController,
};
