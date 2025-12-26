/**
 * Google OAuth Middleware
 * Exchanges code for tokens and user info, attaches to req.oauthData
 */
const axios = require('axios');
const AppError = require('../../core/appError');

module.exports = async function googleOAuthMiddleware(req, res, next) {
  try {
    const code = req.query.code;
    if (!code) {
      throw new AppError('Missing Google OAuth code', 400);
    }
    // Exchange code for tokens
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = require('../../config/env');
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token, id_token } = tokenRes.data;
    // Get user info
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = userRes.data;
    req.oauthData = {
      provider: 'google',
      oauthData: {
        providerUserId: profile.sub,
        email: profile.email,
        displayName: profile.name,
        firstName: profile.given_name,
        lastName: profile.family_name,
        profileUrl: profile.picture,
        accessToken: access_token,
        idToken: id_token,
      },
    };
    next();
  } catch (err) {
    next(err);
  }
};