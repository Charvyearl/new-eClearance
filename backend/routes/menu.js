const express = require('express');
const router = express.Router();
const { MenuCategory, MenuItem } = require('../models/Menu');
const Product = require('../models/Product');
const { verifyToken, requireStaff, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { menuSchemas, productSchemas } = require('../utils/validation');

// Get full menu (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const menu = await MenuItem.getFullMenu();
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get menu',
      error: error.message
    });
  }
});

// Get menu items with filters
router.get('/items', optionalAuth, async (req, res) => {
  try {
    const options = {
      category_id: req.query.category_id ? parseInt(req.query.category_id) : undefined,
      available_only: req.query.available_only !== 'false',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };
    
    const items = await MenuItem.findAll(options);
    
    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: options.page,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get menu items',
      error: error.message
    });
  }
});

// Search menu items
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const options = {
      category_id: req.query.category_id ? parseInt(req.query.category_id) : undefined,
      available_only: req.query.available_only !== 'false',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const items = await MenuItem.search(searchTerm, options);
    
    res.json({
      success: true,
      data: {
        items,
        search_term: searchTerm,
        pagination: {
          page: options.page,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    console.error('Search menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Get menu categories
router.get('/categories', optionalAuth, async (req, res) => {
  try {
    const activeOnly = req.query.active_only !== 'false';
    const categories = await MenuCategory.findAll(activeOnly);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
});

// Get single menu item
router.get('/items/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    const category = await item.getCategory();
    
    res.json({
      success: true,
      data: {
        ...item,
        category: category ? {
          id: category.id,
          name: category.name,
          description: category.description
        } : null
      }
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get menu item',
      error: error.message
    });
  }
});

// Create menu category (staff/admin only)
router.post('/categories', verifyToken, requireStaff, validate(menuSchemas.createCategory), async (req, res) => {
  try {
    const category = await MenuCategory.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Update menu category (staff/admin only)
router.put('/categories/:id', verifyToken, requireStaff, validate(menuSchemas.createCategory), async (req, res) => {
  try {
    const { id } = req.params;
    const category = await MenuCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await category.update(req.body);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// Delete menu category (staff/admin only)
router.delete('/categories/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await MenuCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await category.delete();
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// Create menu item (staff/admin only)
router.post('/items', verifyToken, requireStaff, validate(menuSchemas.createItem), async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message
    });
  }
});

// Update menu item (staff/admin only)
router.put('/items/:id', verifyToken, requireStaff, validate(menuSchemas.updateItem), async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    await item.update(req.body);
    
    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
});

// Toggle menu item availability (staff/admin only)
router.patch('/items/:id/availability', verifyToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    await item.toggleAvailability();
    
    res.json({
      success: true,
      message: `Menu item ${item.is_available ? 'made available' : 'made unavailable'}`,
      data: {
        id: item.id,
        name: item.name,
        is_available: item.is_available
      }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle availability',
      error: error.message
    });
  }
});

// Delete menu item (staff/admin only)
router.delete('/items/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    await item.delete();
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
});

// Products (Canteen Staff)
router.post('/products', verifyToken, requireStaff, validate(productSchemas.create), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
});

router.get('/products', optionalAuth, async (req, res) => {
  try {
    const { category, available_only } = req.query;
    const items = await Product.findAll({ category, available_only: available_only !== 'false' });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ success: false, message: 'Failed to list products', error: error.message });
  }
});

router.get('/products/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to get product', error: error.message });
  }
});

router.put('/products/:id', verifyToken, requireStaff, validate(productSchemas.update), async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
    await item.update(req.body);
    res.json({ success: true, message: 'Product updated', data: item });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
});

router.patch('/products/:id/availability', verifyToken, requireStaff, async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
    await item.toggleAvailability();
    res.json({ success: true, data: { product_id: item.product_id, is_available: item.is_available } });
  } catch (error) {
    console.error('Toggle product availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle availability', error: error.message });
  }
});

router.delete('/products/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
    await item.delete();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;
