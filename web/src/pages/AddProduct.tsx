import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    product_name: '',
    price: '',
    category: '',
    stock_quantity: '0',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        product_name: form.product_name,
        description: form.description || undefined,
        price: Number(form.price),
        category: form.category,
        stock_quantity: Number(form.stock_quantity),
        is_available: true
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/menu/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create product');
      navigate('/canteen');
    } catch (err) {
      console.error(err);
      alert('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="mt-1 text-sm text-gray-600">Create a new menu item for the canteen</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Product Name</label>
              <input
                value={form.product_name}
                onChange={(e)=>setForm({ ...form, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e)=>setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <input
                value={form.category}
                onChange={(e)=>setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Food, Beverage"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={form.stock_quantity}
                onChange={(e)=>setForm({ ...form, stock_quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e)=>setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>navigate(-1)} className="px-4 py-2 rounded-md border border-gray-300">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;


