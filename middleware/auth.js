const { admin } = require('../config/firebase');

// Middleware to authenticate Firebase ID token
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
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired Firebase token'
    });
  }
};

// Middleware to check if user is authenticated (optional authentication)
const optionalFirebaseAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        emailVerified: decodedToken.email_verified
      };
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
