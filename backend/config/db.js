// config/db.js
const mysql = require('mysql2');

const connectDB = async () => {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',       // MySQL host
      user: 'root',            // MySQL username
      password: '',            // MySQL password (empty in this case)
      database: 'Inventory-managment', // Database name
      port: 3007,              // MySQL port
    });

    console.log('MySQL connected on localhost:3007 to database "Inventory-managment"');
    return db; // Return the connection if needed
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
