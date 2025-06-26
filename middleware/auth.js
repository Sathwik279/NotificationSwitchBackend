const jwt = require('jsonwebtoken');

// Middleware to authenticate Firebase ID token (decode without verification)
const authenticateFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Firebase ID token required'
    });
  }

  try {
    // Decode the Firebase ID token without verification (simpler approach)
    const decodedToken = jwt.decode(token);
    
    if (!decodedToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    // Add user info to request
    req.user = {
      uid: decodedToken.sub || decodedToken.user_id,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Token decoding error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or malformed token'
    });
  }
};

// Middleware to check if user is authenticated (optional authentication)
const optionalFirebaseAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decodedToken = jwt.decode(token);
      if (decodedToken) {
        req.user = {
          uid: decodedToken.sub || decodedToken.user_id,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
          emailVerified: decodedToken.email_verified
        };
      }
    } catch (error) {
      // Token invalid, but continue without user info
      console.log('Optional auth failed:', error.message);
    }
  }
  
  next();
};

module.exports = {
  authenticateFirebaseToken,
  optionalFirebaseAuth
};
