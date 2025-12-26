const { catchAsync } = require('../../core/catchAsync');
const { sendSuccess, sendError } = require('../../core/response');
const { CMSService, CMSAdminService } = require('./cms.service');

/**
 * CMS CONTROLLER
 * Handles CMS HTTP requests (Pages & Blog)
 */

// ----------------------------------------------------------
// USER CONTROLLER (PUBLIC)
// ----------------------------------------------------------

const CMSController = {
  /**
   * GET PAGE BY SLUG
   */
  getPageBySlug: catchAsync(async (req, res) => {
    const { slug } = req.params;
    const page = await CMSService.getPageBySlug(slug);
    sendSuccess(res, page, 'Page retrieved successfully', 200);
  }),

  /**
   * LIST PAGES
   */
  listPages: catchAsync(async (req, res) => {
    const { page = 1, limit = 20, status = 'published' } = req.query;
    const pages = await CMSService.listPages({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
    sendSuccess(res, pages, 'Pages retrieved successfully', 200);
  }),

  /**
   * GET BLOG POST BY SLUG
   */
  getBlogPostBySlug: catchAsync(async (req, res) => {
    const { slug } = req.params;
    const post = await CMSService.getBlogPostBySlug(slug);
    sendSuccess(res, post, 'Blog post retrieved successfully', 200);
  }),

  /**
   * LIST BLOG POSTS
   */
  listBlogPosts: catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      category,
      tag,
      status = 'published',
    } = req.query;

    const posts = await CMSService.listBlogPosts({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      tag,
      status,
    });

    sendSuccess(res, posts, 'Blog posts retrieved successfully', 200);
  }),

  /**
   * GET BLOG CATEGORIES
   */
  getCategories: catchAsync(async (req, res) => {
    const categories = await CMSService.getCategories();
    sendSuccess(res, categories, 'Categories retrieved successfully', 200);
  }),

  /**
   * GET BLOG TAGS
   */
  getTags: catchAsync(async (req, res) => {
    const tags = await CMSService.getTags();
    sendSuccess(res, tags, 'Tags retrieved successfully', 200);
  }),

  /**
   * SEARCH BLOG POSTS
   */
  searchBlogPosts: catchAsync(async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return sendError(res, 'Search query (q) is required', 400);
    }

    const posts = await CMSService.searchBlogPosts(q, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    sendSuccess(res, posts, 'Search results retrieved successfully', 200);
  }),
};

// ----------------------------------------------------------
// ADMIN CONTROLLER
// ----------------------------------------------------------

const CMSAdminController = {
  /**
   * CREATE PAGE
   */
  createPage: catchAsync(async (req, res) => {
    const { title, content, excerpt, featuredImage, status, seo, sections } =
      req.body;

    if (!title || !content) {
      return sendError(res, 'Title and content are required', 400);
    }

    const page = await CMSAdminService.createPage({
      title,
      content,
      excerpt,
      featuredImage,
      status: status || 'draft',
      seo,
      sections,
    });

    sendSuccess(res, page, 'Page created successfully', 201);
  }),

  /**
   * UPDATE PAGE
   */
  updatePage: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, content, excerpt, featuredImage, status, seo, sections } =
      req.body;

    const page = await CMSAdminService.updatePage(id, {
      title,
      content,
      excerpt,
      featuredImage,
      status,
      seo,
      sections,
    });

    sendSuccess(res, page, 'Page updated successfully', 200);
  }),

  /**
   * DELETE PAGE
   */
  deletePage: catchAsync(async (req, res) => {
    const { id } = req.params;
    const page = await CMSAdminService.deletePage(id);
    sendSuccess(res, page, 'Page deleted successfully', 200);
  }),

  /**
   * CREATE BLOG POST
   */
  createBlogPost: catchAsync(async (req, res) => {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      status,
      seo,
    } = req.body;

    if (!title || !content) {
      return sendError(res, 'Title and content are required', 400);
    }

    const post = await CMSAdminService.createBlogPost({
      title,
      content,
      excerpt,
      featuredImage,
      author: req.user.id,
      category: category || 'uncategorized',
      tags: tags || [],
      status: status || 'draft',
      seo,
    });

    sendSuccess(res, post, 'Blog post created successfully', 201);
  }),

  /**
   * UPDATE BLOG POST
   */
  updateBlogPost: catchAsync(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      status,
      seo,
    } = req.body;

    const post = await CMSAdminService.updateBlogPost(id, {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      status,
      seo,
    });

    sendSuccess(res, post, 'Blog post updated successfully', 200);
  }),

  /**
   * DELETE BLOG POST
   */
  deleteBlogPost: catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await CMSAdminService.deleteBlogPost(id);
    sendSuccess(res, post, 'Blog post deleted successfully', 200);
  }),

  /**
   * PUBLISH BLOG POST
   */
  publishBlogPost: catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await CMSAdminService.publishBlogPost(id);
    sendSuccess(res, post, 'Blog post published successfully', 200);
  }),

  /**
   * SCHEDULE BLOG POST
   */
  scheduleBlogPost: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return sendError(res, 'Scheduled date is required', 400);
    }

    const post = await CMSAdminService.scheduleBlogPost(id, scheduledAt);
    sendSuccess(res, post, 'Blog post scheduled successfully', 200);
  }),

  /**
   * ADD COMMENT
   */
  addComment: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return sendError(res, 'Comment text is required', 400);
    }

    const post = await CMSAdminService.addComment(id, req.user.id, text);
    sendSuccess(res, post, 'Comment added successfully', 201);
  }),
};

module.exports = {
  CMSController,
  CMSAdminController,
};
