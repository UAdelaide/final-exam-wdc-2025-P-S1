const mysql = require('mysql2/promise');

console.log('🔄 Creating database connection pool...');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  database: 'DogWalkService',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

// Test the connection when the module is loaded
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');

    // Test if we can query the database
    const [result] = await connection.execute('SELECT 1 + 1 AS test');
    console.log('✅ Database query test successful:', result[0]);

    // Check if DogWalkService database exists and we can access it
    const [databases] = await connection.execute('SELECT DATABASE() AS current_db');
    console.log('✅ Current database:', databases[0].current_db);

    // Check if Users table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'Users'");
    if (tables.length > 0) {
      console.log('✅ Users table exists');

      // Count users
      const [count] = await connection.execute('SELECT COUNT(*) as user_count FROM Users');
      console.log('📊 Number of users in database:', count[0].user_count);
    } else {
      console.log('⚠️  Users table does not exist - you may need to create it');
    }

    connection.release();

  } catch (err) {
    console.error('❌ Database connection/test failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);

    // Provide specific troubleshooting advice
    if (err.code === 'ECONNREFUSED') {
      console.error('💡 Solution: MySQL server is not running. Start it with:');
      console.error('   - Linux/Mac: sudo service mysql start');
      console.error('   - Windows: net start mysql');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Solution: Database "DogWalkService" does not exist. Create it with:');
      console.error('   mysql -u root -p');
      console.error('   CREATE DATABASE DogWalkService;');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Solution: Check your MySQL username/password');
      console.error('   - Default is usually user: root, password: (empty)');
      console.error('   - Update the password field in this file if needed');
    }
  }
}

// Run the test when module loads
testConnection();

module.exports = pool;