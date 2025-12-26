/**
 * CATALOG DTO
 * Data Transfer Objects for catalog responses
 */

const categoryDTO = (category) => {
  if (!category) return null;

  return {
    id: category.publicId,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    level: category.level,
    order: category.order,
    seo: category.seo || {},
    isActive: category.isActive,
    createdAt: category.createdAt,
  };
};

const categoryListDTO = (categories) => {
  return categories.map(categoryDTO);
};

const attributeDTO = (attribute) => {
  if (!attribute) return null;

  return {
    id: attribute.publicId,
    name: attribute.name,
    slug: attribute.slug,
    type: attribute.type,
    values: attribute.values || [],
    categoryId: attribute.categoryId,
    isRequired: attribute.isRequired,
    isFilterable: attribute.isFilterable,
    order: attribute.order,
    createdAt: attribute.createdAt,
  };
};

const attributeListDTO = (attributes) => {
  return attributes.map(attributeDTO);
};

const catalogDTO = (category, attributes = []) => {
  return {
    category: categoryDTO(category),
    attributes: attributeListDTO(attributes),
  };
};

module.exports = {
  categoryDTO,
  categoryListDTO,
  attributeDTO,
  attributeListDTO,
  catalogDTO,
};
