import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

import AIChatWidget from "../components/AIChatWidget.jsx";
import '../components/AdminPayments.css';


export default function AdminMonthlyIncome() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/payments', {
          headers: { Authorization: 'Bearer admin-secret-token' },
        });
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // group by YYYY-MM and sum amounts for Paid only
  const { monthly, kpis } = useMemo(() => {
    const map = new Map(); // key: 'YYYY-MM' -> total
    let total = 0;
    let paidCount = 0;

    for (const p of rows) {
      if (p?.status !== 'Paid') continue;
      const dt = p?.paymentDate ? new Date(p.paymentDate) : null;
      if (!dt || isNaN(dt)) continue;

      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0'); // 01..12
      const key = `${y}-${m}`;
      const amt = Number(p.amount) || 0;

      map.set(key, (map.get(key) || 0) + amt);
      total += amt;
      paidCount += 1;
    }

    const monthly = Array.from(map.entries())
      .map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const best = monthly.reduce(
      (acc, cur) => (cur.total > acc.total ? cur : acc),
      { month: '—', total: 0 }
    );

    const avg = paidCount ? total / paidCount : 0;

    return {
      monthly,
      kpis: {
        total: total.toFixed(2),
        paidCount,
        avgTicket: avg.toFixed(2),
        bestMonth: best.month,
        bestTotal: best.total.toFixed(2),
      },
    };
  }, [rows]);

  return (
    <div className="admin-body">
      <div className="dashboard-overview">
        <div className="dashboard-header"><h2>Monthly Income Analysis</h2></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <Link
            to="/admin/payments"
            className="btn-back"
            style={{ minWidth: 160 }}
          >
            ← Back to payments
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--ayurvedic-sage)', fontWeight: 600 }}>Loading…</p>
        ) : err ? (
          <p style={{ color: '#e74c3c', fontWeight: 600 }}>{err}</p>
        ) : (
          <>
            {/* KPI cards */}
            <div className="stats-grid" style={{ marginBottom: 32 }}>
              <div className="stat-card">
                <div className="stat-content">
                  <p>Total Revenue</p>
                  <h3>${kpis.total}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <p>Paid Transactions</p>
                  <h3>{kpis.paidCount}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <p>Avg. Ticket</p>
                  <h3>${kpis.avgTicket}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <p>Best Month</p>
                  <h3 style={{ color: 'var(--ayurvedic-gold)' }}>{kpis.bestMonth} — ${kpis.bestTotal}</h3>
                </div>
              </div>
            </div>

            {/* Table summary */}
            <div className="quick-actions" style={{ marginBottom: 32 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th style={{ textAlign: 'right' }}>Total (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', padding: '40px 0' }}>
                        No paid transactions found.
                      </td>
                    </tr>
                  ) : (
                    monthly.map((r) => (
                      <tr key={r.month}>
                        <td>{r.month}</td>
                        <td style={{ textAlign: 'right' }}>${r.total.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bar chart */}
            <div className="quick-actions">
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c3cfe2" />
                    <XAxis dataKey="month" stroke="var(--ayurvedic-green)" />
                    <YAxis stroke="var(--ayurvedic-green)" />
                    <Tooltip
                      contentStyle={{ background: 'var(--background-light)', border: '1px solid var(--ayurvedic-sage)', color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="total" fill="var(--ayurvedic-light-green)" barSize={42} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <AIChatWidget monthlyData={monthly} position="bottom-right" />
          </>
        )}
      </div>
    </div>
  );
}