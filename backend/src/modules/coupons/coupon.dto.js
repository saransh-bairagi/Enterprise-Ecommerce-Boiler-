/**
 * DTO helpers for Coupon responses.
 */

function couponDTO(coupon) {
  if (!coupon) return null;

  return {
    id: coupon._id || coupon.id,
    publicId: coupon.publicId,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
    minOrderValue: coupon.minOrderValue,
    usageCount: coupon.usageCount,
    maxUsagePerCoupon: coupon.maxUsagePerCoupon,
    maxUsagePerUser: coupon.maxUsagePerUser,
    startDate: coupon.startDate,
    endDate: coupon.endDate,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
}

function couponsDTO(coupons = []) {
  return coupons.map(couponDTO);
}

module.exports = {
  couponDTO,
  couponsDTO,
};
