const AppError = require('../../core/appError');

/**
 * SEARCH SERVICE
 * Handles product search and filtering
 */

const SearchService = {
  
  async searchProducts(query, filters = {}, options = {}) {
    if (!query || query.trim().length === 0) {
      throw new AppError('Search query cannot be empty', 400);
    }

    const { page = 1, limit = 20, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    // Elasticsearch integration
    const { Client } = require('@elastic/elasticsearch');
    const es = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
    let esResult;
    try {
      esResult = await es.search({
        index: 'products',
        from: skip,
        size: limit,
        body: {
          query: {
            multi_match: {
              query,
              fields: ['title^3', 'description', 'tags', 'brand', 'categories'],
              fuzziness: 'AUTO',
            },
          },
          sort: [
            { [sort.replace('-', '')]: { order: sort.startsWith('-') ? 'desc' : 'asc' } },
          ],
        },
      });
    } catch (e) {
      // fallback to empty result
      esResult = { hits: { hits: [], total: { value: 0 } } };
    }
    const items = esResult.hits.hits.map((hit) => hit._source);
    const total = esResult.hits.total.value;
    return {
      query,
      filters,
      page,
      limit,
      items,
      total,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * ADVANCED SEARCH WITH FACETS
   */
  async advancedSearch(query, filters = {}, options = {}) {
    if (!query || query.trim().length === 0) {
      throw new AppError('Search query cannot be empty', 400);
    }

    const {
      page = 1,
      limit = 20,
      sort = '-relevance',
      facets = [],
    } = options;

    // Build aggregation pipeline for faceted search
    const searchResults = await this.searchProducts(query, filters, {
      page,
      limit,
      sort,
    });

    // Get facet counts (categories, price ranges, ratings)
    const facetData = await this.getFacets(query, facets);

    return {
      ...searchResults,
      facets: facetData,
    };
  },

  /**
   * GET FACETS FOR SEARCH
   */
  async getFacets(query, requestedFacets = []) {
    const facets = {};

    // Default facets
    if (
      requestedFacets.length === 0 ||
      requestedFacets.includes('categories')
    ) {
      facets.categories = [
        // Would aggregate from DB
      ];
    }

    if (
      requestedFacets.length === 0 ||
      requestedFacets.includes('priceRange')
    ) {
      facets.priceRange = [
        { min: 0, max: 100, count: 0 },
        { min: 100, max: 500, count: 0 },
        { min: 500, max: 1000, count: 0 },
        { min: 1000, max: Infinity, count: 0 },
      ];
    }

    if (requestedFacets.length === 0 || requestedFacets.includes('brands')) {
      facets.brands = [];
    }

    if (requestedFacets.length === 0 || requestedFacets.includes('ratings')) {
      facets.ratings = [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ];
    }

    return facets;
  },

  /**
   * SEARCH SUGGESTIONS/AUTOCOMPLETE
   */
  async getSearchSuggestions(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }
    // Redis caching for suggestions
    const redis = require('../../utils/redis');
    const cacheKey = `search:suggest:${query}`;
    let suggestions = await redis.get(cacheKey);
    if (suggestions) {
      return JSON.parse(suggestions);
    }
    // Fallback: get from Elasticsearch
    const { Client } = require('@elastic/elasticsearch');
    const es = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
    let esResult;
    try {
      esResult = await es.search({
        index: 'products',
        size: limit,
        body: {
          suggest: {
            product_suggest: {
              prefix: query,
              completion: {
                field: 'title',
                fuzzy: { fuzziness: 2 },
                size: limit,
              },
            },
          },
        },
      });
      suggestions = (esResult.suggest.product_suggest[0].options || []).map(opt => opt.text);
    } catch (e) {
      suggestions = [];
    }
    await redis.set(cacheKey, JSON.stringify(suggestions), 'EX', 60 * 10); // cache 10 min
    return suggestions;
  },

  /**
   * SEARCH HISTORY
   */
  async saveSearchQuery(userId, query) {
    if (!query || query.trim().length === 0) {
      return;
    }
    // Save search query to analytics collection
    const mongoose = require('mongoose');
    const SearchAnalytics = mongoose.models.SearchAnalytics || mongoose.model('SearchAnalytics', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      query: String,
      createdAt: { type: Date, default: Date.now },
    }));
    await SearchAnalytics.create({ userId, query });
  },

  /**
   * GET TRENDING SEARCHES
   */
  async getTrendingSearches(limit = 10) {
    // Aggregate trending searches from analytics
    const mongoose = require('mongoose');
    const SearchAnalytics = mongoose.models.SearchAnalytics || mongoose.model('SearchAnalytics', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      query: String,
      createdAt: { type: Date, default: Date.now },
    }));
    const trending = await SearchAnalytics.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
    return trending.map(t => t._id);
  },
};

module.exports = {
  SearchService,
};
