'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Fetch products error', error);
      setProducts([]);
      setHasNext(false);
    } else {
      setProducts(data || []);
      setHasNext((data?.length || 0) === limit);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Delete failed');
      console.error(error);
    } else {
      fetchProducts();
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
      quantity: form.quantity ? parseInt(form.quantity) : 0,
      featured: !!form.featured,
      feature_section: form.feature_section || null,
      description: form.description || null,
      image: form.image || null,
      size: form.size ? form.size.split(',').map((s) => s.trim()).filter(Boolean) : [],
      color: form.color ? form.color.split(',').map((c) => c.trim()).filter(Boolean) : [],
    };

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', editingProduct.id);

    if (error) {
      console.error('Update error', error);
      alert('Update failed');
    } else {
      handleCloseEdit();
      // refetch current page
      fetchProducts();
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
                  <span className="price">₹{p.price}</span>
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