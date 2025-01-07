// salesController.js
const pool = require('../config/db');
const Sales = require("../models/salesModel");
const Device = require("../models/deviceModel");
const Store = require("../models/storeModel");
const nodemailer = require("nodemailer");

// Create a new sale and generate a receipt (no payment gateway for now)
exports.createSale = async (req, res) => {
    const {
        customerName,
        customerEmail,
        customerAddress,
        customerPhone,
        saleAttendant,
        cart,
    } = req.body;

    try {
        const storeOwner = req.storeOwner;

        // Fetch the largest receipt_id in the sales records
        const [rows] = await pool.execute("SELECT receipt_id FROM sales ORDER BY receipt_id DESC LIMIT 1");
        const newReceiptId = rows.length > 0 ? rows[0].receipt_id + 1 : 1;

        let totalAmount = 0;
        let devicesSold = [];

        // Loop through the cart and process each item
        for (const item of cart) {
            const [deviceRows] = await pool.execute(
                "SELECT * FROM devices WHERE id = ? AND storeId = ?",
                [item.deviceId, storeOwner.id]
            );

            if (deviceRows.length === 0) {
                return res.status(404).json({
                    message: `Device with ID ${item.deviceId} not found in inventory`,
                });
            }

            const device = deviceRows[0];

            if (device.quantityAvailable < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient quantity for ${device.modelName}`,
                });
            }

            const itemTotalPrice = item.quantity * device.price;
            totalAmount += itemTotalPrice;

            // Update the device quantity
            await pool.execute(
                "UPDATE devices SET quantityAvailable = ? WHERE id = ?",
                [device.quantityAvailable - item.quantity, item.deviceId]
            );

            devicesSold.push({
                deviceId: device.id,
                modelName: device.modelName,
                quantity: item.quantity,
                itemTotalPrice: itemTotalPrice,
            });
        }

        // Generate a digital receipt with the receipt ID included
        let receipt = `Receipt for ${customerName}\nReceipt ID: ${newReceiptId}\nDevices Sold:\n`;
        devicesSold.forEach((device) => {
            receipt += ` - ${device.modelName}: ${device.quantity} units, Total: $${device.itemTotalPrice}\n`;
        });
        receipt += `Total Amount: $${totalAmount}\nSold by: ${storeOwner.storeName}\nAttendant: ${saleAttendant}`;

        // Insert the sale into the sales table
        await pool.execute(
            "INSERT INTO sales (storeId, customerName, customerEmail, customerAddress, customerPhone, saleAttendant, totalAmount, paymentStatus, receipt_id, receipt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                storeOwner.id,
                customerName,
                customerEmail,
                customerAddress,
                customerPhone,
                saleAttendant,
                totalAmount,
                'Completed', // paymentStatus
                newReceiptId,
                receipt,
            ]
        );

        // Send receipt email
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: "hashirkhan.tech@gmail.com",
            to: customerEmail,
            subject: "Your Purchase Receipt",
            text: `Thank you for your purchase. Here is your receipt:\n\n${receipt}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending receipt email:", err);
                return res.status(500).json({ message: "Receipt email failed" });
            }
            console.log("Receipt email sent:", info.response);
        });

        res.status(201).json({
            message: "Sale logged and receipt generated",
            sale: { customerName, customerEmail, receipt },
        });
    } catch (err) {
        console.error("Error creating sale:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get the largest receipt_id (to generate the next receipt_id)
exports.getLargestReceiptId = async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT receipt_id FROM sales ORDER BY receipt_id DESC LIMIT 1");

        if (rows.length === 0) {
            return res.status(404).json({ message: "No sales records found" });
        }

        res.status(200).json({ largestReceiptId: rows[0].receipt_id });
    } catch (err) {
        console.error("Error fetching the largest receipt ID:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Recall receipt (search sales by imei, modelName, or customerEmail)
exports.recallReceipt = async (req, res) => {
    const { imei, modelName, customerEmail } = req.query;

    try {
        let query = "SELECT * FROM sales WHERE storeId = ?";
        let params = [req.storeOwner.id];

        if (imei) {
            query += " AND imei = ?";
            params.push(imei);
        }

        if (modelName) {
            query += " AND modelName = ?";
            params.push(modelName);
        }

        if (customerEmail) {
            query += " AND customerEmail = ?";
            params.push(customerEmail);
        }

        const [sales] = await pool.execute(query, params);

        if (sales.length === 0) {
            return res.status(404).json({ message: "No matching receipts found" });
        }

        res.status(200).json(sales);
    } catch (err) {
        console.error("Error recalling receipt:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all sales for the store
exports.getAllSales = async (req, res) => {
    try {
        const [sales] = await pool.execute("SELECT * FROM sales WHERE storeId = ?", [req.storeOwner.id]);

        res.status(200).json(sales);
    } catch (err) {
        console.error("Error fetching all sales:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get receipt by ID
exports.getReceiptById = async (req, res) => {
    const { receipt_id } = req.params;

    try {
        const [rows] = await pool.execute("SELECT * FROM sales WHERE receipt_id = ? AND storeId = ?", [receipt_id, req.storeOwner.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Receipt not found" });
        }

        const sale = rows[0];

        res.status(200).json({
            receipt_id: sale.receipt_id,
            receipt: sale.receipt,
        });
    } catch (err) {
        console.error("Error fetching receipt:", err);
        res.status(500).json({ message: "Server error" });
    }
};
