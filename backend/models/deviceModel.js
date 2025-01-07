const mysql = require('mysql2');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',  // Replace with your MySQL username
  password: 'your_password',  // Replace with your MySQL password
  database: 'your_database',  // Replace with your MySQL database
  port: 3307  // Change port if needed
});

// Define the device model logic as functions
const deviceModel = {
  // Insert a new device into the Devices table
  create: (device, callback) => {
    const query = `INSERT INTO Devices (storeId, deviceType, brand, modelName, price, quantityAvailable) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    connection.execute(query, [
      device.storeId,
      device.deviceType,
      device.brand,
      device.modelName,
      device.price,
      device.quantityAvailable
    ], (err, results) => {
      if (err) {
        console.error('Error inserting device:', err);
        callback(err, null);
      } else {
        console.log('Device inserted with ID:', results.insertId);
        callback(null, results.insertId);
      }
    });
  },

  // Get all devices from the Devices table
  getAll: (callback) => {
    const query = 'SELECT * FROM Devices';
    connection.execute(query, [], (err, results) => {
      if (err) {
        console.error('Error fetching devices:', err);
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },

  // Get a device by ID
  getById: (id, callback) => {
    const query = 'SELECT * FROM Devices WHERE id = ?';
    connection.execute(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching device by ID:', err);
        callback(err, null);
      } else {
        callback(null, results[0]);
      }
    });
  },

  // Update a device by ID
  updateById: (id, updatedDevice, callback) => {
    const query = `
      UPDATE Devices
      SET storeId = ?, deviceType = ?, brand = ?, modelName = ?, price = ?, quantityAvailable = ?
      WHERE id = ?`;
    connection.execute(query, [
      updatedDevice.storeId,
      updatedDevice.deviceType,
      updatedDevice.brand,
      updatedDevice.modelName,
      updatedDevice.price,
      updatedDevice.quantityAvailable,
      id
    ], (err, results) => {
      if (err) {
        console.error('Error updating device:', err);
        callback(err, null);
      } else {
        console.log('Device updated:', results.affectedRows);
        callback(null, results.affectedRows);
      }
    });
  },

  // Delete a device by ID
  deleteById: (id, callback) => {
    const query = 'DELETE FROM Devices WHERE id = ?';
    connection.execute(query, [id], (err, results) => {
      if (err) {
        console.error('Error deleting device:', err);
        callback(err, null);
      } else {
        console.log('Device deleted:', results.affectedRows);
        callback(null, results.affectedRows);
      }
    });
  }
};

// Export the model for use in other parts of the application
module.exports = deviceModel;
