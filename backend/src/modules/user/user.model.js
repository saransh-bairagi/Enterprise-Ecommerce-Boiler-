const mongoose = require('mongoose');
const { Schema } = mongoose;
const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    publicId: { type: String, unique: true }, // unique automatically creates index
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // remove index:true
    phone: { type: String, unique: true, sparse: true }, // remove index:true
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
    isDeleted: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    refreshToken: { type: String, default: null },
    meta: {
        logins: { type: Number, default: 0 },
        lastLogin: { type: Date }
    }
}, { timestamps: true });

// ──────────────────────────────────────────────
// PRE VALIDATE / SAVE HOOKS
// ──────────────────────────────────────────────
UserSchema.pre('validate', function(next) {
    if (!this.publicId) {
        this.publicId = generatePrefixedUUID();
    }
    next();
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// ──────────────────────────────────────────────
// INSTANCE METHODS
// ──────────────────────────────────────────────
UserSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.visible = false;
    return this.save();
};

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
