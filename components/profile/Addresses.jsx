"use client";
import React, { useState } from 'react';
import Button from '@/components/general/Button';
import { showErrorToast, showSuccessToast } from '@/lib/toastHelpers';

export default function Addresses({ addresses = [], onAdd, onEdit, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ line1: '', line2: '', locality: '', pincode: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.line1 || !form.locality || !/^[0-9]{6}$/.test(form.pincode)) {
      showErrorToast('Please complete address fields correctly');
      return;
    }
    const newAddress = { ...form, id: Date.now() };
    const res = await onAdd(newAddress);
    if (res?.error) return showErrorToast('Could not add address');
    showSuccessToast('Address added');
    setForm({ line1: '', line2: '', locality: '', pincode: '' });
    setAdding(false);
  };

  return (
    <section className="addresses card">
      <div className="section-header">
        <h3>My Addresses</h3>
        <Button variant="primary" size="sm" onClick={() => setAdding(true)}>+ Add</Button>
      </div>

      <div className="addresses-list">
        {addresses && addresses.length > 0 ? (
          addresses.map(a => (
            <div className="address-card" key={a.id}>
              <div>
                <p className="line1">{a.line1}</p>
                {a.line2 && <p className="line2">{a.line2}</p>}
                <p className="meta">{a.locality} • {a.pincode}</p>
              </div>
              <div className="address-actions">
                <Button variant="secondary" size="sm" onClick={() => onEdit(a)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(a.id)}>Delete</Button>
              </div>
            </div>
          ))
        ) : (
          <p className="muted">No addresses saved yet.</p>
        )}
      </div>

      {adding && (
        <form className="address-form" onSubmit={handleSubmit}>
          <input placeholder="Line 1 (House, Street)" value={form.line1} onChange={e => setForm({...form, line1: e.target.value})} required />
          <input placeholder="Line 2 (Optional)" value={form.line2} onChange={e => setForm({...form, line2: e.target.value})} />
          <input placeholder="Locality / Area" value={form.locality} onChange={e => setForm({...form, locality: e.target.value})} required />
          <input placeholder="Pincode" value={form.pincode} maxLength={6} onChange={e => setForm({...form, pincode: e.target.value.replace(/[^0-9]/g,'')})} required />
          <div className="form-actions">
            <Button type="button" variant="ghost" size="md" onClick={() => setAdding(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md">Save</Button>
          </div>
        </form>
      )}
    </section>
  );
}
