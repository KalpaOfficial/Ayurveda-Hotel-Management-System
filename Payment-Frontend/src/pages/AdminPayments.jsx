import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import '../components/AdminPayments.css';


// tiny toast
const Toast = ({ message, type, onDismiss }) => (
  <div className={`fixed top-5 right-5 p-3 rounded-lg shadow text-white z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
    <span>{message}</span>
    <button onClick={onDismiss} className="ml-3 font-bold">×</button>
  </div>
);

export default function AdminPayments() {
  const { search } = useLocation();
  const isAdminMode = new URLSearchParams(search).get('as') === 'admin';
  const adminQS = isAdminMode ? '?as=admin' : '';

  // data + ui state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', amount: 0, packageType: '', status: 'Pending' });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [err, setErr] = useState('');

  // filters + paging
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/payments', {
        headers: { Authorization: 'Bearer admin-secret-token' },
      });
      setRows(data || []);
    } catch (e) {
      setErr('Failed to load payments');
      showToast(e?.response?.data?.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p) => {
    console.log("Editing row:", p._id);
    setEditId(p._id);
    setForm({
      name: p.name || '',
      email: p.email || '',
      amount: p.amount ?? 0,
      packageType: p.packageType || '',
      status: p.status || 'Pending',
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: '', email: '', amount: 0, packageType: '', status: 'Pending' });
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    if (!editId) return;
    setIsSaving(true);
    try {
      await api.put(`/api/payments/${editId}`, form, {
        headers: { Authorization: 'Bearer admin-secret-token' },
      });
      await load();
      cancelEdit();
      showToast('Payment updated successfully!', 'success');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Update failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this payment?')) return;
    try {
      await api.delete(`/api/payments/${id}`, {
        headers: { Authorization: 'Bearer admin-secret-token' },
      });
      setRows((s) => s.filter((r) => r._id !== id));
      showToast('Payment deleted.', 'success');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Delete failed', 'error');
    }
  };

  // helpers
  const startOfDay = (dstr) => { const d = new Date(dstr); d.setHours(0,0,0,0); return d; };
  const endOfDay   = (dstr) => { const d = new Date(dstr); d.setHours(23,59,59,999); return d; };
  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '-');

  // filter + paginate
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesText =
        (r.email || '').toLowerCase().includes(term) ||
        (r.packageType || '').toLowerCase().includes(term) ||
        (r.name || '').toLowerCase().includes(term);

      if (!fromDate && !toDate) return matchesText;

      const dt = r.paymentDate ? new Date(r.paymentDate) : null;
      if (!dt) return false;

      const afterFrom  = !fromDate || dt >= startOfDay(fromDate);
      const beforeTo   = !toDate   || dt <= endOfDay(toDate);
      return matchesText && afterFrom && beforeTo;
    });
  }, [rows, searchTerm, fromDate, toDate]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);

  const statusClasses = (s = '') => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
    const map = {
      Paid:    `${base} bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30`,
      Pending: `${base} bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30`,
      Failed:  `${base} bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30`,
      Refunded:`${base} bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30`,
    };
    return map[s] || `${base} bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30`;
  };

  return (
    <div className="admin-body">
      <div className="dashboard-overview">
        <div className="quick-actions">
          <div className="dashboard-header"><h2>Admin · Payments</h2></div>
          {/* Header actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <Link
              to={`/admin/refunds${adminQS}`}
              className="btn-edit"
              type="button"
              title="View all refund requests"
            >
              Transaction refunds
            </Link>
            <Link
              to={`/admin/income${adminQS}`}
              className="btn-edit"
              type="button"
              title="Monthly income analysis"
            >
              Income analysis
            </Link>
          </div>

          {/* Filters card */}
          <div className="quick-actions" style={{ boxShadow: 'none', border: 'none', background: 'var(--background-light)' }}>
            <div className="action-buttons">
              <input
                type="text"
                placeholder="Search by name, email or package..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="search-input"
              />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                className="search-input"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                className="search-input"
              />
              <button
                type="button"
                onClick={() => { setFromDate(''); setToDate(''); setCurrentPage(1); }}
                className="btn-back"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="quick-actions">
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Package</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p._id}>
                      <td>
                        {editId === p._id ? (
                          <input name="name" value={form.name} onChange={onChange} style={{ background: 'var(--background-light)', color: 'var(--text-primary)', border: '1px solid var(--ayurvedic-sage)', minWidth: 80 }} />
                        ) : p.name}
                      </td>
                      <td>
                        {editId === p._id ? (
                          <input name="email" value={form.email} onChange={onChange} style={{ background: 'var(--background-light)', color: 'var(--text-primary)', border: '1px solid var(--ayurvedic-sage)', minWidth: 80 }} />
                        ) : p.email}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {editId === p._id ? (
                          <input type="number" name="amount" value={form.amount} onChange={onChange} style={{ background: 'var(--background-light)', color: 'var(--text-primary)', border: '1px solid var(--ayurvedic-sage)', minWidth: 60, textAlign: 'right' }} />
                        ) : `${Number(p.amount ?? 0).toFixed(2)}`}
                      </td>
                      <td>
                        {editId === p._id ? (
                          <input name="packageType" value={form.packageType} onChange={onChange} style={{ background: 'var(--background-light)', color: 'var(--text-primary)', border: '1px solid var(--ayurvedic-sage)', minWidth: 80 }} />
                        ) : p.packageType}
                      </td>
                      <td>
                        {editId === p._id ? (
                          <select name="status" value={form.status} onChange={onChange} style={{ background: 'var(--background-light)', color: 'var(--text-primary)', border: '1px solid var(--ayurvedic-sage)' }}>
                            <option>Pending</option>
                            <option>Paid</option>
                            <option>Refunded</option>
                            <option>Failed</option>
                          </select>
                        ) : <span className={statusClasses(p.status)}>{p.status}</span>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {editId === p._id ? (
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button
                              onClick={saveEdit}
                              disabled={isSaving}
                              className="btn-add"
                            >
                              {isSaving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn-back"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button
                              onClick={() => startEdit(p)}
                              className="btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(p._id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--ayurvedic-sage)', padding: '40px 0' }}>
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={{ color: 'var(--ayurvedic-sage)', fontWeight: 600 }}>Page {page} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Toast notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}