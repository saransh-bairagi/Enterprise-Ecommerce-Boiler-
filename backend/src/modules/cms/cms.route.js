const router = require('express').Router();

const { CMSController, CMSAdminController } = require('./cms.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES (NO AUTH)
// ----------------------------------------------------------

/**
 * GET PAGE BY SLUG
 */
router.get('/page/:slug', CMSController.getPageBySlug);

/**
 * LIST PAGES
 */
router.get('/pages', CMSController.listPages);

/**
 * GET BLOG POST BY SLUG
 */
router.get('/blog/:slug', CMSController.getBlogPostBySlug);

/**
 * LIST BLOG POSTS
 */
router.get('/blog', CMSController.listBlogPosts);

/**
 * GET BLOG CATEGORIES
 */
router.get('/blog/categories', CMSController.getCategories);

/**
 * GET BLOG TAGS
 */
router.get('/blog/tags', CMSController.getTags);

/**
 * SEARCH BLOG POSTS
 */
router.get('/blog/search', CMSController.searchBlogPosts);

// ----------------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------------

/**
 * CREATE PAGE
 */
router.post('/admin/page', auth, rbac('admin'), CMSAdminController.createPage);

/**
 * UPDATE PAGE
 */
router.patch(
  '/admin/page/:id',
  auth,
  rbac('admin'),
  CMSAdminController.updatePage
);

/**
 * DELETE PAGE
 */
router.delete(
  '/admin/page/:id',
  auth,
  rbac('admin'),
  CMSAdminController.deletePage
);

/**
 * CREATE BLOG POST
 */
router.post(
  '/admin/blog',
  auth,
  rbac('admin'),
  CMSAdminController.createBlogPost
);

/**
 * UPDATE BLOG POST
 */
router.patch(
  '/admin/blog/:id',
  auth,
  rbac('admin'),
  CMSAdminController.updateBlogPost
);

/**
 * DELETE BLOG POST
 */
router.delete(
  '/admin/blog/:id',
  auth,
  rbac('admin'),
  CMSAdminController.deleteBlogPost
);

/**
 * PUBLISH BLOG POST
 */
router.post(
  '/admin/blog/:id/publish',
  auth,
  rbac('admin'),
  CMSAdminController.publishBlogPost
);

/**
 * SCHEDULE BLOG POST
 */
router.post(
  '/admin/blog/:id/schedule',
  auth,
  rbac('admin'),
  CMSAdminController.scheduleBlogPost
);

/**
 * ADD COMMENT
 */
router.post(
  '/admin/blog/:id/comment',
  auth,
  CMSAdminController.addComment
);

module.exports = router;
