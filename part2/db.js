const mysql = require('mysql2/promise');

console.log('Creating database connection pool...');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  database: 'DogWalkService',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection when the module is loaded
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Common issues:');
    console.error('1. MySQL server not running');
    console.error('2. Database "DogWalkService" does not exist');
    console.error('3. Incorrect username/password');
    console.error('4. MySQL running on different port');
  });

module.exports = pool;