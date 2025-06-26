const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateFirebaseToken } = require('../middleware/auth');
const router = express.Router();

// Verify Firebase ID token and create/update user in database
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Decode the Firebase ID token (without verification)
    const decodedToken = jwt.decode(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    // Extract user info from decoded token
    const userInfo = {
      uid: decodedToken.sub || decodedToken.user_id,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified
    };
    
    // Check if user exists in our database
    let user = await User.findOne({
      where: { firebaseUid: userInfo.uid }
    });

    if (user) {
      // Update existing user
      user = await user.update({
        email: userInfo.email,
        name: userInfo.name || user.name,
        profilePicture: userInfo.picture || user.profilePicture,
        emailVerified: userInfo.emailVerified || false,
        lastLogin: new Date()
      });
    } else {
      // Create new user
      user = await User.create({
        firebaseUid: userInfo.uid,
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        profilePicture: userInfo.picture,
        emailVerified: userInfo.emailVerified || false,
        lastLogin: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: user,
      firebaseUser: userInfo
    });

  } catch (error) {
    console.error('Token processing error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Firebase token',
      error: error.message
    });
  }
});

// Get current user status
router.get('/me', authenticateFirebaseToken, async (req, res) => {
  try {
    // Find user in database
    const user = await User.findOne({
      where: { firebaseUid: req.user.uid }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    res.status(200).json({
      success: true,
      user: user,
      firebaseUser: req.user
    });

  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user information'
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Auth service is healthy'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Auth service issue',
      error: error.message
    });
  }
});

module.exports = router;
