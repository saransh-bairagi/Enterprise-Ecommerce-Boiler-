const mongoose = require('mongoose');

// ----------------------------------------------------------
// OAUTH CREDENTIALS SCHEMA
// ----------------------------------------------------------

const oauthCredentialsSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['google', 'github', 'facebook', 'twitter'],
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
      index: true,
    },
    email: String,
    displayName: String,
    profileUrl: String,
    accessToken: String, // Encrypted
    refreshToken: String, // Encrypted
    tokenExpiresAt: Date,
    isConnected: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// SESSION SCHEMA
// ----------------------------------------------------------

const sessionSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    ipAddress: String,
    userAgent: String,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    refreshTokenExpiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// MFA SECRET SCHEMA
// ----------------------------------------------------------

const mfaSecretSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    secret: {
      type: String,
      required: true,
    }, // Encrypted TOTP secret
    backupCodes: [String], // Encrypted
    isEnabled: {
      type: Boolean,
      default: false,
    },
    enabledAt: Date,
    method: {
      type: String,
      enum: ['totp', 'sms', 'email'],
      default: 'totp',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// INDEXES
// ----------------------------------------------------------

oauthCredentialsSchema.index({ userId: 1, provider: 1 });
sessionSchema.index({ userId: 1, isActive: 1 });
mfaSecretSchema.index({ userId: 1, isEnabled: 1 });

// ----------------------------------------------------------
// PRE-VALIDATE HOOKS
// ----------------------------------------------------------

[oauthCredentialsSchema, sessionSchema, mfaSecretSchema].forEach((schema) => {
  schema.pre('validate', async function (next) {
    if (!this.publicId) {
      const { generatePrefixedUUID } = require('../../utils/uuid');
      this.publicId = generatePrefixedUUID('AUTH');
    }
    next();
  });
});

module.exports = {
  OAuthCredentials: mongoose.model('OAuthCredentials', oauthCredentialsSchema),
  Session: mongoose.model('Session', sessionSchema),
  MFASecret: mongoose.model('MFASecret', mfaSecretSchema),
};
