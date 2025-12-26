const { Page, BlogPost } = require('./cms.model');

/**
 * CMS DAO
 * Handles all CMS queries
 */

const CMSDAO = {
  /**
   * PAGE QUERIES
   */

  async findPageById(id) {
    return Page.findOne({
      publicId: id,
      isDeleted: false,
    })
      .populate('author', 'name email')
      .lean();
  },

  async findPageBySlug(slug) {
    return Page.findOne({
      slug,
      status: 'published',
      isDeleted: false,
    })
      .populate('author', 'name email')
      .lean();
  },

  async listPages(options = {}) {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (status) filter.status = status;

    const total = await Page.countDocuments(filter);

    const items = await Page.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * BLOG POST QUERIES
   */

  async findBlogPostById(id) {
    return BlogPost.findOne({
      publicId: id,
      isDeleted: false,
    })
      .populate('author', 'name email')
      .lean();
  },

  async findBlogPostBySlug(slug) {
    return BlogPost.findOne({
      slug,
      status: 'published',
      isDeleted: false,
    })
      .populate('author', 'name email')
      .lean();
  },

  async listBlogPosts(options = {}) {
    const { page = 1, limit = 20, status = 'published', category, tag } =
      options;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const total = await BlogPost.countDocuments(filter);

    const items = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async listBlogPostsByAuthor(authorId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const total = await BlogPost.countDocuments({
      author: authorId,
      isDeleted: false,
    });

    const items = await BlogPost.find({
      author: authorId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async searchBlogPosts(query, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const filter = {
      $text: { $search: query },
      isDeleted: false,
    };

    const total = await BlogPost.countDocuments(filter);

    const items = await BlogPost.find(filter)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async getCategories() {
    return BlogPost.distinct('category', { isDeleted: false });
  },

  async getTags() {
    return BlogPost.distinct('tags', { isDeleted: false });
  },
};

// ----------------------------------------------------------
// ADMIN DAO
// ----------------------------------------------------------

const CMSAdminDAO = {
  async createPage(data) {
    const page = new Page(data);
    return page.save();
  },

  async updatePage(id, data) {
    return Page.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async deletePage(id) {
    return Page.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  async createBlogPost(data) {
    const post = new BlogPost(data);
    return post.save();
  },

  async updateBlogPost(id, data) {
    return BlogPost.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async deleteBlogPost(id) {
    return BlogPost.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  async publishBlogPost(id) {
    return BlogPost.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      {
        $set: {
          status: 'published',
          publishedAt: new Date(),
        },
      },
      { new: true }
    );
  },

  async scheduleBlogPost(id, scheduledDate) {
    return BlogPost.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      {
        $set: {
          status: 'scheduled',
          scheduledAt: scheduledDate,
        },
      },
      { new: true }
    );
  },

  async addComment(blogPostId, userId, text) {
    return BlogPost.findOneAndUpdate(
      { publicId: blogPostId, isDeleted: false },
      {
        $push: {
          comments: {
            userId,
            text,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
  },

  async incrementViewCount(id) {
    return BlogPost.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  },
};

module.exports = {
  CMSDAO,
  CMSAdminDAO,
};
