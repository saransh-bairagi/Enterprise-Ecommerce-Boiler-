const mongoose = require('mongoose');

// ----------------------------------------------------------
// PAGE SCHEMA
// ----------------------------------------------------------

const pageSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: {
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
    content: {
      type: String,
      required: true,
    },
    excerpt: String,
    featuredImage: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: Date,
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      canonicalUrl: String,
    },
    sections: [
      {
        title: String,
        content: String,
        order: Number,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// BLOG POST SCHEMA
// ----------------------------------------------------------

const blogPostSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: {
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
    content: {
      type: String,
      required: true,
    },
    excerpt: String,
    featuredImage: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      default: 'uncategorized',
      index: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: Date,
    scheduledAt: Date,
    viewCount: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      canonicalUrl: String,
    },
    comments: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        text: String,
        createdAt: Date,
      },
    ],
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

pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ category: 1, status: 1 });

// ----------------------------------------------------------
// PRE-VALIDATE HOOKS
// ----------------------------------------------------------

[pageSchema, blogPostSchema].forEach((schema) => {
  schema.pre('validate', async function (next) {
    if (!this.publicId) {
      const { generatePrefixedUUID } = require('../../utils/uuid');
      this.publicId = generatePrefixedUUID('CMS');
    }

    if (!this.slug) {
      this.slug = this.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    }

    next();
  });
});

// ----------------------------------------------------------
// INSTANCE METHODS
// ----------------------------------------------------------

blogPostSchema.methods.publish = function () {
  this.status = 'published';
  this.publishedAt = new Date();
  return this;
};

blogPostSchema.methods.schedule = function (scheduledDate) {
  this.status = 'scheduled';
  this.scheduledAt = scheduledDate;
  return this;
};

blogPostSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this;
};

module.exports = {
  Page: mongoose.model('Page', pageSchema),
  BlogPost: mongoose.model('BlogPost', blogPostSchema),
};
