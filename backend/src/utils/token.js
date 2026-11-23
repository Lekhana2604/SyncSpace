import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Signs a JWT token containing user identity.
 */
export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verifies a JWT token and returns decoded payload.
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
