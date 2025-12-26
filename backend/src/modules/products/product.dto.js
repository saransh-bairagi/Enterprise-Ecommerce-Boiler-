// src/modules/products/product.dto.js
/**
 * DTO helpers: shapes of responses sent to API consumers.
 * Keep responses small, remove sensitive/internal fields.
 */

function variantDTO(variant) {
  return {
    id: variant._id || variant.id,
    sku: variant.sku,
    attributes: variant.attributes ? Object.fromEntries(variant.attributes) : {},
    price: variant.price,
    mrp: variant.mrp,
    stock: variant.stock,
    images: variant.images || [],
    active: variant.active,
  };
}

function productDTO(product) {
  if (!product) return null;
  return {
    id: product._id || product.id,
    publicId: product.publicId,
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    brand: product.brand,
    categories: product.categories,
    tags: product.tags,
    images: product.images || [],
    variants: (product.variants || []).map(variantDTO),
    rating: product.rating || 0,
    reviewsCount: product.reviewsCount || 0,
    featured: product.featured || false,
    published: product.published || false,
    visible: product.visible || true,
    meta: product.meta || {},
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

module.exports = { productDTO, variantDTO };
