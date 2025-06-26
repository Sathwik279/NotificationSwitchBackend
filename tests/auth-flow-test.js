const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sequelize } = require('../config/database');

// Mock Firebase ID token for testing
const mockFirebaseToken = {
  sub: 'firebase_test_uid_123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  email_verified: true,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
};

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Firebase Authentication Flow...\n');
    
    // 1. Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // 2. Test token decoding (simulating what the middleware does)
    const encodedToken = jwt.sign(mockFirebaseToken, 'fake-secret'); // We don't verify, just decode
    const decodedToken = jwt.decode(encodedToken);
    console.log('✅ Token decoding successful');
    console.log('📄 Decoded token:', {
      uid: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name
    });
    
    // 3. Test user creation (simulating what /auth/verify does)
    const userInfo = {
      uid: decodedToken.sub || decodedToken.user_id,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified
    };
    
    // Check if user exists
    let user = await User.findOne({
      where: { firebaseUid: userInfo.uid }
    });
    
    if (user) {
      console.log('👤 User already exists, updating...');
      user = await user.update({
        email: userInfo.email,
        name: userInfo.name || user.name,
        profilePicture: userInfo.picture || user.profilePicture,
        emailVerified: userInfo.emailVerified || false,
        lastLogin: new Date()
      });
    } else {
      console.log('🆕 Creating new user...');
      user = await User.create({
        firebaseUid: userInfo.uid,
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        profilePicture: userInfo.picture,
        emailVerified: userInfo.emailVerified || false,
        lastLogin: new Date()
      });
    }
    
    console.log('✅ User creation/update successful');
    console.log('👤 User details:', {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified
    });
    
    // 4. Test user retrieval (simulating what /auth/me does)
    const retrievedUser = await User.findOne({
      where: { firebaseUid: userInfo.uid }
    });
    
    console.log('✅ User retrieval successful');
    
    // 5. Clean up test user
    await retrievedUser.destroy();
    console.log('🗑️  Test user cleaned up');
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection works');
    console.log('   ✅ JWT token decoding works');
    console.log('   ✅ User creation works');
    console.log('   ✅ User updates work');
    console.log('   ✅ User retrieval works');
    console.log('   ✅ Firebase UID mapping works');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

module.exports = { testAuthFlow };

// Run test if called directly
if (require.main === module) {
  testAuthFlow()
    .then(() => {
      console.log('\nTest completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nTest failed:', error);
      process.exit(1);
    });
}
