const { OAuthCredentials, Session, MFASecret } = require('./auth.model');

/**
 * AUTH DAO
 * Handles auth-related database queries
 */

const AuthDAO = {
  async findOAuthByProvider(userId, provider) {
    return OAuthCredentials.findOne({
      userId,
      provider,
      isDeleted: false,
    }).lean();
  },

  async findOAuthByProviderUserId(provider, providerUserId) {
    return OAuthCredentials.findOne({
      provider,
      providerUserId,
      isDeleted: false,
    }).lean();
  },

  async listOAuthConnections(userId) {
    return OAuthCredentials.find({
      userId,
      isDeleted: false,
    }).lean();
  },

  async findSessionByToken(token) {
    return Session.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
      isDeleted: false,
    }).lean();
  },

  async findSessionById(id) {
    return Session.findOne({
      publicId: id,
      isActive: true,
      isDeleted: false,
    }).lean();
  },

  async listUserSessions(userId) {
    return Session.find({
      userId,
      isActive: true,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();
  },

  async findMFASecret(userId) {
    return MFASecret.findOne({
      userId,
      isDeleted: false,
    }).lean();
  },
};

// ----------------------------------------------------------
// ADMIN DAO
// ----------------------------------------------------------

const AuthAdminDAO = {
  async createOAuthCredentials(data) {
    const oauth = new OAuthCredentials(data);
    return oauth.save();
  },

  async updateOAuthCredentials(userId, provider, data) {
    return OAuthCredentials.findOneAndUpdate(
      { userId, provider, isDeleted: false },
      { $set: data },
      { new: true }
    );
  },

  async createSession(data) {
    const session = new Session(data);
    return session.save();
  },

  async updateSession(token, data) {
    return Session.findOneAndUpdate(
      { token, isDeleted: false },
      { $set: data },
      { new: true }
    );
  },

  async revokeSession(token) {
    return Session.findOneAndUpdate(
      { token, isDeleted: false },
      { $set: { isActive: false } },
      { new: true }
    );
  },

  async revokeAllUserSessions(userId) {
    return Session.updateMany(
      { userId, isActive: true, isDeleted: false },
      { $set: { isActive: false } }
    );
  },

  async createMFASecret(data) {
    const mfa = new MFASecret(data);
    return mfa.save();
  },

  async updateMFASecret(userId, data) {
    return MFASecret.findOneAndUpdate(
      { userId, isDeleted: false },
      { $set: data },
      { new: true }
    );
  },

  async enableMFA(userId, method) {
    return MFASecret.findOneAndUpdate(
      { userId, isDeleted: false },
      { $set: { isEnabled: true, method, enabledAt: new Date() } },
      { new: true }
    );
  },

  async disableMFA(userId) {
    return MFASecret.findOneAndUpdate(
      { userId, isDeleted: false },
      { $set: { isEnabled: false, enabledAt: null } },
      { new: true }
    );
  },

  async disconnectOAuth(userId, provider) {
    return OAuthCredentials.findOneAndUpdate(
      { userId, provider, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  async deleteMFASecret(userId) {
    return MFASecret.findOneAndUpdate(
      { userId },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },
};

module.exports = {
  AuthDAO,
  AuthAdminDAO,
};
