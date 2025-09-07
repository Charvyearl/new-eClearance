const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Get user's transactions
router.get('/my-transactions', verifyToken, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      transactionType: req.query.type,
      status: req.query.status
    };
    
    const transactions = await Transaction.findByUserId(req.user.id, options);
    
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
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
});

// Get all transactions (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      transactionType: req.query.type,
      status: req.query.status,
      userId: req.query.user_id
    };
    
    const transactions = await Transaction.findAll(options);
    
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
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
});

// Get transaction by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if user can access this transaction
    if (req.user.user_type !== 'admin' && transaction.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const details = await transaction.getDetails();
    
    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction',
      error: error.message
    });
  }
});

// Get transaction statistics (admin only)
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    const options = {
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      transactionType: req.query.type,
      userId: req.query.user_id
    };
    
    const statistics = await Transaction.getStatistics(options);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get transaction statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction statistics',
      error: error.message
    });
  }
});

// Get daily transaction summary (admin only)
router.get('/stats/daily/:date', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const summary = await Transaction.getDailySummary(date);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get daily summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily summary',
      error: error.message
    });
  }
});

// Update transaction status (admin only)
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, completed, failed, cancelled)'
      });
    }
    
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    await transaction.updateStatus(status);
    
    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: {
        id: transaction.id,
        transaction_id: transaction.transaction_id,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status',
      error: error.message
    });
  }
});

// Get transaction by transaction ID
router.get('/transaction/:transaction_id', verifyToken, async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const transaction = await Transaction.findByTransactionId(transaction_id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if user can access this transaction
    if (req.user.user_type !== 'admin' && transaction.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const details = await transaction.getDetails();
    
    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction',
      error: error.message
    });
  }
});

module.exports = router;
