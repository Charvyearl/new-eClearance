const { pool } = require('../config/database');

class MenuCategory {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new category
  static async create(categoryData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO menu_categories (name, description) VALUES (?, ?)',
        [categoryData.name, categoryData.description || null]
      );
      return await MenuCategory.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Find category by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM menu_categories WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? new MenuCategory(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all categories
  static async findAll(activeOnly = true) {
    try {
      let query = 'SELECT * FROM menu_categories';
      const params = [];
      
      if (activeOnly) {
        query += ' WHERE is_active = TRUE';
      }
      
      query += ' ORDER BY name ASC';
      
      const [rows] = await pool.execute(query, params);
      return rows.map(row => new MenuCategory(row));
    } catch (error) {
      throw error;
    }
  }

  // Update category
  async update(updateData) {
    try {
      const allowedFields = ['name', 'description', 'is_active'];
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
        `UPDATE menu_categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      
      const updatedCategory = await MenuCategory.findById(this.id);
      Object.assign(this, updatedCategory);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete category (soft delete)
  async delete() {
    try {
      await pool.execute(
        'UPDATE menu_categories SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [this.id]
      );
      this.is_active = false;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Get items in this category
  async getItems(availableOnly = true) {
    try {
      let query = 'SELECT * FROM menu_items WHERE category_id = ?';
      const params = [this.id];
      
      if (availableOnly) {
        query += ' AND is_available = TRUE AND is_active = TRUE';
      }
      
      query += ' ORDER BY name ASC';
      
      const [rows] = await pool.execute(query, params);
      return rows.map(row => new MenuItem(row));
    } catch (error) {
      throw error;
    }
  }
}

class MenuItem {
  constructor(data) {
    this.id = data.id;
    this.category_id = data.category_id;
    this.name = data.name;
    this.description = data.description;
    this.price = parseFloat(data.price);
    this.image_url = data.image_url;
    this.is_available = data.is_available;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new menu item
  static async create(itemData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO menu_items (category_id, name, description, price, stock, image_url, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          itemData.category_id,
          itemData.name,
          itemData.description || null,
          itemData.price,
          itemData.stock ?? 0,
          itemData.image_url || null,
          itemData.is_available !== undefined ? itemData.is_available : true
        ]
      );
      return await MenuItem.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Find item by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM menu_items WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? new MenuItem(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all menu items with category info
  static async findAll(options = {}) {
    try {
      const { category_id, available_only = true, page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT mi.*, mc.name as category_name 
        FROM menu_items mi 
        JOIN menu_categories mc ON mi.category_id = mc.id 
        WHERE 1=1
      `;
      const params = [];
      
      if (available_only) {
        query += ' AND mi.is_available = TRUE AND mi.is_active = TRUE';
      }
      
      if (category_id) {
        query += ' AND mi.category_id = ?';
        params.push(category_id);
      }
      
      query += ' ORDER BY mc.name ASC, mi.name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await pool.execute(query, params);
      return rows.map(row => new MenuItem(row));
    } catch (error) {
      throw error;
    }
  }

  // Search menu items
  static async search(searchTerm, options = {}) {
    try {
      const { category_id, available_only = true, page = 1, limit = 20 } = options;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT mi.*, mc.name as category_name 
        FROM menu_items mi 
        JOIN menu_categories mc ON mi.category_id = mc.id 
        WHERE (mi.name LIKE ? OR mi.description LIKE ?)
      `;
      const params = [`%${searchTerm}%`, `%${searchTerm}%`];
      
      if (available_only) {
        query += ' AND mi.is_available = TRUE AND mi.is_active = TRUE';
      }
      
      if (category_id) {
        query += ' AND mi.category_id = ?';
        params.push(category_id);
      }
      
      query += ' ORDER BY mc.name ASC, mi.name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await pool.execute(query, params);
      return rows.map(row => new MenuItem(row));
    } catch (error) {
      throw error;
    }
  }

  // Update menu item
  async update(updateData) {
    try {
      const allowedFields = ['category_id', 'name', 'description', 'price', 'stock', 'image_url', 'is_available', 'is_active'];
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
        `UPDATE menu_items SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      
      const updatedItem = await MenuItem.findById(this.id);
      Object.assign(this, updatedItem);
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete menu item (soft delete)
  async delete() {
    try {
      await pool.execute(
        'UPDATE menu_items SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [this.id]
      );
      this.is_active = false;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Toggle availability
  async toggleAvailability() {
    try {
      await pool.execute(
        'UPDATE menu_items SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [this.id]
      );
      this.is_available = !this.is_available;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Get category info
  async getCategory() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM menu_categories WHERE id = ?',
        [this.category_id]
      );
      return rows.length > 0 ? new MenuCategory(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get menu with categories and items
  static async getFullMenu() {
    try {
      const categories = await MenuCategory.findAll();
      const menu = [];
      
      for (const category of categories) {
        const items = await category.getItems();
        menu.push({
          category: {
            id: category.id,
            name: category.name,
            description: category.description
          },
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available
          }))
        });
      }
      
      return menu;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  MenuCategory,
  MenuItem
};
