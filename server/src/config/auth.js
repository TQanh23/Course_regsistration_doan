/**
 * Authentication configuration
 */
module.exports = {
  // JWT token expiration time
  expiresIn: '24h',
  
  // Cookie name for web authentication (if needed)
  cookieName: 'dkhp_token',
  
  // Password requirements
  passwordMinLength: 8
};
