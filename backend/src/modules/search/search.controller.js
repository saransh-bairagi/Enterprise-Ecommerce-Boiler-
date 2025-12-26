const catchAsync = require('../../core/catchAsync');
const { sendSuccess, sendError } = require('../../core/response');
const { SearchService } = require('./search.service');

/**
 * SEARCH CONTROLLER
 * Handles search-related HTTP requests
 */

const SearchController = {
  /**
   * SEARCH PRODUCTS
   * GET /search?q=query&category=&minPrice=&maxPrice=&sort=
   */
  search: catchAsync(async (req, res) => {
    const { q, category, minPrice, maxPrice, inStock, rating, page, limit, sort } =
      req.query;

    if (!q) {
      return sendError(res, 'Search query (q) is required', 400);
    }

    const filters = {};
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (inStock !== undefined) filters.inStock = inStock === 'true';
    if (rating) filters.rating = parseFloat(rating);

    const results = await SearchService.searchProducts(q, filters, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || '-createdAt',
    });

    // Save search query for analytics
    if (req.user) {
      await SearchService.saveSearchQuery(req.user.id, q);
    }

    sendSuccess(res, results, 'Search results retrieved successfully', 200);
  }),

  /**
   * ADVANCED SEARCH WITH FACETS
   * GET /search/advanced?q=query&category=&facets=categories,brands,ratings
   */
  advancedSearch: catchAsync(async (req, res) => {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      rating,
      page,
      limit,
      sort,
      facets,
    } = req.query;

    if (!q) {
      return sendError(res, 'Search query (q) is required', 400);
    }

    const filters = {};
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (inStock !== undefined) filters.inStock = inStock === 'true';
    if (rating) filters.rating = parseFloat(rating);

    const requestedFacets = facets ? facets.split(',') : [];

    const results = await SearchService.advancedSearch(q, filters, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || '-relevance',
      facets: requestedFacets,
    });

    sendSuccess(
      res,
      results,
      'Advanced search results retrieved successfully',
      200
    );
  }),

  /**
   * GET SEARCH SUGGESTIONS
   * GET /search/suggestions?q=query
   */
  getSuggestions: catchAsync(async (req, res) => {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return sendSuccess(res, [], 'No suggestions for short query', 200);
    }

    const suggestions = await SearchService.getSearchSuggestions(
      q,
      parseInt(limit)
    );

    sendSuccess(res, suggestions, 'Search suggestions retrieved successfully', 200);
  }),

  /**
   * GET TRENDING SEARCHES
   * GET /search/trending
   */
  getTrendingSearches: catchAsync(async (req, res) => {
    const { limit = 10 } = req.query;

    const trending = await SearchService.getTrendingSearches(parseInt(limit));

    sendSuccess(res, trending, 'Trending searches retrieved successfully', 200);
  }),
};

module.exports = {
  SearchController,
};
