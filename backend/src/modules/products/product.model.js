const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Subschemas ──────────────
const ImageSchema = new Schema({
  url: { type: String, required: true },
  key: { type: String },
  alt: { type: String },
  order: { type: Number, default: 0 },
}, { _id: false });

const VariantSchema = new Schema({
  sku: { type: String, required: true, index: true }, // Keep simple index
  attributes: { type: Map, of: String },
  price: { type: Number, required: true },
  mrp: { type: Number },
  cost: { type: Number },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  images: [ImageSchema],
  active: { type: Boolean, default: true },
}, { _id: true });

const ReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String },
  body: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

// ────────────── Main Product Schema ──────────────
const ProductSchema = new Schema({
  publicId: { type: String, unique: true }, // unique automatically creates index
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  shortDescription: { type: String },
  sku: { type: String }, // avoid index on a field duplicated in variants
  brand: { type: String },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }], // index on arrays can be tricky; usually index at schema level
  tags: [{ type: String }],
  attributes: { type: Map, of: String },
  variants: [VariantSchema],
  images: [ImageSchema],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  visible: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  meta: {
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
  }
}, { timestamps: true });

// ────────────── Text Search Index ──────────────
ProductSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text',
  brand: 'text'
}, {
  weights: {
    title: 10,
    shortDescription: 5,
    description: 2,
    brand: 4,
    tags: 3
  }
});

// ────────────── Pre-validate Hook ──────────────
ProductSchema.pre('validate', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }

  next();
});

// ────────────── Instance Methods ──────────────
ProductSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.visible = false;
  this.updatedBy = userId;
  return this.save();
};

module.exports = mongoose.model('Product', ProductSchema);
