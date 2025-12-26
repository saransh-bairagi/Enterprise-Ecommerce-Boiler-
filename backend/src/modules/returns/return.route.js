const router = require('express').Router();

const { ReturnController, ReturnAdminController } = require('./return.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get user's returns
router.get('/user', auth, ReturnController.getUserReturns);

// Get returns for an order
router.get('/order/:orderId', auth, ReturnController.getOrderReturns);

// Initiate return for order
router.post('/order/:orderId/initiate', auth, ReturnController.initiateReturn);

// Get return details
router.get('/:returnNumber', ReturnController.getReturn);

// List returns
router.get('/', ReturnController.list);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE RETURN
 */
router.post('/admin', auth, rbac('admin'), ReturnAdminController.create);

/**
 * UPDATE RETURN
 */
router.put('/admin/:id', auth, rbac('admin'), ReturnAdminController.update);

/**
 * UPDATE RETURN STATUS
 */
router.patch(
  '/admin/:id/status',
  auth,
  rbac('admin'),
  ReturnAdminController.updateStatus
);

/**
 * APPROVE RETURN
 */
router.patch(
  '/admin/:id/approve',
  auth,
  rbac('admin'),
  ReturnAdminController.approve
);

/**
 * REJECT RETURN
 */
router.patch(
  '/admin/:id/reject',
  auth,
  rbac('admin'),
  ReturnAdminController.reject
);

/**
 * PROCESS REFUND
 */
router.post(
  '/admin/:id/refund',
  auth,
  rbac('admin'),
  ReturnAdminController.processRefund
);

/**
 * DELETE RETURN (Soft Delete)
 */
router.delete('/admin/:id', auth, rbac('admin'), ReturnAdminController.delete);

/**
 * RESTORE RETURN
 */
router.patch(
  '/admin/:id/restore',
  auth,
  rbac('admin'),
  ReturnAdminController.restore
);

/**
 * LIST RETURNS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), ReturnAdminController.list);

/**
 * GET PENDING RETURNS
 */
router.get(
  '/admin/pending',
  auth,
  rbac('admin'),
  ReturnAdminController.getPending
);

module.exports = router;
