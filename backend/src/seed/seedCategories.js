/**
 * Seed script for Catalog Categories
 * Usage: node backend/src/seed/seedCategories.js
 */
const mongoose = require('mongoose');
const Category = require('../modules/catalog/catalog.model');
const { generatePrefixedUUID } = require('../utils/uuid');

const categories = [
  {
    publicId: generatePrefixedUUID('CAT'),
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic items',
    image: '',
    parentId: null,
    level: 1,
    order: 1,
    seo: {},
    isActive: true,
  },
  {
    publicId: generatePrefixedUUID('CAT'),
    name: 'Apparel',
    slug: 'apparel',
    description: 'Clothing and accessories',
    image: '',
    parentId: null,
    level: 1,
    order: 2,
    seo: {},
    isActive: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log('Categories seeded successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
