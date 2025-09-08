import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { MenuItem, MenuCategory } from '../types';

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setCategories([
        { id: 1, name: 'Main Course', description: 'Rice, pasta, and main dishes', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 2, name: 'Beverages', description: 'Drinks and refreshments', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 3, name: 'Snacks', description: 'Light snacks and desserts', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
      ]);

      setMenuItems([
        {
          id: 1,
          category_id: 1,
          name: 'Chicken Adobo',
          description: 'Traditional Filipino chicken adobo with rice',
          price: 85.00,
          image_url: '',
          is_available: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Main Course'
        },
        {
          id: 2,
          category_id: 1,
          name: 'Beef Sinigang',
          description: 'Sour soup with beef and vegetables',
          price: 95.00,
          image_url: '',
          is_available: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Main Course'
        },
        {
          id: 3,
          category_id: 2,
          name: 'Coca Cola',
          description: 'Refreshing soft drink',
          price: 25.00,
          image_url: '',
          is_available: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Beverages'
        },
        {
          id: 4,
          category_id: 3,
          name: 'Chocolate Chip Cookie',
          description: 'Freshly baked chocolate chip cookie',
          price: 15.00,
          image_url: '',
          is_available: false,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Snacks'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        console.log('Updating menu item:', itemFormData);
      } else {
        console.log('Creating menu item:', itemFormData);
      }
      setShowItemModal(false);
      setEditingItem(null);
      resetItemForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        console.log('Updating category:', categoryFormData);
      } else {
        console.log('Creating category:', categoryFormData);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      resetCategoryForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const resetItemForm = () => {
    setItemFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: ''
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id.toString(),
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setShowItemModal(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowCategoryModal(true);
  };

  const handleToggleAvailability = async (itemId: number) => {
    try {
      console.log('Toggling availability for item:', itemId);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        console.log('Deleting menu item:', itemId);
        fetchData();
      } catch (error) {
        console.error('Failed to delete menu item:', error);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        console.log('Deleting category:', categoryId);
        fetchData();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage menu items and categories
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn btn-secondary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Category
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Menu Items ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories ({categories.length})
          </button>
        </nav>
      </div>

      {/* Menu Items Tab */}
      {activeTab === 'items' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`${
                            item.is_available 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                        >
                          {item.is_available ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => {
                  const itemCount = menuItems.filter(item => item.category_id === category.id).length;
                  return (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {itemCount} items
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="label">Item Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({...itemFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({...itemFormData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    required
                    className="input"
                    value={itemFormData.category_id}
                    onChange={(e) => setItemFormData({...itemFormData, category_id: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="input"
                    value={itemFormData.price}
                    onChange={(e) => setItemFormData({...itemFormData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Image URL (Optional)</label>
                  <input
                    type="url"
                    className="input"
                    value={itemFormData.image_url}
                    onChange={(e) => setItemFormData({...itemFormData, image_url: e.target.value})}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    className="mr-2"
                    checked={itemFormData.is_available}
                    onChange={(e) => setItemFormData({...itemFormData, is_available: e.target.checked})}
                  />
                  <label htmlFor="is_available" className="text-sm text-gray-700">
                    Available for purchase
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="label">Category Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
