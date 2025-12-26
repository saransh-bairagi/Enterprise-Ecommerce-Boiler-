const router = require('express').Router();

const { PricingController, PricingAdminController } = require('./pricing.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES (NO AUTH)
// ----------------------------------------------------------

/**
 * CALCULATE PRICE
 */
router.post('/calculate', PricingController.calculatePrice);

/**
 * GET BULK PRICING TIERS
 */
router.get('/bulk/:productId', PricingController.getBulkTiers);

/**
 * APPLY BULK DISCOUNT
 */
router.post('/bulk/discount', PricingController.applyBulkDiscount);

/**
 * LIST TIERS
 */
router.get('/tiers', PricingController.listTiers);

/**
 * GET CUSTOMER TIER
 */
router.get('/customer-tier', PricingController.getCustomerTier);

// ----------------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------------

/**
 * CREATE PRICING RULE
 */
router.post('/admin/rule', auth, rbac('admin'), PricingAdminController.createRule);

/**
 * UPDATE PRICING RULE
 */
router.patch(
  '/admin/rule/:id',
  auth,
  rbac('admin'),
  PricingAdminController.updateRule
);

/**
 * DELETE PRICING RULE
 */
router.delete(
  '/admin/rule/:id',
  auth,
  rbac('admin'),
  PricingAdminController.deleteRule
);

/**
 * LIST PRICING RULES
 */
router.get('/admin/rules', auth, rbac('admin'), PricingAdminController.listRules);

/**
 * CREATE BULK PRICING
 */
router.post(
  '/admin/bulk',
  auth,
  rbac('admin'),
  PricingAdminController.createBulkPricing
);

/**
 * UPDATE BULK PRICING
 */
router.patch(
  '/admin/bulk/:id',
  auth,
  rbac('admin'),
  PricingAdminController.updateBulkPricing
);

/**
 * DELETE BULK PRICING
 */
router.delete(
  '/admin/bulk/:id',
  auth,
  rbac('admin'),
  PricingAdminController.deleteBulkPricing
);

/**
 * CREATE TIER
 */
router.post('/admin/tier', auth, rbac('admin'), PricingAdminController.createTier);

/**
 * UPDATE TIER
 */
router.patch(
  '/admin/tier/:id',
  auth,
  rbac('admin'),
  PricingAdminController.updateTier
);

/**
 * DELETE TIER
 */
router.delete(
  '/admin/tier/:id',
  auth,
  rbac('admin'),
  PricingAdminController.deleteTier
);

module.exports = router;
