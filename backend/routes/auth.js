const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validate } = require('../utils/validation');
const { userSchemas } = require('../utils/validation');

// Register new user (admin only)
router.post('/register', validate(userSchemas.register), async (req, res) => {
  try {
    const { rfid_card_id, student_id, first_name, last_name, email, phone, user_type } = req.body;
    
    // Check if RFID card already exists
    const existingUser = await User.findByRfidCardId(rfid_card_id);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'RFID card already registered'
      });
    }
    
    // Check if student ID already exists (if provided)
    if (student_id) {
      const existingStudent = await User.findByStudentId(student_id);
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already registered'
        });
      }
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }
    
    // Create new user
    const user = await User.create({
      rfid_card_id,
      student_id,
      first_name,
      last_name,
      email,
      phone,
      user_type
    });
    
    // Generate JWT token
    const token = generateToken(user.id, user.user_type);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          rfid_card_id: user.rfid_card_id,
          student_id: user.student_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          user_type: user.user_type
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login with RFID card
router.post('/login', async (req, res) => {
  try {
    const { rfid_card_id } = req.body;
    
    if (!rfid_card_id) {
      return res.status(400).json({
        success: false,
        message: 'RFID card ID is required'
      });
    }
    
    // Find user by RFID card
    const user = await User.findByRfidCardId(rfid_card_id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid RFID card'
      });
    }
    
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user.id, user.user_type);
    
    // Get user's wallet balance
    const wallet = await user.getWallet();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          rfid_card_id: user.rfid_card_id,
          student_id: user.student_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          user_type: user.user_type
        },
        wallet: {
          balance: wallet ? wallet.balance : 0
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7);
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token);
    
    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    // Get wallet balance
    const wallet = await user.getWallet();
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          rfid_card_id: user.rfid_card_id,
          student_id: user.student_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          user_type: user.user_type
        },
        wallet: {
          balance: wallet ? wallet.balance : 0
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7);
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const profile = await user.getProfile();
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

module.exports = router;
