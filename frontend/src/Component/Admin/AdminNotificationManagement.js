import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FaBell, FaEyeSlash, FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaMailBulk } from 'react-icons/fa';
import './AdminNotificationManagement.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function AdminNotificationManagement() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ userId: '', title: '', message: '', broadcast: false, visible: true });
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE}/notifications/admin`);
      setList(res.data.notifications || []);
    } catch (e) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => list.filter(n => (
    (n.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (n.message || '').toLowerCase().includes(search.toLowerCase())
  )), [list, search]);

  const openCreate = () => { setEditingId(null); setForm({ userId: '', title: '', message: '', broadcast: false, visible: true }); setShowForm(true); };
  const openEdit = (n) => { setEditingId(n._id); setForm({ userId: n.userId || '', title: n.title, message: n.message, broadcast: !n.userId, visible: n.visible !== false }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/notifications/admin/${editingId}`, { title: form.title, message: form.message, visible: form.visible });
      } else {
        await axios.post(`${API_BASE}/notifications`, { userId: form.broadcast ? null : (form.userId || null), type: 'custom', title: form.title, message: form.message, visible: form.visible });
      }
      setShowForm(false);
      await load();
      try { window.dispatchEvent(new Event('notificationsUpdated')); } catch {}
    } catch (e) { setError('Save failed'); }
  };

  const toggleVisible = async (n) => {
    try {
      await axios.put(`${API_BASE}/notifications/admin/${n._id}`, { visible: !n.visible });
      await load();
    } catch (e) { setError('Toggle failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await axios.delete(`${API_BASE}/notifications/admin/${id}`);
      await load();
      try { window.dispatchEvent(new Event('notificationsUpdated')); } catch {}
    } catch (e) { setError('Delete failed'); }
  };

  return (
    <div className="admin-notification-management">
      <div className="inquiry-header">
        <div className="header-content">
          <h2><FaBell /> Notification Management</h2>
          <p>Create, edit, delete and toggle visibility of notifications</p>
        </div>
        <div className="action-buttons">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input className="search-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}><FaMailBulk />Create Notification</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Audience</th>
                <th>Title</th>
                <th>Message</th>
                <th>Visible</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => (
                <tr key={n._id}>
                  <td>{n.userId ? `User ${n.userId}` : 'Broadcast'}</td>
                  <td>{n.title}</td>
                  <td>{n.message}</td>
                  <td>{n.visible !== false ? 'Visible' : 'Hidden'}</td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" title="Edit" onClick={() => openEdit(n)}><FaEdit /></button>
                      <button className="btn-delete" title="Delete" onClick={() => remove(n._id)}><FaTrash /></button>
                      <button className="btn-view" title={n.visible !== false ? 'Hide' : 'Show'} onClick={() => toggleVisible(n)}>
                        {n.visible !== false ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Notification' : 'New Notification'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="inquiry-form">
              {!editingId && (
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={form.broadcast} onChange={(e) => setForm({ ...form, broadcast: e.target.checked })} style={{ marginRight: 8 }} />
                    Broadcast to all users
                  </label>
                </div>
              )}
              {!editingId && !form.broadcast && (
                <div className="form-group">
                  <label>User ID</label>
                  <input className="form-control" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="Enter user ID" />
                </div>
              )}
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control" required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <select className="form-control" value={form.visible ? 'true' : 'false'} onChange={(e) => setForm({ ...form, visible: e.target.value === 'true' })}>
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">{editingId ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotificationManagement;


