const { CMSDAO, CMSAdminDAO } = require('./cms.dao');
const {
  pageDTO,
  pageListDTO,
  blogPostDTO,
  blogPostDetailDTO,
  blogPostListDTO,
} = require('./cms.dto');
const AppError = require('../../core/appError');

/**
 * CMS SERVICE
 * Business logic for pages and blog posts
 */

const CMSService = {
  /**
   * GET PAGE
   */
  async getPage(id) {
    const page = await CMSDAO.findPageById(id);
    if (!page) {
      throw new AppError('Page not found', 404);
    }
    return pageDTO(page);
  },

  /**
   * GET PAGE BY SLUG (PUBLIC)
   */
  async getPageBySlug(slug) {
    const page = await CMSDAO.findPageBySlug(slug);
    if (!page) {
      throw new AppError('Page not found', 404);
    }
    return pageDTO(page);
  },

  /**
   * LIST PAGES
   */
  async listPages(options = {}) {
    const pages = await CMSDAO.listPages(options);
    return {
      ...pages,
      items: pageListDTO(pages.items),
    };
  },

  /**
   * GET BLOG POST
   */
  async getBlogPost(id) {
    const post = await CMSDAO.findBlogPostById(id);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }
    return blogPostDetailDTO(post);
  },

  /**
   * GET BLOG POST BY SLUG (PUBLIC)
   */
  async getBlogPostBySlug(slug) {
    const post = await CMSDAO.findBlogPostBySlug(slug);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Increment view count
    await CMSAdminDAO.incrementViewCount(post.publicId);

    return blogPostDetailDTO(post);
  },

  /**
   * LIST BLOG POSTS
   */
  async listBlogPosts(options = {}) {
    const posts = await CMSDAO.listBlogPosts(options);
    return {
      ...posts,
      items: blogPostListDTO(posts.items),
    };
  },

  /**
   * LIST BLOG POSTS BY AUTHOR
   */
  async listBlogPostsByAuthor(authorId, options = {}) {
    const posts = await CMSDAO.listBlogPostsByAuthor(authorId, options);
    return {
      ...posts,
      items: blogPostListDTO(posts.items),
    };
  },

  /**
   * SEARCH BLOG POSTS
   */
  async searchBlogPosts(query, options = {}) {
    const posts = await CMSDAO.searchBlogPosts(query, options);
    return {
      ...posts,
      items: blogPostListDTO(posts.items),
    };
  },

  /**
   * GET BLOG CATEGORIES
   */
  async getCategories() {
    return CMSDAO.getCategories();
  },

  /**
   * GET BLOG TAGS
   */
  async getTags() {
    return CMSDAO.getTags();
  },
};

// ----------------------------------------------------------
// ADMIN SERVICE
// ----------------------------------------------------------

const CMSAdminService = {
  /**
   * CREATE PAGE
   */
  async createPage(data) {
    const page = await CMSAdminDAO.createPage(data);
    return pageDTO(page);
  },

  /**
   * UPDATE PAGE
   */
  async updatePage(id, data) {
    const page = await CMSAdminDAO.updatePage(id, data);
    if (!page) {
      throw new AppError('Page not found', 404);
    }
    return pageDTO(page);
  },

  /**
   * DELETE PAGE
   */
  async deletePage(id) {
    const page = await CMSAdminDAO.deletePage(id);
    if (!page) {
      throw new AppError('Page not found', 404);
    }
    return pageDTO(page);
  },

  /**
   * CREATE BLOG POST
   */
  async createBlogPost(data) {
    const post = await CMSAdminDAO.createBlogPost(data);
    return blogPostDTO(post);
  },

  /**
   * UPDATE BLOG POST
   */
  async updateBlogPost(id, data) {
    const post = await CMSAdminDAO.updateBlogPost(id, data);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }
    return blogPostDTO(post);
  },

  /**
   * DELETE BLOG POST
   */
  async deleteBlogPost(id) {
    const post = await CMSAdminDAO.deleteBlogPost(id);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }
    return blogPostDTO(post);
  },

  /**
   * PUBLISH BLOG POST
   */
  async publishBlogPost(id) {
    const post = await CMSAdminDAO.publishBlogPost(id);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }
    return blogPostDTO(post);
  },

  /**
   * SCHEDULE BLOG POST
   */
  async scheduleBlogPost(id, scheduledDate) {
    const post = await CMSAdminDAO.scheduleBlogPost(id, scheduledDate);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }
    return blogPostDTO(post);
  },

  /**
   * ADD COMMENT TO POST
   */
  async addComment(postId, userId, text) {
    const post = await CMSAdminDAO.addComment(postId, userId, text);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }
    return blogPostDetailDTO(post);
  },
};

module.exports = {
  CMSService,
  CMSAdminService,
};
