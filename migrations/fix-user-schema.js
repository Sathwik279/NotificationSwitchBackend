const { sequelize } = require('../config/database');

async function fixUserSchema() {
  try {
    console.log('🔧 Starting schema migration...');
    
    // Drop existing indexes that conflict
    try {
      await sequelize.query('DROP INDEX IF EXISTS "users_google_id"');
      console.log('✅ Dropped old googleId index');
    } catch (error) {
      console.log('ℹ️  googleId index not found (already removed)');
    }
    
    // Remove old columns if they exist
    try {
      await sequelize.query('ALTER TABLE users DROP COLUMN IF EXISTS "googleId"');
      console.log('✅ Removed googleId column');
    } catch (error) {
      console.log('ℹ️  googleId column not found (already removed)');
    }
    
    try {
      await sequelize.query('ALTER TABLE users DROP COLUMN IF EXISTS "authProvider"');
      console.log('✅ Removed authProvider column');
    } catch (error) {
      console.log('ℹ️  authProvider column not found (already removed)');
    }
    
    try {
      await sequelize.query('ALTER TABLE users DROP COLUMN IF EXISTS "password"');
      console.log('✅ Removed password column (not needed for Firebase auth)');
    } catch (error) {
      console.log('ℹ️  password column not found (already removed)');
    }
    
    // Drop old enum type if it exists
    try {
      await sequelize.query('DROP TYPE IF EXISTS "enum_users_authProvider"');
      console.log('✅ Removed old authProvider enum type');
    } catch (error) {
      console.log('ℹ️  authProvider enum not found (already removed)');
    }
    
    // Ensure firebaseUid column exists and is unique
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS "firebaseUid" VARCHAR(255)
      `);
      console.log('✅ Ensured firebaseUid column exists');
    } catch (error) {
      console.log('ℹ️  firebaseUid column already exists');
    }
    
    // Create unique index on firebaseUid if not exists
    try {
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "users_firebase_uid" 
        ON "users" ("firebaseUid") 
        WHERE "firebaseUid" IS NOT NULL
      `);
      console.log('✅ Created unique index on firebaseUid');
    } catch (error) {
      console.log('ℹ️  firebaseUid index already exists');
    }
    
    console.log('🎉 Schema migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

module.exports = { fixUserSchema };

// Run migration if called directly
if (require.main === module) {
  fixUserSchema()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
