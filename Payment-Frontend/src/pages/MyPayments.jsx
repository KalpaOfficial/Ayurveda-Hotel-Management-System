import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';

const ADMIN_TOKEN = 'admin-secret-token';
const USER_TOKEN  = 'user-secret-token';

// helper: within policy days
const withinPolicy = (paymentDate, days = 30) => {
  if (!paymentDate) return false;
  const diff = (Date.now() - new Date(paymentDate).getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
};

export default function MyPayments() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';
  const as = params.get('as');           // if ?as=admin -> use admin token
  const token = as === 'admin' ? ADMIN_TOKEN : USER_TOKEN;

  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [modal, setModal] = useState(null); // { payment, amount, reason, note }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const AUTH = { headers: { Authorization: `Bearer ${token}` } };

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        api.get(`/api/payments/user/${encodeURIComponent(email)}?token=${token}`, AUTH),
        api.get(`/api/refunds/mine?token=${token}`, AUTH),
      ]);
      setPayments(pRes.data || []);
      setRefunds(rRes.data || []);
      setError('');
    } catch (e) {
      console.error('Load payments/refunds error', e);
      setError('Unable to load payments. The backend might be offline or the token invalid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (email) load(); }, [email, token]);

  // index refunds by paymentId
  const refundByPayment = useMemo(() => {
    const map = {};
    refunds.forEach(r => {
      const pid = r.paymentId?._id || r.paymentId; // populate or raw id
      map[pid] = r;
    });
    return map;
  }, [refunds]);

  const openRefundModal = (p) => {
    setModal({
      payment: p,
      amount: p.amount,
      reason: 'Accidental payment',
      note: '',
    });
  };

  const submitRefund = async () => {
    if (!modal) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/refunds?token=${token}`, {
        paymentId: modal.payment._id,
        amount: Number(modal.amount),
        reason: modal.reason,
        note: modal.note,
      }, AUTH);

      setModal(null);
      await load();
      alert('Refund request submitted');
    } catch (e) {
      console.error('Refund request error', e);
      const msg = e?.response?.data?.message || 'Refund request failed';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-6">My Payments</h1>
        <div className="text-xl">No user email provided.</div>
        <p className="text-gray-600 mt-2">
          Please access this page via the "My Payments" button in the Sath Villa app.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">My Payments</h1>

      <div className="mb-4">
        <span>Showing history for: </span>
        <strong>{email}</strong>
      </div>

      {error && <div style={{ color: '#e11d48', marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-neutral-900/60 border border-neutral-700/50 shadow">
          <table className="min-w-full divide-y divide-neutral-700">
            <thead className="bg-neutral-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">Package</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-200">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">Refund</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-200">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {payments.map(p => {
                const r = refundByPayment[p._id];
                const canRefund = p.status === 'Paid' && !!p.transactionId && !r && withinPolicy(p.paymentDate, 30);
                return (
                  <tr key={p._id} className="hover:bg-neutral-800/40">
                    <td className="px-4 py-3 text-sm text-neutral-300">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-300">{p.packageType}</td>
                    <td className="px-4 py-3 text-sm text-neutral-200 text-right">
                      ${Number(p.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={
                        p.status === 'Paid'
                          ? 'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                          : p.status === 'Pending'
                          ? 'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                          : 'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30'
                      }>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-300">
                      {r ? `${r.status}${r.amount ? ` ($${r.amount})` : ''}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        disabled={!canRefund}
                        title={
                          !p.transactionId ? 'No transactionId – only Stripe-paid bookings can be refunded' :
                          p.status !== 'Paid' ? 'Only Paid transactions can be refunded' :
                          r ? 'Refund already requested' : ''
                        }
                        onClick={() => openRefundModal(p)}
                        className={`px-3 py-1 rounded ${canRefund ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-neutral-600 text-neutral-300 cursor-not-allowed'}`}
                      >
                        Request Refund
                      </button>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Refund Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow p-4 space-y-3">
            <h2 className="text-lg font-semibold">Request Refund</h2>
            <p className="text-sm text-gray-600">
              Payment: {modal.payment.packageType} — ${modal.payment.amount}
            </p>

            <label className="text-sm font-medium">Amount (USD)</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={modal.amount}
              min="0.01"
              max={modal.payment.amount}
              step="0.01"
              onChange={(e) => setModal((m) => ({ ...m, amount: e.target.value }))}
            />

            <label className="text-sm font-medium">Reason</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={modal.reason}
              onChange={(e) => setModal((m) => ({ ...m, reason: e.target.value }))}
            >
              <option>Accidental payment</option>
              <option>Service issue</option>
              <option>Duplicate charge</option>
              <option>Other</option>
            </select>

            <label className="text-sm font-medium">Note (optional)</label>
            <textarea
              className="w-full border rounded px-2 py-1"
              rows="3"
              value={modal.note}
              onChange={(e) => setModal((m) => ({ ...m, note: e.target.value }))}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white"
                disabled={submitting}
                onClick={submitRefund}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}