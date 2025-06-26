const express = require('express');
const { User } = require('../models');
const { authenticateFirebaseToken } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { firebaseUid: req.user.uid }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateFirebaseToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findOne({
      where: { firebaseUid: req.user.uid }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    await user.update({
      name: name || user.name
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
});

// Get all users (admin only - you can add admin check later)
router.get('/', authenticateFirebaseToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'profilePicture', 'isActive', 'lastLogin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Delete user account
router.delete('/profile', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { firebaseUid: req.user.uid }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user account'
    });
  }
});

module.exports = router;
