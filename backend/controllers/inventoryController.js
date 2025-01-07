// Add a new device to the inventory
const Device = require('../models/deviceModel');
const Store = require('../models/storeModel');
const pool = require('../config/db');

exports.addDevice = async (req, res) => {
    const { deviceType, brand, modelName, price, quantityAvailable } = req.body;
  
    try {
      // Get the authenticated store owner's ID from the request (set by the auth middleware)
      const storeOwner = req.storeOwner;
  
      if (!storeOwner) {
        return res.status(401).json({ message: 'Unauthorized, store owner not found' });
      }
  
      const storeId = storeOwner.id;
  
      // Insert the new device into the MySQL database
      const query = `INSERT INTO devices (storeId, deviceType, brand, modelName, price, quantityAvailable) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [storeId, deviceType, brand, modelName, price, quantityAvailable];
  
      db.query(query, values, (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error adding device' });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error adding device' });
    }
  };
  
  // Get a specific device by ID
  exports.getDeviceById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const storeOwner = req.storeOwner; // Authenticated store owner from authMiddleware
  
      // Query to get the device by its ID and ensure it belongs to the authenticated store owner
      const query = `SELECT * FROM devices WHERE id = ? AND storeId = ?`;
      db.query(query, [id, storeOwner.id], (err, results) => {
        if (err) {
          console.error('Error fetching device by ID:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'Device not found' });
        }
  
        res.status(200).json(results[0]);
      });
    } catch (err) {
      console.error('Error fetching device by ID:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Get all devices in the store's inventory
  exports.getAllDevices = async (req, res) => {
    try {
      const storeOwner = req.storeOwner; // Authenticated store owner from authMiddleware
  
      // Query to get all devices belonging to the authenticated store owner
      const query = `SELECT * FROM devices WHERE storeId = ?`;
      db.query(query, [storeOwner.id], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json(results);
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Update a device in the inventory
  exports.updateDevice = async (req, res) => {
    const { id } = req.params;
    const { deviceType, brand, modelName, price, quantityAvailable } = req.body;
  
    try {
      const storeOwner = req.storeOwner; // Authenticated store owner from authMiddleware
  
      // Query to find the device by ID and storeId
      const query = `SELECT * FROM devices WHERE id = ? AND storeId = ?`;
      db.query(query, [id, storeOwner.id], (err, results) => {
        if (err) {
          console.error('Error fetching device:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'Device not found' });
        }
  
        const device = results[0];
  
        // Update the device details
        const updateQuery = `UPDATE devices SET deviceType = ?, brand = ?, modelName = ?, price = ?, quantityAvailable = ? WHERE id = ? AND storeId = ?`;
        const values = [
          deviceType || device.deviceType,
          brand || device.brand,
          modelName || device.modelName,
          price || device.price,
          quantityAvailable !== undefined ? quantityAvailable : device.quantityAvailable,
          id,
          storeOwner.id
        ];
  
        db.query(updateQuery, values, (updateErr, updateResults) => {
          if (updateErr) {
            console.error('Error updating device:', updateErr);
            return res.status(500).json({ message: 'Server error' });
          }
          res.status(200).json({ message: 'Device updated successfully', device: { ...device, ...req.body } });
        });
      });
    } catch (err) {
      console.error('Error updating device:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Delete a device from the inventory
  exports.deleteDevice = async (req, res) => {
    const { id } = req.params;
  
    try {
      const storeOwner = req.storeOwner; // Authenticated store owner from authMiddleware
  
      // Query to find and delete the device by ID and storeId
      const query = `DELETE FROM devices WHERE id = ? AND storeId = ?`;
      db.query(query, [id, storeOwner.id], (err, results) => {
        if (err) {
          console.error('Error deleting device:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Device not found' });
        }
  
        res.status(200).json({ message: 'Device deleted successfully' });
      });
    } catch (err) {
      console.error('Error deleting device:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  