const router = require('express').Router();

const { StockController, StockAdminController } = require('./stock.controller');
const { auth } = require('../../../common middlewares/auth');
const { rbac } = require('../../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------

// Get stock by SKU
router.get('/:sku', StockController.getStock);

// Check availability
router.post('/check-availability', StockController.checkAvailability);

// List low stock items
router.get('/low-stock/items', StockController.listLowStockItems);

// List stocks
router.get('/', StockController.list);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE STOCK
 */
router.post('/admin', auth, rbac('admin'), StockAdminController.create);

/**
 * UPDATE STOCK
 */
router.put('/admin/:id', auth, rbac('admin'), StockAdminController.update);

/**
 * ADJUST STOCK
 */
router.patch(
  '/admin/adjust',
  auth,
  rbac('admin'),
  StockAdminController.adjustStock
);

/**
 * RESERVE STOCK
 */
router.patch(
  '/admin/reserve',
  auth,
  rbac('admin'),
  StockAdminController.reserve
);

/**
 * UNRESERVE STOCK
 */
router.patch(
  '/admin/unreserve',
  auth,
  rbac('admin'),
  StockAdminController.unreserve
);

/**
 * DELETE STOCK (Soft Delete)
 */
router.delete('/admin/:id', auth, rbac('admin'), StockAdminController.delete);

/**
 * RESTORE STOCK
 */
router.patch(
  '/admin/:id/restore',
  auth,
  rbac('admin'),
  StockAdminController.restore
);

/**
 * LIST STOCKS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), StockAdminController.list);

module.exports = router;
