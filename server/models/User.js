const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    passwordHash: { type: String, required: true },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    role: {
      type: String,
      enum: ['farmer', 'expert', 'admin', 'guest'],
      default: 'farmer',
    },
    isVerified: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
