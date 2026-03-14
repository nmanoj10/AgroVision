const crypto = require('crypto');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash || '').split(':');
  if (!salt || !originalHash) {
    return false;
  }

  const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(originalHash, 'hex'));
}

function createAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    state: userDoc.state,
    role: userDoc.role,
    isVerified: userDoc.isVerified,
    isBanned: userDoc.isBanned,
    totalScans: 0,
    lastLoginAt: userDoc.lastLoginAt,
    createdAt: userDoc.createdAt,
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  sanitizeUser,
};
