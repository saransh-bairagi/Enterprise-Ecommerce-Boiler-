// backend/src/jobs/promoExpiration.job.js
const logger = require('../config/logger');
const { expirePromotions } = require('../modules/promo/promo.service');

/**
 * Promo/Coupon Expiration Job
 * Expires promotions/coupons every day at midnight
 */
async function processPromoExpirationJob() {
  try {
    logger.info('[PromoExpirationJob] Expiring promotions/coupons...');
    const result = await expirePromotions();
    logger.info(`[PromoExpirationJob] ✅ Expired: ${result.count || 0}`);
    return result;
  } catch (error) {
    logger.error('[PromoExpirationJob] Promo expiration failed:', error);
    throw error;
  }
}

module.exports = { processPromoExpirationJob };
