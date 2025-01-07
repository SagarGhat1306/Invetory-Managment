const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Import the connection pool from your existing setup

// Register a new store owner with email verification
exports.registerStore = async (req, res) => {
    const { ownerName, storeName, email, password, phone, address } = req.body;

    try {
        // Check if the store owner already exists
        const [rows] = await pool.query('SELECT * FROM stores WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Store owner already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate an email verification token
        const emailVerificationToken = crypto.randomBytes(10).toString('hex');

        // Insert the store owner into the database
        await pool.query(
            'INSERT INTO stores (owner_name, store_name, email, password, phone, address, email_verification_token, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [ownerName, storeName, email, hashedPassword, phone, address, emailVerificationToken, false]
        );

        // Set up Nodemailer with Brevo's SMTP service
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER, // Brevo SMTP email (from .env)
                pass: process.env.EMAIL_PASS // Brevo SMTP password (from .env)
            }
        });

        // Construct the email message
        const mailOptions = {
            to: email,
            from: 'hashirkhan.tech@gmail.com',
            subject: 'Email confirmation',
            text: `You are receiving this because you registered your store account.\n\n
            Please click on the following link, or paste this into your browser to verify your email address:\n\n
            http://${req.headers.host}/api/auth/verify-email/${emailVerificationToken}\n\n
            If you did not request this, please ignore this email.\n`
        };

        // Send the verification email
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending verification email' });
            }
            console.log('Verification email sent: ' + info.response);
            res.status(200).json({ message: 'Registration successful. Please check your email to verify your account.' });
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Unable to register the store owner' });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        // Check if the token exists
        const [rows] = await pool.query('SELECT * FROM stores WHERE email_verification_token = ?', [token]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Update the store owner as verified
        await pool.query('UPDATE stores SET is_verified = ?, email_verification_token = NULL WHERE email_verification_token = ?', [true, token]);

        res.redirect('http://localhost:5173/login');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error verifying email' });
    }
};

// Login store owner
exports.loginStore = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email exists
        const [rows] = await pool.query('SELECT * FROM stores WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const storeOwner = rows[0];

        // Check if the email is verified
        if (!storeOwner.is_verified) {
            return res.status(400).json({ message: 'Email is not verified' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, storeOwner.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: storeOwner.id, storeName: storeOwner.store_name }, process.env.JWT_SECRET, {
            expiresIn: '72h'
        });

        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout store owner
exports.logoutStore = (req, res) => {
    res.status(200).json({ message: 'Successfully logged out' });
};
