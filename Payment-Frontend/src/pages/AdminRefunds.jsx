import React, { useEffect, useState } from 'react';
import { api } from '../api';
import '../components/AdminPayments.css';


const AUTH = { headers: { Authorization: 'Bearer admin-secret-token' } };

export default function AdminRefunds() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/refunds${status ? `?status=${status}` : ''}`, AUTH);
      setRows(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const decide = async (id, action) => {
    const amount = action === 'approve' ? prompt('Refund amount (USD):', '') : undefined;
    try {
      await api.patch(`/api/refunds/${id}`, { action, amount: amount ? Number(amount) : undefined }, AUTH);
      await load();
      alert(`Refund ${action}d`);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="admin-body">
      <div className="dashboard-overview">
        <div className="dashboard-header"><h2>Admin · Refund Requests</h2></div>

        <div className="quick-actions">
          <div className="action-buttons" style={{ gridTemplateColumns: '300px 150px' }}>
            <select value={status} onChange={e => setStatus(e.target.value)} className="search-input">
              <option value="">All Statuses</option>
              <option>Requested</option>
              <option>Processing</option>
              <option>Approved</option>
              <option>Refunded</option>
              <option>Denied</option>
              <option>Failed</option>
            </select>
            <button onClick={load} className="btn-add">Refresh</button>
          </div>
        </div>

        {loading ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--ayurvedic-sage)', fontWeight: 600 }}>Loading…</p> : (
          <div className="quick-actions">
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Requested At</th>
                    <th>User</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Decision</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r._id}>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>{r.userEmail}</td>
                      <td>
                        {r.paymentId?.packageType || '-'}
                        <div style={{ fontSize: 12, color: 'var(--ayurvedic-sage)' }}>
                          ${r.paymentId?.amount?.toFixed?.(2)} · {r.paymentId?._id?.slice(-6)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>${Number(r.amount).toFixed(2)}</td>
                      <td>{r.reason}{r.note ? ` — ${r.note}` : ''}</td>
                      <td>{r.status}</td>
                      <td style={{ fontSize: 12 }}>
                        {r.decisionBy ? `${r.decisionBy} @ ${new Date(r.decisionAt).toLocaleString()}` : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-edit"
                                disabled={r.status !== 'Requested'}
                                onClick={() => decide(r._id, 'approve')}>
                          Approve
                        </button>
                        <button className="btn-delete"
                                disabled={r.status !== 'Requested'}
                                onClick={() => decide(r._id, 'deny')}>
                          Deny
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>No refunds</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
