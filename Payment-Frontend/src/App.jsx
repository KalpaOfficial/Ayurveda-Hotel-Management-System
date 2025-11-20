import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// pages you already have
import PaymentPage from './pages/PaymentPage.jsx';
import SuccessWrapper from './pages/SuccessWrapper.jsx';
import AdminPayments from './pages/AdminPayments.jsx';
import AdminMonthlyIncome from './pages/AdminMonthlyIncome.jsx';

// ✅ new pages you added
import MyPayments from './pages/MyPayments.jsx';
import AdminRefunds from './pages/AdminRefunds.jsx';

// (optional) a very simple 404
function NotFound() {
  return (
    <div style={{padding: 24}}>
      <h2>404 — Page not found</h2>
      <p>No route matched this URL.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* your existing routes */}
      <Route path="/" element={<Navigate to="/pay" replace />} />
      <Route path="/pay" element={<PaymentPage />} />
      <Route path="/success" element={<SuccessWrapper />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/income" element={<AdminMonthlyIncome />} />

      {/* ✅ NEW ROUTES */}
      <Route path="/my-payments" element={<MyPayments />} />
      <Route path="/admin/refunds" element={<AdminRefunds />} />

      {/* fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
