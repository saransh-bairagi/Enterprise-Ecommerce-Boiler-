const router = require('express').Router();

const { OrderController, OrderAdminController } = require('./order.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');
const OrderMiddleware = require('./order.middleware');

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get user's orders
router.get('/', auth, OrderController.getUserOrders);

// Get order by publicId
router.get('/:publicId', auth, OrderController.getOrder);

// Get order by orderNumber
router.get('/track/:orderNumber', OrderController.getOrderByNumber);

// Track order (public)
router.get('/tracking/:orderNumber', OrderController.trackOrder);

// ----------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------

// List orders (public)
router.get('/public/list', OrderController.list);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE ORDER
 */
router.post(
  '/admin',
  auth,
  rbac('admin'),
  OrderMiddleware.validateCreate,
  OrderAdminController.create
);

/**
 * UPDATE ORDER
 */
router.put(
  '/admin/:publicId',
  auth,
  rbac('admin'),
  OrderMiddleware.validateUpdate,
  OrderAdminController.update
);

/**
 * UPDATE ORDER STATUS
 */
router.patch(
  '/admin/:publicId/status',
  auth,
  rbac('admin'),
  OrderAdminController.updateStatus
);

/**
 * ADD TRACKING INFO
 */
router.patch(
  '/admin/:publicId/tracking',
  auth,
  rbac('admin'),
  OrderAdminController.addTracking
);

/**
 * UPDATE PAYMENT INFO
 */
router.patch(
  '/admin/:publicId/payment',
  auth,
  rbac('admin'),
  OrderAdminController.updatePayment
);

/**
 * DELETE ORDER (Soft Delete)
 */
router.delete('/admin/:publicId', auth, rbac('admin'), OrderAdminController.delete);

/**
 * RESTORE ORDER
 */
router.patch(
  '/admin/:publicId/restore',
  auth,
  rbac('admin'),
  OrderAdminController.restore
);

/**
 * LIST ORDERS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), OrderAdminController.list);

/**
 * GET ORDERS BY STATUS
 */
router.get(
  '/admin/status/:status',
  auth,
  rbac('admin'),
  OrderAdminController.getByStatus
);

/**
 * BULK UPDATE STATUS
 */
router.patch(
  '/admin/bulk/status',
  auth,
  rbac('admin'),
  OrderAdminController.bulkUpdateStatus
);

module.exports = router;
