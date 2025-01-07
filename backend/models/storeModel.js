const db = require('../config/db'); // Import the MySQL connection
const bcrypt = require('bcryptjs');

const Store = {};

// Create a new store owner
Store.create = async (storeData) => {
  const { ownerName, storeName, email, password, phone, address, emailVerificationToken } = storeData;

  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const sql = `
    INSERT INTO stores (owner_name, store_name, email, password, phone, address, email_verification_token, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, false)
  `;

  const values = [ownerName, storeName, email, hashedPassword, phone, address, emailVerificationToken];

  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Find a store owner by email
Store.findByEmail = (email) => {
  const sql = `SELECT * FROM stores WHERE email = ?`;

  return new Promise((resolve, reject) => {
    db.query(sql, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]); // Return the first matching record
    });
  });
};

// Find a store owner by email verification token
Store.findByEmailVerificationToken = (token) => {
  const sql = `SELECT * FROM stores WHERE email_verification_token = ?`;

  return new Promise((resolve, reject) => {
    db.query(sql, [token], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]); // Return the first matching record
    });
  });
};

// Update a store owner's verification status
Store.verifyEmail = (id) => {
  const sql = `
    UPDATE stores
    SET is_verified = true, email_verification_token = NULL
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Compare hashed passwords
Store.comparePassword = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

module.exports = Store;
