import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundForm, setRefundForm] = useState({
    amount: '',
    reason: 'Service issue',
    note: ''
  });
  const [refundLoading, setRefundLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/signin");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadPayments(parsedUser);
  }, [navigate]);

  const loadPayments = async (currentUser) => {
    if (!currentUser || !currentUser.email) {
      setError('User email not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Try to fetch from Payment backend
      const userEmail = currentUser.email.toLowerCase();
      const response = await fetch(`http://localhost:5001/api/payments/user/${encodeURIComponent(userEmail)}?token=user-secret-token&email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': 'Bearer user-secret-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }

      const data = await response.json();
      setPayments(data || []);
    } catch (err) {
      console.error('Failed to load payment history:', err);
      setError('Unable to load payment history. The payment service might be unavailable.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      loadPayments(user);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'status-paid',
      'Pending': 'status-pending',
      'Failed': 'status-failed',
      'Refunded': 'status-refunded'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-unknown'}`}>
        {status}
      </span>
    );
  };

  const isRefundEligible = (payment) => {
    if (payment.status !== 'Paid') return false;
    if (!payment.paymentDate) return false;
    
    // Check if payment is within 30 days
    const paymentDate = new Date(payment.paymentDate);
    const now = new Date();
    const diffDays = (now - paymentDate) / (1000 * 60 * 60 * 24);
    
    return diffDays <= 30;
  };

  const handleRefundRequest = (payment) => {
    setSelectedPayment(payment);
    setRefundForm({
      amount: payment.amount.toString(),
      reason: 'Service issue',
      note: ''
    });
    setShowRefundModal(true);
  };

  const submitRefundRequest = async () => {
    if (!selectedPayment || !user) return;
    
    // Validate required fields
    if (!refundForm.note || !refundForm.note.trim()) {
      alert('❌ Additional Notes is required! Please provide details about your refund request.');
      return;
    }
    
    if (!refundForm.amount || parseFloat(refundForm.amount) <= 0) {
      alert('❌ Please enter a valid refund amount.');
      return;
    }
    
    setRefundLoading(true);
    try {
      const userEmail = user.email.toLowerCase();
      const response = await fetch(`http://localhost:5001/api/refunds?token=user-secret-token&email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer user-secret-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          amount: parseFloat(refundForm.amount),
          reason: refundForm.reason,
          note: refundForm.note.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request refund');
      }

      alert('✅ Refund request submitted successfully! We will review your request and process it within 3-5 business days.');
      setShowRefundModal(false);
      setSelectedPayment(null);
      
      // Refresh payments to show any status changes
      if (user) {
        loadPayments(user);
      }
    } catch (err) {
      console.error('Refund request failed:', err);
      alert(`Failed to submit refund request: ${err.message}`);
    } finally {
      setRefundLoading(false);
    }
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setSelectedPayment(null);
    setRefundForm({ amount: '', reason: 'Service issue', note: '' });
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="payment-history-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your payment history...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="payment-history-page">
        <div className="page-header">
          <h1 className="page-title">My Payment History</h1>
          <p className="page-subtitle">
            Welcome back, {user?.firstName}! Here's your complete payment history.
          </p>
          <div className="header-buttons">
            <button onClick={handleRefresh} className="refresh-btn">
              🔄 Refresh
            </button>
            <button onClick={() => navigate('/bookings')} className="back-btn">
              ← Back to Bookings
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="payments-container">
          {payments.length > 0 ? (
            <div className="payments-table-container">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Package/Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td className="package-cell">
                        <div className="package-name">{payment.packageType}</div>
                        {payment.packageType && payment.packageType.includes('Cart (') && (
                          <div className="cart-note">
                            <small>💳 Online purchase</small>
                          </div>
                        )}
                        {payment.packageType && payment.packageType.includes('Days') && (
                          <div className="booking-note">
                            <small>🏨 Booking package</small>
                          </div>
                        )}
                      </td>
                      <td className="amount-cell">
                        <strong>${Number(payment.amount).toFixed(2)}</strong>
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td className="transaction-cell">
                        {payment.transactionId ? (
                          <code>{payment.transactionId.substring(0, 20)}...</code>
                        ) : (
                          <span className="no-transaction">-</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        {isRefundEligible(payment) ? (
                          <button 
                            onClick={() => handleRefundRequest(payment)} 
                            className="refund-btn"
                            title="Request refund for this payment"
                          >
                            💸 Refund
                          </button>
                        ) : (
                          <span className="no-action" title={payment.status === 'Paid' ? 'Refund window expired (30+ days)' : 'Not eligible for refund'}>
                            {payment.status === 'Refunded' ? '✅ Refunded' : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-payments">
              <div className="no-payments-icon">💳</div>
              <h3>No payments yet</h3>
              <p>You haven't made any payments yet. Start shopping or book your stay!</p>
              <div className="action-buttons">
                <a href="/products" className="btn-primary">Shop Products</a>
                <a href="/add-booking" className="btn-secondary">Book Your Stay</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refund Request Modal */}
      {showRefundModal && selectedPayment && (
        <div className="modal-overlay" onClick={closeRefundModal}>
          <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Refund</h3>
              <button className="close-btn" onClick={closeRefundModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="payment-info">
                <h4>Payment Details:</h4>
                <p><strong>Package:</strong> {selectedPayment.packageType}</p>
                <p><strong>Amount:</strong> ${Number(selectedPayment.amount).toFixed(2)}</p>
                <p><strong>Date:</strong> {formatDate(selectedPayment.paymentDate)}</p>
                <p><strong>Transaction ID:</strong> {selectedPayment.transactionId || 'N/A'}</p>
              </div>

              <div className="refund-form">
                <div className="form-group">
                  <label htmlFor="refund-amount">Refund Amount (USD):</label>
                  <input
                    id="refund-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedPayment.amount}
                    value={refundForm.amount}
                    onChange={(e) => setRefundForm({...refundForm, amount: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="refund-reason">Reason for Refund:</label>
                  <select
                    id="refund-reason"
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm({...refundForm, reason: e.target.value})}
                    className="form-select"
                  >
                    <option value="Service issue">Service issue</option>
                    <option value="Accidental payment">Accidental payment</option>
                    <option value="Duplicate charge">Duplicate charge</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="refund-note">Additional Notes (Required):</label>
                  <textarea
                    id="refund-note"
                    value={refundForm.note}
                    onChange={(e) => setRefundForm({...refundForm, note: e.target.value})}
                    className="form-textarea"
                    placeholder="Please provide details about your refund request (required)..."
                    rows="3"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={closeRefundModal} 
                className="btn-cancel"
                disabled={refundLoading}
              >
                Cancel
              </button>
              <button 
                onClick={submitRefundRequest} 
                className="btn-submit"
                disabled={refundLoading || !refundForm.amount || !refundForm.note.trim()}
              >
                {refundLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PaymentHistory;