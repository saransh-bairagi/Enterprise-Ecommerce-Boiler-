const router = require('express').Router();

const { AuthController, AuthAdminController } = require('./auth.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// USER ROUTES (LOGGED-IN)
// ----------------------------------------------------------

/**
 * GET OAUTH CONNECTIONS
 */
router.get('/oauth/connections', auth, AuthController.getOAuthConnections);

/**
 * DISCONNECT OAUTH PROVIDER
 */
router.delete(
  '/oauth/:provider/disconnect',
  auth,
  AuthController.disconnectOAuth
);

/**
 * GET USER SESSIONS
 */
router.get('/sessions', auth, AuthController.getUserSessions);

/**
 * REVOKE SESSION
 */
router.post(
  '/sessions/:sessionId/revoke',
  auth,
  AuthController.revokeSession
);

/**
 * REVOKE ALL SESSIONS
 */
router.post('/sessions/revoke/all', auth, AuthController.revokeAllSessions);

/**
 * GET MFA STATUS
 */
router.get('/mfa/status', auth, AuthController.getMFAStatus);

/**
 * VALIDATE MFA TOKEN
 */
router.post('/mfa/validate', auth, AuthController.validateMFAToken);

/**
 * VALIDATE BACKUP CODE (USER)
 */
router.post('/mfa/backup/validate', auth, AuthController.validateBackupCode);

/**
 * REGENERATE BACKUP CODES (ADMIN)
 */
router.post('/admin/:userId/mfa/backup/regenerate', auth, rbac('admin'), AuthAdminController.regenerateBackupCodes);
// ----------------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------------

/**
 * ENABLE MFA FOR USER
 */
router.post(
  '/admin/:userId/mfa/enable',
  auth,
  rbac('admin'),
  AuthAdminController.enableMFA
);

/**
 * DISABLE MFA FOR USER
 */
router.post(
  '/admin/:userId/mfa/disable',
  auth,
  rbac('admin'),
  AuthAdminController.disableMFA
);

/**
 * GENERATE MFA SECRET
 */
router.post(
  '/admin/:userId/mfa/secret',
  auth,
  rbac('admin'),
  AuthAdminController.generateMFASecret
);

/**
 * REVOKE USER SESSION
 */
router.post(
  '/admin/sessions/:sessionId/revoke',
  auth,
  rbac('admin'),
  AuthAdminController.revokeUserSession
);

/**
 * REVOKE ALL USER SESSIONS
 */
router.post(
  '/admin/:userId/sessions/revoke-all',
  auth,
  rbac('admin'),
  AuthAdminController.revokeAllUserSessions
);

// ----------------------------------------------------------
// OAUTH CALLBACK ROUTES
// ----------------------------------------------------------


/**
 * GOOGLE OAUTH CALLBACK
 * Handles Google OAuth login/registration
 */
router.get('/oauth/google/callback', require('../../common middlewares/auth').optional, require('./googleOAuth.middleware'), require('./auth.controller').AuthController.googleOAuthCallback);

 
module.exports = router;
