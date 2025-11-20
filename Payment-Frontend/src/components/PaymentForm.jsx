import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';

export default function PaymentForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    amount: '',
    packageType: 'Ayurvedic Wellness',
  });
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('t');
    setToken(t || '');

    if (t) {
      // fetch context from backend
      (async () => {
        try {
          const { data } = await api.get(`/api/payments/context/${t}`);
          setForm({
            name: data.name,
            email: data.email,
            amount: data.amount,
            packageType: data.packageType,
          });
          setLocked(true); // disable user edits; we're paying for a specific booking
        } catch {
          setErr('Invalid or expired checkout link');
        }
      })();
    } else {
      // old behavior (manual inputs) still works
      const pkg = params.get('packageType');
      const amt = params.get('amount');
      setForm(s => ({
        ...s,
        packageType: pkg || s.packageType,
        amount: amt ? Number(amt) : s.amount,
      }));
    }
  }, [location.search]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (token) {
        // secure: server will use context by token
        const { data } = await api.post('/api/payments/checkout', { token });
        window.location.href = data.url;
      } else {
        // legacy/manual
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          amount: Number(form.amount),
          packageType: form.packageType,
        };
        const { data } = await api.post('/api/payments/checkout', payload);
        window.location.href = data.url;
      }
    } catch (e) {
      setErr(e?.response?.data?.message || 'Unable to start payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-md">
      {token && (
        <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <p className="font-semibold">Booking payment</p>
          <p>{form.packageType} — ${form.amount}</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 w-full rounded-xl border p-2" name="name" value={form.name}
               onChange={onChange} required disabled={locked}/>
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded-xl border p-2" type="email" name="email" value={form.email}
               onChange={onChange} required disabled={locked}/>
      </div>

      <div>
        <label className="block text-sm font-medium">Amount (USD)</label>
        <input className="mt-1 w-full rounded-xl border p-2" type="number" name="amount" value={form.amount}
               onChange={onChange} min="1" required disabled={locked}/>
      </div>

      <div>
        <label className="block text-sm font-medium">Package</label>
        <select className="mt-1 w-full rounded-xl border p-2" name="packageType" value={form.packageType}
                onChange={onChange} disabled={locked}>
          <option>Ayurvedic Wellness</option>
          <option>Wellness + Sigiriya tour</option>
          <option>Wellness + Galle fort tour</option>
          <option>Ayurveda Retreat + Anuradhapura</option>
          <option>Wellness only</option>
        </select>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 disabled:opacity-60">
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}
