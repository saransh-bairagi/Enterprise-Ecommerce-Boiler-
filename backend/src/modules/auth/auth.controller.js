
const catchAsync = require('../../core/catchAsync');
const { sendSuccess, sendError } = require('../../core/response');
const { AuthService, AuthAdminService } = require('./auth.service');

/**
 * AUTH CONTROLLER
 * Handles auth HTTP requests (OAuth, sessions, MFA)
 */

// ----------------------------------------------------------
// USER CONTROLLER
// ----------------------------------------------------------

const AuthController = {
  /**
   * GET OAUTH CONNECTIONS
   */
  getOAuthConnections: catchAsync(async (req, res) => {
    const connections = await AuthService.getUserOAuthConnections(req.user.id);
    sendSuccess(
      res,
      connections,
      'OAuth connections retrieved successfully',
      200
    );
  }),

  /**
   * DISCONNECT OAUTH PROVIDER
   */
  disconnectOAuth: catchAsync(async (req, res) => {
    const { provider } = req.params;

    const result = await AuthService.disconnectOAuthProvider(
      req.user.id,
      provider
    );

    sendSuccess(
      res,
      result,
      `${provider} disconnected successfully`,
      200
    );
  }),

  /**
   * GET USER SESSIONS
   */
  getUserSessions: catchAsync(async (req, res) => {
    const sessions = await AuthService.getUserSessions(req.user.id);
    sendSuccess(res, sessions, 'Sessions retrieved successfully', 200);
  }),

  /**
   * REVOKE SESSION
   */
  revokeSession: catchAsync(async (req, res) => {
    const { sessionId } = req.params;
    const result = await AuthService.revokeSession(sessionId);
    sendSuccess(res, result, 'Session revoked successfully', 200);
  }),

  /**
   * REVOKE ALL SESSIONS
   */
  revokeAllSessions: catchAsync(async (req, res) => {
    const result = await AuthService.revokeAllUserSessions(req.user.id);
    sendSuccess(res, result, result.message, 200);
  }),

  /**
   * GET MFA STATUS
   */
  getMFAStatus: catchAsync(async (req, res) => {
    const mfa = await AuthService.getMFAStatus(req.user.id);
    sendSuccess(res, mfa, 'MFA status retrieved successfully', 200);
  }),

  /**
   * VALIDATE MFA TOKEN
   */
  validateMFAToken: catchAsync(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 'MFA token is required', 400);
    }

    await AuthService.validateMFATOTP(req.user.id, token);
    sendSuccess(res, { valid: true }, 'MFA token validated successfully', 200);
  }),

  /**
   * VALIDATE AND CONSUME BACKUP CODE
   */
  validateBackupCode: catchAsync(async (req, res) => {
    const { code } = req.body;
    if (!code) {
      return sendError(res, 'Backup code is required', 400);
    }
    await AuthService.validateAndConsumeBackupCode(req.user.id, code);
    sendSuccess(res, { valid: true }, 'Backup code validated and consumed', 200);
  }),
};

// ----------------------------------------------------------
// ADMIN CONTROLLER
// ----------------------------------------------------------

const AuthAdminController = {
    /**
   * GOOGLE OAUTH CALLBACK
   * Handles Google OAuth login/registration
   */

    googleOAuthCallback: catchAsync(async (req, res) => {
    // googleOAuth.middleware attaches oauthData to req.oauthData
    const { provider, oauthData } = req.oauthData || {};
    if (!provider || provider !== 'google' || !oauthData) {
      return sendError(res, 'Invalid Google OAuth data', 400);
    }
    // Find or create user from OAuth
    const userId = await AuthService.findOrCreateUserFromOAuth('google', oauthData);
    if (!userId) {
      return sendError(res, 'Failed to authenticate with Google', 401);
    }
    // Issue tokens (access/refresh)
    const UserService = require('../user/user.service').UserService;
    const user = await UserService.getUser(userId);
    const jwt = require('jsonwebtoken');
    const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../../config/env');
    const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    // Optionally, update refreshToken in DB
    await require('../user/user.model').findByIdAndUpdate(user.id, { refreshToken });
    sendSuccess(res, {
      user,
      accessToken,
      refreshToken,
      provider: 'google',
    }, 'Google OAuth successful', 200);
  }),
  /**
   * ENABLE MFA FOR USER
   */
  enableMFA: catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { method = 'totp' } = req.body;

    const mfa = await AuthAdminService.enableMFA(userId, method);
    sendSuccess(res, mfa, 'MFA enabled successfully', 200);
  }),

  /**
   * DISABLE MFA FOR USER
   */
  disableMFA: catchAsync(async (req, res) => {
    const { userId } = req.params;

    const mfa = await AuthAdminService.disableMFA(userId);
    sendSuccess(res, mfa, 'MFA disabled successfully', 200);
  }),

  /**
   * GENERATE MFA SECRET
   */
  generateMFASecret: catchAsync(async (req, res) => {
    const { userId } = req.params;

    const mfa = await AuthAdminService.generateMFASecret(userId);
    sendSuccess(res, mfa, 'MFA secret generated successfully', 201);
  }),

  /**
   * REGENERATE BACKUP CODES (ADMIN)
   */
  regenerateBackupCodes: catchAsync(async (req, res) => {
    const { userId } = req.params;
    const mfa = await AuthAdminService.regenerateBackupCodes(userId);
    sendSuccess(res, mfa, 'Backup codes regenerated', 200);
  }),

  /**
   * REVOKE USER SESSION
   */
  revokeUserSession: catchAsync(async (req, res) => {
    const { sessionId } = req.params;

    const result = await AuthAdminService.revokeSession(sessionId);
    sendSuccess(res, result, 'Session revoked successfully', 200);
  }),

  /**
   * REVOKE ALL USER SESSIONS
   */
  revokeAllUserSessions: catchAsync(async (req, res) => {
    const { userId } = req.params;

    const result = await AuthAdminService.revokeAllUserSessions(userId);
    sendSuccess(res, result, result.message, 200);
  }),
};

module.exports = {
  AuthController,
  AuthAdminController,
};
