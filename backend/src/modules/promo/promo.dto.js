/**
 * Promo DTO
 */

function promoDTO(promo) {
  if (!promo) return null;

  return {
    id: promo._id || promo.id,
    publicId: promo.publicId,
    name: promo.name,
    description: promo.description,
    type: promo.type,
    imageUrl: promo.imageUrl,
    actionUrl: promo.actionUrl,
    position: promo.position,
    targetProducts: promo.targetProducts,
    targetCategories: promo.targetCategories,
    startDate: promo.startDate,
    endDate: promo.endDate,
    isActive: promo.isActive,
    clicks: promo.clicks,
    impressions: promo.impressions,
    createdAt: promo.createdAt,
    updatedAt: promo.updatedAt,
  };
}

function promosDTO(promos = []) {
  return promos.map(promoDTO);
}

module.exports = {
  promoDTO,
  promosDTO,
};
