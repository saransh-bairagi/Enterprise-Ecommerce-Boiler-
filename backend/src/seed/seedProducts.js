/**
 * Seed script for Products collection
 * Usage: node backend/src/seed/seedProducts.js
 */
const mongoose = require('mongoose');
const Product = require('../modules/products/product.model');
const { generatePrefixedUUID } = require('../utils/uuid');

const products = [
  {
    publicId: generatePrefixedUUID('PROD'),
    title: 'Sample Product 1',
    slug: 'sample-product-1',
    shortDescription: 'A sample product',
    description: 'This is a sample product for seeding.',
    brand: 'BrandA',
    categories: [],
    tags: ['sample', 'test'],
    images: [],
    variants: [],
    price: 100,
    mrp: 120,
    stock: 50,
    featured: false,
    published: true,
    visible: true,
    meta: {},
  },
  {
    publicId: generatePrefixedUUID('PROD'),
    title: 'Sample Product 2',
    slug: 'sample-product-2',
    shortDescription: 'Another sample product',
    description: 'This is another sample product for seeding.',
    brand: 'BrandB',
    categories: [],
    tags: ['sample', 'seed'],
    images: [],
    variants: [],
    price: 200,
    mrp: 220,
    stock: 30,
    featured: true,
    published: true,
    visible: true,
    meta: {},
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Products seeded successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
