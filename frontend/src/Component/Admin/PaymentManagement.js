import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from "react-icons/fa";
import './PaymentManagement.css';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adminUser, setAdminUser] = useState(null);
  const paymentsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/admin-signin");
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate("/admin-signin");
      return;
    }

    setAdminUser(user);
    loadPayments();
  }, [navigate]);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5001/api/payments', {
        headers: {
          'Authorization': 'Bearer admin-secret-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }

      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load payments:', err);
      setError('Unable to load payments. Please check if the payment service is running.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment._id);
    setEditForm({
      name: payment.name || '',
      email: payment.email || '',
      amount: payment.amount || 0,
      packageType: payment.packageType || '',
      status: payment.status || 'Pending'
    });
  };

  const handleSave = async () => {
    if (!editingPayment) return;

    try {
      const response = await fetch(`http://localhost:5001/api/payments/${editingPayment}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-secret-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      await loadPayments();
      setEditingPayment(null);
      setEditForm({});
    } catch (err) {
      alert('Failed to update payment: ' + err.message);
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-secret-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      await loadPayments();
    } catch (err) {
      alert('Failed to delete payment: ' + err.message);
    }
  };

  const handleCancel = () => {
    setEditingPayment(null);
    setEditForm({});
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

  const handleGoToWebsite = () => {
    window.open("http://localhost:3000", "_blank");
  };

  // Filter and search payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.packageType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const currentPayments = filteredPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  // Statistics
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'Paid').length,
    pending: payments.filter(p => p.status === 'Pending').length,
    totalRevenue: payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="admin-container">
        <main className="main-content">
          <header className="admin-header">
            <div className="header-left">
              <h1>🌿 Sath Villa Ayurvedic</h1>
              <span className="header-subtitle">Wellness Management System</span>
            </div>
            <div className="header-right">
              <button onClick={handleGoToWebsite} className="website-btn">
                <FaExternalLinkAlt /> Visit Website
              </button>
              <div className="admin-profile">
                {adminUser?.profilePicture ? (
                  <img
                    src={`http://localhost:5000${adminUser.profilePicture}`}
                    alt="Admin"
                    className="profile-img"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40";
                    }}
                  />
                ) : (
                  <div className="admin-avatar">
                    {adminUser?.firstName ? adminUser.firstName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="profile-info">
                  <span className="profile-name">{adminUser?.firstName || 'Admin'} {adminUser?.lastName || ''}</span>
                  <span className="profile-role">Administrator</span>
                </div>
              </div>
            </div>
          </header>
          <div className="payment-management-page">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading payment data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <main className="main-content">
        <header className="admin-header">
          <div className="header-left">
            <h1>🌿 Sath Villa Ayurvedic</h1>
            <span className="header-subtitle">Wellness Management System</span>
          </div>
          <div className="header-right">
            <button onClick={handleGoToWebsite} className="website-btn">
              <FaExternalLinkAlt /> Visit Website
            </button>
            <div className="admin-profile">
              {adminUser?.profilePicture ? (
                <img
                  src={`http://localhost:5000${adminUser.profilePicture}`}
                  alt="Admin"
                  className="profile-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                />
              ) : (
                <div className="admin-avatar">
                  {adminUser?.firstName ? adminUser.firstName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="profile-info">
                <span className="profile-name">{adminUser?.firstName || 'Admin'} {adminUser?.lastName || ''}</span>
                <span className="profile-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>
        <div className="payment-management-page">
        <div className="page-header">
          <h1 className="page-title">Payment Management</h1>
          <p className="page-subtitle">Manage all customer payments and transactions</p>
          <div className="header-buttons">
            <button onClick={loadPayments} className="refresh-btn">
              🔄 Refresh
            </button>
            <button onClick={() => navigate('/admin/income-analysis')} className="analysis-btn">
              📊 Income Analysis
            </button>
            <button onClick={() => navigate('/admin/refund-management')} className="refunds-btn">
              📋 User Refunds
            </button>
            <button onClick={() => navigate('/admin-dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Payments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.paid}</h3>
              <p>Paid</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3 className="revenue-amount">${stats.totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <input
              type="text"
              placeholder="Search by name, email, or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCurrentPage(1);
              }} 
              className="clear-btn"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Payments Table */}
        <div className="payments-container">
          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      {editingPayment === payment._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        payment.name || '-'
                      )}
                    </td>
                    <td>
                      {editingPayment === payment._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        payment.email || '-'
                      )}
                    </td>
                    <td className="amount-cell">
                      {editingPayment === payment._id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                          className="edit-input amount-input"
                        />
                      ) : (
                        <strong>${Number(payment.amount || 0).toFixed(2)}</strong>
                      )}
                    </td>
                    <td>
                      {editingPayment === payment._id ? (
                        <input
                          type="text"
                          value={editForm.packageType}
                          onChange={(e) => setEditForm({...editForm, packageType: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        payment.packageType || '-'
                      )}
                    </td>
                    <td>
                      {editingPayment === payment._id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          className="edit-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      ) : (
                        getStatusBadge(payment.status)
                      )}
                    </td>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td className="transaction-cell">
                      {payment.transactionId ? (
                        <code>{payment.transactionId.substring(0, 15)}...</code>
                      ) : (
                        <span className="no-transaction">-</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingPayment === payment._id ? (
                        <div className="action-buttons">
                          <button onClick={handleSave} className="save-btn">Save</button>
                          <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(payment)} className="edit-btn">Edit</button>
                          <button onClick={() => handleDelete(payment._id)} className="delete-btn">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {currentPayments.length === 0 && (
                  <tr>
                    <td colSpan="8" className="no-data">
                      {searchTerm || statusFilter ? 'No payments match your filters' : 'No payments found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages} ({filteredPayments.length} payments)
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
      </main>
    </div>
  );
};

export default PaymentManagement;