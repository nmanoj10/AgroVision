const mongoose = require('mongoose');

const LoginActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['farmer', 'expert', 'admin', 'guest'],
      default: 'farmer',
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    loggedInAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginActivity', LoginActivitySchema);
