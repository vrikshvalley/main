'use client';

import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '@/lib/services/adminService';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { X, Upload, Loader } from 'lucide-react';
import '@/styles/adminProductModal.scss';

export default function AdminProductModal({ product, onClose }) {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    subcategories: [],
    price: '',
    priceType: 'fixed',
    quantity: 0,
    stock_status: 'in_stock',
    image: '',
    images: [],
    sizes: [],
    colors: [],
    tags: [],
    featured: false,
    rating: 0,
    reviews_count: 0
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        category: product.category || '',
        subcategories: product.subcategories || [],
        price: product.price || '',
        priceType: product.priceType || 'fixed',
        quantity: product.quantity || 0,
        stock_status: product.stock_status || 'in_stock',
        image: product.image || '',
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        tags: product.tags || [],
        featured: product.featured || false,
        rating: product.rating || 0,
        reviews_count: product.reviews_count || 0
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayInput = (name, value) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [name]: array }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloud || !preset) {
      showErrorToast('Cloudinary not configured');
      return;
    }

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload
        }
      );

      const result = await res.json();
      
      if (result.secure_url) {
        setFormData(prev => ({
          ...prev,
          image: result.secure_url,
          images: [result.secure_url, ...prev.images]
        }));
        showSuccessToast('Image uploaded successfully');
      } else {
        showErrorToast('Image upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showErrorToast('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        ...formData,
        price: formData.priceType === 'custom' ? 'Price on Customization' : parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0
      };

      let result;
      if (isEditing) {
        result = await updateProduct(product.id, productData);
      } else {
        result = await createProduct(productData);
      }

      if (result.success) {
        showSuccessToast(isEditing ? 'Product updated successfully' : 'Product created successfully');
        onClose();
      } else {
        showErrorToast(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Save error:', error);
      showErrorToast('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="form-scroll">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Enter product name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="slug">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="product-slug"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Category & Classification */}
            <div className="form-section">
              <h3>Category & Classification</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Indoor Plants">Indoor Plants</option>
                    <option value="Outdoor Plants">Outdoor Plants</option>
                    <option value="Succulents">Succulents</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Pots">Pots</option>
                    <option value="Tools">Tools</option>
                    <option value="Fertilizers">Fertilizers</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="stock_status">Stock Status *</label>
                  <select
                    id="stock_status"
                    name="stock_status"
                    value={formData.stock_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="on_backorder">On Backorder</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subcategories">Subcategories (comma-separated)</label>
                <input
                  type="text"
                  id="subcategories"
                  value={formData.subcategories.join(', ')}
                  onChange={(e) => handleArrayInput('subcategories', e.target.value)}
                  placeholder="e.g., Low Light, Air Purifying"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleArrayInput('tags', e.target.value)}
                  placeholder="e.g., bestseller, new arrival"
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="form-section">
              <h3>Pricing & Inventory</h3>
              
              <div className="form-group">
                <label>Price Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priceType"
                      value="fixed"
                      checked={formData.priceType === 'fixed'}
                      onChange={handleChange}
                    />
                    Fixed Price
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priceType"
                      value="custom"
                      checked={formData.priceType === 'custom'}
                      onChange={handleChange}
                    />
                    Custom Pricing
                  </label>
                </div>
              </div>

              {formData.priceType === 'fixed' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price (₹) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required={formData.priceType === 'fixed'}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity">Quantity *</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {formData.priceType === 'custom' && (
                <div className="custom-price-info">
                  <p>Product will show "Price on Customization" with contact option</p>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="form-section">
              <h3>Images</h3>
              
              <div className="form-group">
                <label htmlFor="image-upload">Upload Image</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <div className="upload-button">
                    {uploading ? (
                      <>
                        <Loader size={20} className="spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Choose Image
                      </>
                    )}
                  </div>
                </div>
              </div>

              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Product" />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="image">Image URL (or upload above)</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Variations */}
            <div className="form-section">
              <h3>Variations</h3>
              
              <div className="form-group">
                <label htmlFor="sizes">Sizes (comma-separated)</label>
                <input
                  type="text"
                  id="sizes"
                  value={formData.sizes.join(', ')}
                  onChange={(e) => handleArrayInput('sizes', e.target.value)}
                  placeholder="e.g., Small, Medium, Large"
                />
              </div>

              <div className="form-group">
                <label htmlFor="colors">Colors (comma-separated)</label>
                <input
                  type="text"
                  id="colors"
                  value={formData.colors.join(', ')}
                  onChange={(e) => handleArrayInput('colors', e.target.value)}
                  placeholder="e.g., Green, Brown, White"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="form-section">
              <h3>Additional Options</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="admin-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving || uploading}>
              {saving ? (
                <>
                  <Loader size={16} className="spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
