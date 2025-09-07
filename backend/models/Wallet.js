const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Wallet {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.balance = parseFloat(data.balance);
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Find wallet by user ID
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM wallets WHERE user_id = ?',
        [userId]
      );
      return rows.length > 0 ? new Wallet(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get wallet balance
  async getBalance() {
    try {
      const [rows] = await pool.execute(
        'SELECT balance FROM wallets WHERE user_id = ?',
        [this.user_id]
      );
      return rows.length > 0 ? parseFloat(rows[0].balance) : 0;
    } catch (error) {
      throw error;
    }
  }

  // Add money to wallet (top-up)
  async addMoney(amount, description = 'Top-up', referenceId = null) {
    try {
      await pool.execute('START TRANSACTION');
      
      // Get current balance
      const [walletRows] = await pool.execute(
        'SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE',
        [this.user_id]
      );
      
      if (walletRows.length === 0) {
        throw new Error('Wallet not found');
      }
      
      const currentBalance = parseFloat(walletRows[0].balance);
      const newBalance = currentBalance + amount;
      
      // Update wallet balance
      await pool.execute(
        'UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newBalance, this.user_id]
      );
      
      // Create transaction record
      const transactionId = uuidv4();
      const [transactionTypeRows] = await pool.execute(
        'SELECT id FROM transaction_types WHERE name = ?',
        ['top_up']
      );
      
      if (transactionTypeRows.length === 0) {
        throw new Error('Transaction type not found');
      }
      
      await pool.execute(
        `INSERT INTO transactions (transaction_id, user_id, transaction_type_id, amount, 
         balance_before, balance_after, description, reference_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          this.user_id,
          transactionTypeRows[0].id,
          amount,
          currentBalance,
          newBalance,
          description,
          referenceId,
          'completed'
        ]
      );
      
      await pool.execute('COMMIT');
      
      this.balance = newBalance;
      return {
        transaction_id: transactionId,
        amount,
        balance_before: currentBalance,
        balance_after: newBalance
      };
    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }
  }

  // Deduct money from wallet (purchase)
  async deductMoney(amount, description = 'Purchase', referenceId = null) {
    try {
      await pool.execute('START TRANSACTION');
      
      // Get current balance
      const [walletRows] = await pool.execute(
        'SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE',
        [this.user_id]
      );
      
      if (walletRows.length === 0) {
        throw new Error('Wallet not found');
      }
      
      const currentBalance = parseFloat(walletRows[0].balance);
      
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      const newBalance = currentBalance - amount;
      
      // Update wallet balance
      await pool.execute(
        'UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newBalance, this.user_id]
      );
      
      // Create transaction record
      const transactionId = uuidv4();
      const [transactionTypeRows] = await pool.execute(
        'SELECT id FROM transaction_types WHERE name = ?',
        ['purchase']
      );
      
      if (transactionTypeRows.length === 0) {
        throw new Error('Transaction type not found');
      }
      
      await pool.execute(
        `INSERT INTO transactions (transaction_id, user_id, transaction_type_id, amount, 
         balance_before, balance_after, description, reference_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          this.user_id,
          transactionTypeRows[0].id,
          amount,
          currentBalance,
          newBalance,
          description,
          referenceId,
          'completed'
        ]
      );
      
      await pool.execute('COMMIT');
      
      this.balance = newBalance;
      return {
        transaction_id: transactionId,
        amount,
        balance_before: currentBalance,
        balance_after: newBalance
      };
    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }
  }

  // Transfer money to another user
  async transferMoney(recipientRfid, amount, description = 'Transfer') {
    try {
      await pool.execute('START TRANSACTION');
      
      // Find recipient user
      const [recipientRows] = await pool.execute(
        'SELECT id FROM users WHERE rfid_card_id = ? AND is_active = TRUE',
        [recipientRfid]
      );
      
      if (recipientRows.length === 0) {
        throw new Error('Recipient not found or inactive');
      }
      
      const recipientId = recipientRows[0].id;
      
      // Get sender's current balance
      const [senderWalletRows] = await pool.execute(
        'SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE',
        [this.user_id]
      );
      
      if (senderWalletRows.length === 0) {
        throw new Error('Sender wallet not found');
      }
      
      const senderBalance = parseFloat(senderWalletRows[0].balance);
      
      if (senderBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Get recipient's current balance
      const [recipientWalletRows] = await pool.execute(
        'SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE',
        [recipientId]
      );
      
      if (recipientWalletRows.length === 0) {
        throw new Error('Recipient wallet not found');
      }
      
      const recipientBalance = parseFloat(recipientWalletRows[0].balance);
      
      // Update balances
      await pool.execute(
        'UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [senderBalance - amount, this.user_id]
      );
      
      await pool.execute(
        'UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [recipientBalance + amount, recipientId]
      );
      
      // Create transaction records
      const transactionId = uuidv4();
      const [transactionTypeRows] = await pool.execute(
        'SELECT id FROM transaction_types WHERE name = ?',
        ['purchase'] // Using purchase type for transfers
      );
      
      // Sender transaction (deduction)
      await pool.execute(
        `INSERT INTO transactions (transaction_id, user_id, transaction_type_id, amount, 
         balance_before, balance_after, description, reference_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          this.user_id,
          transactionTypeRows[0].id,
          amount,
          senderBalance,
          senderBalance - amount,
          `Transfer to ${recipientRfid}: ${description}`,
          recipientId,
          'completed'
        ]
      );
      
      // Recipient transaction (addition)
      await pool.execute(
        `INSERT INTO transactions (transaction_id, user_id, transaction_type_id, amount, 
         balance_before, balance_after, description, reference_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          recipientId,
          transactionTypeRows[0].id,
          amount,
          recipientBalance,
          recipientBalance + amount,
          `Transfer from ${this.user_id}: ${description}`,
          this.user_id,
          'completed'
        ]
      );
      
      await pool.execute('COMMIT');
      
      this.balance = senderBalance - amount;
      return {
        transaction_id: transactionId,
        amount,
        recipient_rfid: recipientRfid,
        sender_balance_after: senderBalance - amount,
        recipient_balance_after: recipientBalance + amount
      };
    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(options = {}) {
    try {
      const { page = 1, limit = 20, startDate, endDate, transactionType } = options;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT t.*, tt.name as transaction_type_name 
        FROM transactions t 
        JOIN transaction_types tt ON t.transaction_type_id = tt.id 
        WHERE t.user_id = ?
      `;
      const params = [this.user_id];
      
      if (startDate) {
        query += ' AND t.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND t.created_at <= ?';
        params.push(endDate);
      }
      
      if (transactionType) {
        query += ' AND tt.name = ?';
        params.push(transactionType);
      }
      
      query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get wallet summary
  async getSummary() {
    try {
      const balance = await this.getBalance();
      const [transactionCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?',
        [this.user_id]
      );
      
      const [lastTransaction] = await pool.execute(
        `SELECT t.*, tt.name as transaction_type_name 
         FROM transactions t 
         JOIN transaction_types tt ON t.transaction_type_id = tt.id 
         WHERE t.user_id = ? 
         ORDER BY t.created_at DESC 
         LIMIT 1`,
        [this.user_id]
      );
      
      return {
        balance,
        transaction_count: transactionCount[0].count,
        last_transaction: lastTransaction[0] || null
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Wallet;
