const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/auth.config');

/**
 * Generate Access Token
 */
exports.generateAccessToken = (userId, additionalPayload = {}) => {
  return jwt.sign(
    { id: userId, ...additionalPayload },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

/**
 * Generate Refresh Token
 */
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
};

/**
 * Verify Token
 */
exports.verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken ? jwtConfig.refreshSecret : jwtConfig.secret;
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};