const { pool } = require('../config/database');

class Product {
  constructor(data) {
    this.product_id = data.product_id;
    this.product_name = data.product_name;
    this.description = data.description;
    this.price = parseFloat(data.price);
    this.category = data.category;
    this.stock_quantity = data.stock_quantity;
    this.is_available = data.is_available;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO PRODUCT (product_name, description, price, category, stock_quantity, is_available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.product_name,
        data.description || null,
        data.price,
        data.category,
        data.stock_quantity ?? 0,
        data.is_available !== undefined ? data.is_available : true
      ]
    );
    return await Product.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM PRODUCT WHERE product_id = ?', [id]);
    return rows.length ? new Product(rows[0]) : null;
  }

  static async findAll(options = {}) {
    const { category, available_only } = options;
    let query = 'SELECT * FROM PRODUCT WHERE 1=1';
    const params = [];
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (available_only) {
      query += ' AND is_available = TRUE';
    }
    query += ' ORDER BY product_name ASC';
    const [rows] = await pool.execute(query, params);
    return rows.map(r => new Product(r));
  }

  static async search(searchTerm, options = {}) {
    const { category } = options;
    let query = 'SELECT * FROM PRODUCT WHERE product_name LIKE ? OR description LIKE ?';
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    query += ' ORDER BY product_name ASC';
    const [rows] = await pool.execute(query, params);
    return rows.map(r => new Product(r));
  }

  async update(updateData) {
    const allowed = ['product_name', 'description', 'price', 'category', 'stock_quantity', 'is_available'];
    const sets = [];
    const values = [];
    for (const [k, v] of Object.entries(updateData)) {
      if (allowed.includes(k) && v !== undefined) {
        sets.push(`${k} = ?`);
        values.push(v);
      }
    }
    if (sets.length === 0) throw new Error('No valid fields to update');
    values.push(this.product_id);
    await pool.execute(
      `UPDATE PRODUCT SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?`,
      values
    );
    const updated = await Product.findById(this.product_id);
    Object.assign(this, updated);
    return this;
  }

  async delete() {
    // Perform a hard delete so the product row is removed from the database.
    // Related rows in tables like order_items and reservations are configured
    // with ON DELETE CASCADE in the schema and will be cleaned up automatically.
    await pool.execute('DELETE FROM PRODUCT WHERE product_id = ?', [this.product_id]);
    return this;
  }

  async toggleAvailability() {
    await pool.execute('UPDATE PRODUCT SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?', [this.product_id]);
    this.is_available = !this.is_available;
    return this;
  }
}

module.exports = Product;


