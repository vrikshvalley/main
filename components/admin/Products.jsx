'use client';

import { useEffect, useState } from 'react';
import { ref, get, query, orderByChild, limitToFirst, remove, update } from 'firebase/database';
import { realtimeDb } from '@/lib/firebaseConfig';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import "@/styles/adminProducts.scss";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({});
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const productsRef = ref(realtimeDb, 'products');
      const snapshot = await get(productsRef);
      
      if (snapshot.exists()) {
        const productsData = [];
        snapshot.forEach((childSnapshot) => {
          productsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Sort by created_at if available
        productsData.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        
        setProducts(productsData);
        setHasNext(productsData.length === limit);
      } else {
        setProducts([]);
        setHasNext(false);
      }
    } catch (error) {
      console.error('Fetch products error', error);
      showErrorToast('Failed to fetch products');
      setProducts([]);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      const productRef = ref(realtimeDb, `products/${id}`);
      await remove(productRef);
      showSuccessToast('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      showErrorToast('Delete failed');
    }
  }

  function handleOpenEdit(p) {
    setEditingProduct(p);
    setForm({
      name: p.name || '',
      category: p.category || '',
      price: p.price ?? '',
      quantity: p.quantity ?? '',
      featured: !!p.featured,
      feature_section: p.feature_section || '',
      description: p.description || '',
      image: p.image || '',
      size: Array.isArray(p.size) ? p.size.join(', ') : (p.size || ''),
      color: Array.isArray(p.color) ? p.color.join(', ') : (p.color || ''),
    });
  }

  function handleCloseEdit() {
    setEditingProduct(null);
    setForm({});
    setImgUploading(false);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      alert('Cloudinary not configured. Set env vars.');
      return;
    }

    try {
      setImgUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.secure_url) {
        setForm((s) => ({ ...s, image: result.secure_url }));
      } else {
        console.error('Cloudinary upload failed', result);
        alert('Image upload failed');
      }
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload error');
    } finally {
      setImgUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editingProduct) return;

    const updatePayload = {
      name: form.name,
      category: form.category,
      price: form.price ? parseFloat(form.price) : 0,
      stock: form.quantity ? parseInt(form.quantity) : 0,
      featured: !!form.featured,
      feature_section: form.feature_section || null,
      description: form.description || null,
      image: form.image || null,
      sizes: form.size ? form.size.split(',').map((s) => s.trim()).filter(Boolean) : [],
      colors: form.color ? form.color.split(',').map((c) => c.trim()).filter(Boolean) : [],
      updated_at: new Date().toISOString(),
    };

    try {
      const productRef = ref(realtimeDb, `products/${editingProduct.id}`);
      await update(productRef, updatePayload);
      showSuccessToast('Product updated successfully');
      handleCloseEdit();
      fetchProducts();
    } catch (error) {
      console.error('Update error', error);
      showErrorToast('Update failed');
    }
  }

  return (
    <div className="products-list-admin">
      <h2>Products</h2>

      <div className="list">
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="product-item">
              <div className="left">
                <img className="thumb" src={p.image || '/placeholder.png'} alt={p.name} />
              </div>

              <div className="middle">
                <div className="title">{p.name}</div>
                <div className="meta">
                  <span className="cat">{p.category}</span>
                  <span className="price">₹{typeof p.price === 'number' ? p.price : 0}</span>
                  <span className={`status ${p.quantity <= 0 ? 'out' : 'in'}`}>
                    {p.quantity <= 0 ? 'Out of stock' : `Qty: ${p.quantity}`}
                  </span>
                </div>
              </div>

              <div className="right">
                <button className="btn edit" onClick={() => handleOpenEdit(p)}>Edit</button>
                <button className="btn delete" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => hasNext && setPage((s) => s + 1)} disabled={!hasNext}>Next</button>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="edit-modal">
          <div className="modal-backdrop" onClick={handleCloseEdit} />
          <div className="modal-content" role="dialog" aria-modal="true">
            <h3>Edit Product</h3>
            <form onSubmit={handleSave} className="edit-form">
              <label>
                Name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>

              <label>
                Category
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </label>

              <div className="row">
                <label>
                  Price
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </label>

                <label>
                  Quantity
                  <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                </label>
              </div>

              <label className="checkbox">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>

              <label>
                Feature Section
                <input value={form.feature_section} onChange={(e) => setForm({ ...form, feature_section: e.target.value })} />
              </label>

              <label>
                Description
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>

              <label>
                Image (current preview below)
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>

              <div className="image-preview">
                {imgUploading ? <em>Uploading...</em> : (form.image ? <img src={form.image} alt="preview" /> : <em>No image</em>)}
              </div>

              <label>
                Size (comma separated)
                <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </label>

              <label>
                Color (comma separated)
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn cancel" onClick={handleCloseEdit}>Cancel</button>
                <button type="submit" className="btn save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}