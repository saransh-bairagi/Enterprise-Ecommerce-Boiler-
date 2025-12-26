const mongoose = require('mongoose');

// ----------------------------------------------------------
// CATEGORY SCHEMA
// ----------------------------------------------------------

const categorySchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// ATTRIBUTE SCHEMA
// ----------------------------------------------------------

const attributeSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['text', 'select', 'multiselect', 'boolean', 'range'],
      default: 'text',
    },
    values: [
      {
        value: String,
        label: String,
      },
    ],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    isFilterable: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// INDEXES
// ----------------------------------------------------------

categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1, isActive: 1 });
attributeSchema.index({ categoryId: 1, isRequired: 1 });

// ----------------------------------------------------------
// PRE-VALIDATE HOOKS
// ----------------------------------------------------------

categorySchema.pre('validate', async function (next) {
  if (!this.publicId) {
    const { generatePrefixedUUID } = require('../../utils/uuid');
    this.publicId = generatePrefixedUUID('CAT');
  }

  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  next();
});

attributeSchema.pre('validate', async function (next) {
  if (!this.publicId) {
    const { generatePrefixedUUID } = require('../../utils/uuid');
    this.publicId = generatePrefixedUUID('ATTR');
  }

  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  next();
});

module.exports = {
  Category: mongoose.model('Category', categorySchema),
  Attribute: mongoose.model('Attribute', attributeSchema),
};
