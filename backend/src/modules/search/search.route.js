const router = require('express').Router();

const { SearchController } = require('./search.controller');
const { auth } = require('../../common middlewares/auth');

// ----------------------------------------------------------
// PUBLIC ROUTES (NO AUTH REQUIRED)
// ----------------------------------------------------------

/**
 * SEARCH PRODUCTS
 * GET /search?q=query&category=&minPrice=&maxPrice=&inStock=true&rating=4
 */
router.get('/', SearchController.search);

/**
 * ADVANCED SEARCH WITH FACETS
 * GET /search/advanced?q=query&facets=categories,brands,ratings
 */
router.get('/advanced', SearchController.advancedSearch);

/**
 * GET SEARCH SUGGESTIONS
 * GET /search/suggestions?q=que
 */
router.get('/suggestions', SearchController.getSuggestions);

/**
 * GET TRENDING SEARCHES
 * GET /search/trending?limit=10
 */
router.get('/trending', SearchController.getTrendingSearches);

module.exports = router;
