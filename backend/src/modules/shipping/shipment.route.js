const router = require('express').Router();

const { ShipmentController, ShipmentAdminController } = require('./shipment.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------

// Track shipment by tracking number
router.get('/track/:trackingNumber', ShipmentController.track);

// Get shipment by order
router.get('/order/:orderId', ShipmentController.getByOrder);

// List shipments
router.get('/', ShipmentController.list);

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get user's shipments
router.get('/user/shipments', auth, ShipmentController.getUserShipments);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE SHIPMENT
 */
router.post('/admin', auth, rbac('admin'), ShipmentAdminController.create);

/**
 * UPDATE SHIPMENT
 */
router.put('/admin/:id', auth, rbac('admin'), ShipmentAdminController.update);

/**
 * UPDATE SHIPMENT STATUS
 */
router.patch(
  '/admin/:id/status',
  auth,
  rbac('admin'),
  ShipmentAdminController.updateStatus
);

/**
 * ADD TRACKING INFO
 */
router.patch(
  '/admin/:id/tracking',
  auth,
  rbac('admin'),
  ShipmentAdminController.addTracking
);

/**
 * DELETE SHIPMENT (Soft Delete)
 */
router.delete('/admin/:id', auth, rbac('admin'), ShipmentAdminController.delete);

/**
 * RESTORE SHIPMENT
 */
router.patch(
  '/admin/:id/restore',
  auth,
  rbac('admin'),
  ShipmentAdminController.restore
);

/**
 * LIST SHIPMENTS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), ShipmentAdminController.list);

// Mount Delhivery provider routes under /shipping/delhivery
router.use('/delhivery', require('./providers/delhivery/delhivery.route'));

module.exports = router;
