/**
 * AUTH DTO
 * Data Transfer Objects for auth responses
 */

const oauthDTO = (oauth) => {
  if (!oauth) return null;

  return {
    id: oauth.publicId,
    provider: oauth.provider,
    displayName: oauth.displayName,
    email: oauth.email,
    profileUrl: oauth.profileUrl,
    isConnected: oauth.isConnected,
    connectedAt: oauth.createdAt,
  };
};

const sessionDTO = (session) => {
  if (!session) return null;

  return {
    id: session.publicId,
    token: session.token,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    isActive: session.isActive,
    createdAt: session.createdAt,
  };
};

const mfaDTO = (mfa) => {
  if (!mfa) return null;

  return {
    id: mfa.publicId,
    isEnabled: mfa.isEnabled,
    method: mfa.method,
    enabledAt: mfa.enabledAt,
    backupCodesCount: mfa.backupCodes ? mfa.backupCodes.length : 0,
  };
};

const authTokenDTO = (accessToken, refreshToken, expiresIn) => {
  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer',
  };
};

module.exports = {
  oauthDTO,
  sessionDTO,
  mfaDTO,
  authTokenDTO,
};
