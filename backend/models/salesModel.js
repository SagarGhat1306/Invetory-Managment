const db = require('../config/db'); // MySQL database connection
const uuid = require('uuid'); // For generating a unique receipt_id

const Sales = {};

// Create a new sale
Sales.create = async (saleData) => {
  const {
    storeId,
    customerName,
    customerEmail,
    customerAddress,
    customerPhone,
    saleAttendant,
    devices,
    totalAmount,
    paymentStatus,
    receipt
  } = saleData;

  // Generate a unique receipt_id (similar to auto-increment)
  const receipt_id = uuid.v4(); // Use a UUID to simulate unique receipt_id

  const sql = `
    INSERT INTO sales (
      store_id,
      customer_name,
      customer_email,
      customer_address,
      customer_phone,
      sale_attendant,
      total_amount,
      payment_status,
      receipt,
      receipt_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    storeId,
    customerName,
    customerEmail,
    customerAddress,
    customerPhone,
    saleAttendant,
    totalAmount,
    paymentStatus,
    receipt,
    receipt_id
  ];

  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Create entries for each device in the sale
Sales.createSaleDevices = async (saleId, devices) => {
  const sql = `
    INSERT INTO sale_devices (
      sale_id,
      device_id,
      model_name,
      quantity,
      item_total_price
    ) VALUES (?, ?, ?, ?, ?)
  `;

  devices.forEach(async (device) => {
    const values = [
      saleId,
      device.deviceId,
      device.modelName,
      device.quantity,
      device.itemTotalPrice
    ];

    await new Promise((resolve, reject) => {
      db.query(sql, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  });
};

// Get sale by receipt_id
Sales.getSaleByReceiptId = (receiptId) => {
  const sql = `
    SELECT * FROM sales WHERE receipt_id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [receiptId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]); // Return the first matching record
    });
  });
};

// Get all sales
Sales.getAllSales = () => {
  const sql = `SELECT * FROM sales`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = Sales;
