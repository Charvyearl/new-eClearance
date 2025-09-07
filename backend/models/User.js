const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.rfid_card_id = data.rfid_card_id;
    this.student_id = data.student_id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.user_type = data.user_type;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO users (rfid_card_id, student_id, first_name, last_name, email, phone, user_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.rfid_card_id,
          userData.student_id || null,
          userData.first_name,
          userData.last_name,
          userData.email || null,
          userData.phone || null,
          userData.user_type || 'student'
        ]
      );

      // Create wallet for the user
      await pool.execute(
        'INSERT INTO wallets (user_id, balance) VALUES (?, ?)',
        [result.insertId, 0.00]
      );

      return await User.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by RFID card ID
  static async findByRfidCardId(rfidCardId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE rfid_card_id = ?',
        [rfidCardId]
      );
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by student ID
  static async findByStudentId(studentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE student_id = ?',
        [studentId]
      );
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users with pagination
  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, user_type, is_active } = options;
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      
      if (user_type) {
        query += ' AND user_type = ?';
        params.push(user_type);
      }
      
      if (is_active !== undefined) {
        query += ' AND is_active = ?';
        params.push(is_active);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await pool.execute(query, params);
      return rows.map(row => new User(row));
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async update(updateData) {
    try {
      const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'is_active'];
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      values.push(this.id);
      
      await pool.execute(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      
      // Refresh user data
      const updatedUser = await User.findById(this.id);
      Object.assign(this, updatedUser);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete user (soft delete by setting is_active to false)
  async delete() {
    try {
      await pool.execute(
        'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [this.id]
      );
      this.is_active = false;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Get user's wallet
  async getWallet() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM wallets WHERE user_id = ?',
        [this.id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Get user's recent transactions
  async getTransactions(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.*, tt.name as transaction_type_name 
         FROM transactions t 
         JOIN transaction_types tt ON t.transaction_type_id = tt.id 
         WHERE t.user_id = ? 
         ORDER BY t.created_at DESC 
         LIMIT ?`,
        [this.id, limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user's orders
  async getOrders(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT o.*, 
         COUNT(oi.id) as item_count,
         SUM(oi.total_price) as total_amount
         FROM orders o 
         LEFT JOIN order_items oi ON o.id = oi.order_id 
         WHERE o.user_id = ? 
         GROUP BY o.id
         ORDER BY o.created_at DESC 
         LIMIT ?`,
        [this.id, limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user's reservations
  async getReservations(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, mi.name as menu_item_name, mi.price 
         FROM reservations r 
         JOIN menu_items mi ON r.menu_item_id = mi.id 
         WHERE r.user_id = ? 
         ORDER BY r.reservation_date DESC, r.created_at DESC 
         LIMIT ?`,
        [this.id, limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user profile with wallet and recent activity
  async getProfile() {
    try {
      const wallet = await this.getWallet();
      const recentTransactions = await this.getTransactions(5);
      const recentOrders = await this.getOrders(5);
      
      return {
        user: {
          id: this.id,
          rfid_card_id: this.rfid_card_id,
          student_id: this.student_id,
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          phone: this.phone,
          user_type: this.user_type,
          is_active: this.is_active,
          created_at: this.created_at
        },
        wallet,
        recent_transactions: recentTransactions,
        recent_orders: recentOrders
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
