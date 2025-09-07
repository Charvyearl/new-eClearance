const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { verifyToken, requireStaff } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { walletSchemas } = require('../utils/validation');

// Get wallet balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const balance = await wallet.getBalance();
    
    res.json({
      success: true,
      data: {
        balance,
        user_id: req.user.id,
        rfid_card_id: req.user.rfid_card_id
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get balance',
      error: error.message
    });
  }
});

// Get wallet summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const summary = await wallet.getSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet summary',
      error: error.message
    });
  }
});

// Get transaction history
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      transactionType: req.query.type
    };
    
    const transactions = await wallet.getTransactionHistory(options);
    
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: options.page,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction history',
      error: error.message
    });
  }
});

// Top up wallet (staff/admin only)
router.post('/top-up', verifyToken, requireStaff, validate(walletSchemas.topUp), async (req, res) => {
  try {
    const { amount, description } = req.body;
    const { user_id } = req.query; // User ID to top up
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const wallet = await Wallet.findByUserId(user_id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const result = await wallet.addMoney(
      amount, 
      description || `Top-up by ${req.user.first_name} ${req.user.last_name}`,
      req.user.id
    );
    
    res.json({
      success: true,
      message: 'Wallet topped up successfully',
      data: result
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Top-up failed',
      error: error.message
    });
  }
});

// Transfer money to another user
router.post('/transfer', verifyToken, validate(walletSchemas.transfer), async (req, res) => {
  try {
    const { recipient_rfid, amount, description } = req.body;
    
    const wallet = await Wallet.findByUserId(req.user.id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const result = await wallet.transferMoney(recipient_rfid, amount, description);
    
    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Transfer failed',
      error: error.message
    });
  }
});

// Get wallet by RFID (for payment processing)
router.get('/rfid/:rfid_card_id', verifyToken, requireStaff, async (req, res) => {
  try {
    const { rfid_card_id } = req.params;
    
    const user = await User.findByRfidCardId(rfid_card_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.is_active) {
      return res.status(400).json({
        success: false,
        message: 'User account is inactive'
      });
    }
    
    const wallet = await Wallet.findByUserId(user.id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const balance = await wallet.getBalance();
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          rfid_card_id: user.rfid_card_id,
          first_name: user.first_name,
          last_name: user.last_name,
          student_id: user.student_id
        },
        wallet: {
          balance
        }
      }
    });
  } catch (error) {
    console.error('Get wallet by RFID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet',
      error: error.message
    });
  }
});

// Process payment (deduct from wallet)
router.post('/payment', verifyToken, requireStaff, async (req, res) => {
  try {
    const { rfid_card_id, amount, description, reference_id } = req.body;
    
    if (!rfid_card_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'RFID card ID and amount are required'
      });
    }
    
    const user = await User.findByRfidCardId(rfid_card_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.is_active) {
      return res.status(400).json({
        success: false,
        message: 'User account is inactive'
      });
    }
    
    const wallet = await Wallet.findByUserId(user.id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const result = await wallet.deductMoney(
      amount,
      description || `Payment processed by ${req.user.first_name} ${req.user.last_name}`,
      reference_id
    );
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        ...result,
        user: {
          id: user.id,
          rfid_card_id: user.rfid_card_id,
          first_name: user.first_name,
          last_name: user.last_name
        }
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment failed',
      error: error.message
    });
  }
});

module.exports = router;
