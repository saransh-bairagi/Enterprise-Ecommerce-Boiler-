const { AuthDAO, AuthAdminDAO } = require('./auth.dao');
const { oauthDTO, sessionDTO, mfaDTO, authTokenDTO } = require('./auth.dto');
const AppError = require('../../core/appError');

/**
 * AUTH SERVICE
 * Business logic for OAuth, sessions, and MFA
 */

const AuthService = {
  /**
   * LINK OAUTH PROVIDER
   */
  async linkOAuthProvider(userId, provider, oauthData) {
    const existingOAuth = await AuthDAO.findOAuthByProvider(userId, provider);

    if (existingOAuth) {
      throw new AppError(`${provider} is already connected`, 400);
    }

    const oauth = await AuthAdminDAO.createOAuthCredentials({
      userId,
      provider,
      ...oauthData,
    });

    return oauthDTO(oauth);
  },

  /**
   * FIND OR CREATE USER FROM OAUTH
   */
  async findOrCreateUserFromOAuth(provider, oauthData) {
    const existingOAuth = await AuthDAO.findOAuthByProviderUserId(
      provider,
      oauthData.providerUserId
    );

    if (existingOAuth) {
      return existingOAuth.userId;
    }

    // Create new user from OAuth data
    const { email, displayName, firstName, lastName, profileUrl } = oauthData;
    const UserService = require('../user/user.service').UserService;
    // Try to find user by email first
    let user = null;
    if (email) {
      try {
        user = await UserService.findByEmail(email);
      } catch (e) {
        // Not found, will create
      }
    }
    if (!user) {
      // Create user with available OAuth info
      const userPayload = {
        email: email || undefined,
        firstName: firstName || (displayName ? displayName.split(' ')[0] : 'OAuth'),
        lastName: lastName || (displayName ? displayName.split(' ').slice(1).join(' ') : provider),
        password: Math.random().toString(36).slice(-12) + Date.now(), // random password
        role: 'user',
        meta: { oauthCreated: true },
        profileUrl: profileUrl || undefined,
      };
      user = await UserService.createUser(userPayload);
    }
    // Link OAuth credentials
    const oauth = await AuthAdminDAO.createOAuthCredentials({
      userId: user.id || user._id,
      provider,
      providerUserId: oauthData.providerUserId,
      email: email || undefined,
      displayName: displayName || undefined,
      profileUrl: profileUrl || undefined,
      accessToken: oauthData.accessToken,
      refreshToken: oauthData.refreshToken,
      tokenExpiresAt: oauthData.tokenExpiresAt,
      isConnected: true,
    });
    return user.id || user._id;
  },

  /**
   * GET USER OAUTH CONNECTIONS
   */
  async getUserOAuthConnections(userId) {
    const connections = await AuthDAO.listOAuthConnections(userId);
    return connections.map(oauthDTO);
  },

  /**
   * DISCONNECT OAUTH PROVIDER
   */
  async disconnectOAuthProvider(userId, provider) {
    const oauth = await AuthAdminDAO.disconnectOAuth(userId, provider);
    if (!oauth) {
      throw new AppError('OAuth connection not found', 404);
    }
    return oauthDTO(oauth);
  },

  /**
   * VALIDATE SESSION TOKEN
   */
  /**
   * Validate session token (checks DB, expiry, and active status)
   */
  async validateSessionToken(token) {
    const session = await AuthDAO.findSessionByToken(token);
    if (!session || !session.isActive) {
      throw new AppError('Invalid or expired session', 401);
    }
    return session;
  },

  /**
   * GET USER SESSIONS
   */
  async getUserSessions(userId) {
    const sessions = await AuthDAO.listUserSessions(userId);
    return sessions.map(sessionDTO);
  },

  /**
   * REVOKE SESSION
   */
  async revokeSession(token) {
    const session = await AuthAdminDAO.revokeSession(token);
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    return sessionDTO(session);
  },

  /**
   * REVOKE ALL USER SESSIONS
   */
  async revokeAllUserSessions(userId) {
    await AuthAdminDAO.revokeAllUserSessions(userId);
    return { message: 'All sessions revoked successfully' };
  },

  /**
   * CHECK MFA STATUS
   */
  async getMFAStatus(userId) {
    const mfa = await AuthDAO.findMFASecret(userId);
    return mfa ? mfaDTO(mfa) : null;
  },

  /**
   * VALIDATE MFA TOTP
   */
  /**
   * Validate MFA TOTP using speakeasy
   */
  async validateMFATOTP(userId, token) {
    const mfa = await AuthDAO.findMFASecret(userId);
    if (!mfa || !mfa.isEnabled) {
      throw new AppError('MFA not enabled for this user', 400);
    }
    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: mfa.secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) {
      throw new AppError('Invalid MFA token', 401);
    }
    return true;
  },
  /**
   * Validate and consume a backup code for MFA
   * @param {string} userId
   * @param {string} code
   * @returns {boolean}
   */
  async validateAndConsumeBackupCode(userId, code) {
    const mfa = await AuthDAO.findMFASecret(userId);
    if (!mfa || !mfa.isEnabled || !Array.isArray(mfa.backupCodes)) {
      throw new AppError('MFA not enabled or backup codes unavailable', 400);
    }
    const codeIdx = mfa.backupCodes.findIndex((c) => c === code);
    if (codeIdx === -1) {
      throw new AppError('Invalid or already used backup code', 401);
    }
    // Remove used code
    mfa.backupCodes.splice(codeIdx, 1);
    await AuthAdminDAO.updateMFASecret(userId, { backupCodes: mfa.backupCodes });
    return true;
  },
};

// ----------------------------------------------------------
// ADMIN SERVICE
// ----------------------------------------------------------

const AuthAdminService = {
    /**
     * Regenerate backup codes for a user (invalidate old, generate new)
     * @param {string} userId
     * @returns {object} mfaDTO
     */
    async regenerateBackupCodes(userId) {
      const mfa = await AuthDAO.findMFASecret(userId);
      if (!mfa || !mfa.isEnabled) {
        throw new AppError('MFA not enabled for this user', 400);
      }
      const newCodes = Array.from({ length: 5 }, () => Math.random().toString(36).slice(-8));
      const updated = await AuthAdminDAO.updateMFASecret(userId, { backupCodes: newCodes });
      return mfaDTO(updated);
    },
  /**
   * Create session and refresh token (token rotation)
   * On login or token refresh, old session is invalidated
   */
  async createSession(userId, token, refreshToken, expiresIn, metadata = {}) {
    // Invalidate all previous sessions for this user (token rotation)
    await AuthAdminDAO.revokeAllUserSessions(userId);
    const session = await AuthAdminDAO.createSession({
      userId,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ...metadata,
    });
    return sessionDTO(session);
  },

  async revokeSession(token) {
    const session = await AuthAdminDAO.revokeSession(token);
    if (!session) throw new AppError('Session not found', 404);
    return sessionDTO(session);
  },

  async revokeAllUserSessions(userId) {
    await AuthAdminDAO.revokeAllUserSessions(userId);
    return { message: 'All sessions revoked successfully' };
  },

  async enableMFA(userId, method = 'totp') {
    const mfa = await AuthAdminDAO.enableMFA(userId, method);
    if (!mfa) throw new AppError('MFA setup failed', 500);
    return mfaDTO(mfa);
  },

  async disableMFA(userId) {
    const mfa = await AuthAdminDAO.disableMFA(userId);
    if (!mfa) throw new AppError('MFA not found', 404);
    return mfaDTO(mfa);
  },

  /**
   * Generate TOTP secret and backup codes for MFA
   */
  async generateMFASecret(userId) {
    const speakeasy = require('speakeasy');
    const secret = speakeasy.generateSecret({ length: 32 });
    // Generate 5 backup codes
    const backupCodes = Array.from({ length: 5 }, () =>
      Math.random().toString(36).slice(-8)
    );
    const mfa = await AuthAdminDAO.createMFASecret({
      userId,
      secret: secret.base32,
      backupCodes,
      isEnabled: false,
    });
    return mfaDTO(mfa);
  },

  // OAuth integrations, password reset, and email verification should be implemented in infrastructure layer only.
  // See infrastructure/ for external provider integrations.
};

module.exports = {
  AuthService,
  AuthAdminService,
};
