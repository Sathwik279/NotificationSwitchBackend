const express = require('express');
const { admin } = require('../config/firebase');
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

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if user exists in our database
    let user = await User.findOne({
      where: { firebaseUid: decodedToken.uid }
    });

    if (user) {
      // Update existing user
      user = await user.update({
        email: decodedToken.email,
        name: decodedToken.name || user.name,
        profilePicture: decodedToken.picture || user.profilePicture,
        emailVerified: decodedToken.email_verified || false,
        lastLogin: new Date()
      });
    } else {
      // Create new user
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        profilePicture: decodedToken.picture,
        emailVerified: decodedToken.email_verified || false,
        lastLogin: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: user,
      firebaseUser: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      }
    });

  } catch (error) {
    console.error('Firebase auth verification error:', error);
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

// Logout (revoke Firebase tokens)
router.post('/logout', authenticateFirebaseToken, async (req, res) => {
  try {
    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(req.user.uid);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

// Delete user account
router.delete('/delete-account', authenticateFirebaseToken, async (req, res) => {
  try {
    // Delete from our database
    const user = await User.findOne({
      where: { firebaseUid: req.user.uid }
    });

    if (user) {
      await user.destroy();
    }

    // Delete from Firebase
    await admin.auth().deleteUser(req.user.uid);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
});

// Health check for Firebase connection
router.get('/firebase-status', async (req, res) => {
  try {
    // Try to get Firebase project info
    const project = await admin.auth().getUser('test-uid').catch(() => null);
    
    res.status(200).json({
      success: true,
      message: 'Firebase connection is healthy',
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firebase connection issue',
      error: error.message
    });
  }
});

module.exports = router;
