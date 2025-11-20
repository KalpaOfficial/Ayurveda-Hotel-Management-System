import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from "react-icons/fa";
import './RefundManagement.css';

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingRefunds, setProcessingRefunds] = useState(new Set());
  const [adminUser, setAdminUser] = useState(null);
  const refundsPerPage = 10;
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
    loadRefunds();
  }, [navigate, statusFilter]);

  const loadRefunds = async () => {
    setLoading(true);
    setError('');
    
    try {
      const url = statusFilter 
        ? `http://localhost:5001/api/refunds?status=${statusFilter}`
        : 'http://localhost:5001/api/refunds';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer admin-secret-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch refunds: ${response.status}`);
      }

      const data = await response.json();
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load refunds:', err);
      setError('Unable to load refund requests. Please check if the payment service is running.');
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundDecision = async (refundId, action) => {
    const amount = action === 'approve' ? prompt('Refund amount (USD):', '') : undefined;
    
    if (action === 'approve' && (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      alert('Please enter a valid refund amount');
      return;
    }

    setProcessingRefunds(prev => new Set([...prev, refundId]));

    try {
      const body = { action };
      if (amount) {
        body.amount = parseFloat(amount);
      }

      const response = await fetch(`http://localhost:5001/api/refunds/${refundId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-secret-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process refund');
      }

      const actionText = action === 'approve' ? 'approved' : 'denied';
      alert(`Refund ${actionText} successfully!`);
      
      // Reload refunds to reflect changes
      await loadRefunds();
    } catch (err) {
      console.error(`Failed to ${action} refund:`, err);
      alert(`Failed to ${action} refund: ${err.message}`);
    } finally {
      setProcessingRefunds(prev => {
        const newSet = new Set(prev);
        newSet.delete(refundId);
        return newSet;
      });
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
      'Requested': 'status-requested',
      'Processing': 'status-processing',
      'Approved': 'status-approved',
      'Denied': 'status-denied',
      'Refunded': 'status-refunded',
      'Failed': 'status-failed'
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

  // Pagination
  const totalPages = Math.ceil(refunds.length / refundsPerPage);
  const currentRefunds = refunds.slice(
    (currentPage - 1) * refundsPerPage,
    currentPage * refundsPerPage
  );

  // Statistics
  const stats = {
    total: refunds.length,
    requested: refunds.filter(r => r.status === 'Requested').length,
    approved: refunds.filter(r => r.status === 'Approved' || r.status === 'Refunded').length,
    denied: refunds.filter(r => r.status === 'Denied').length,
    totalAmount: refunds.filter(r => r.status === 'Refunded').reduce((sum, r) => sum + (r.amount || 0), 0)
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
          <div className="refund-management-page">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading refund requests...</p>
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
        <div className="refund-management-page">
        <div className="page-header">
          <h1 className="page-title">Refund Management</h1>
          <p className="page-subtitle">Review and process customer refund requests</p>
          <div className="header-buttons">
            <button onClick={loadRefunds} className="refresh-btn">
              🔄 Refresh
            </button>
            <button onClick={() => navigate('/admin/payment-management')} className="back-btn">
              ← Back to Payments
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.requested}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.denied}</h3>
              <p>Denied</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${stats.totalAmount.toFixed(2)}</h3>
              <p>Total Refunded</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="Requested">Requested</option>
              <option value="Processing">Processing</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
            <button 
              onClick={() => {
                setStatusFilter('');
                setCurrentPage(1);
              }} 
              className="clear-btn"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Refunds Table */}
        <div className="refunds-container">
          <div className="refunds-table-container">
            <table className="refunds-table">
              <thead>
                <tr>
                  <th>Requested At</th>
                  <th>Customer</th>
                  <th>Payment Details</th>
                  <th>Refund Amount</th>
                  <th>Reason & Notes</th>
                  <th>Status</th>
                  <th>Decision</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRefunds.map((refund) => (
                  <tr key={refund._id}>
                    <td>{formatDate(refund.createdAt)}</td>
                    <td className="customer-cell">
                      <div className="customer-email">{refund.userEmail}</div>
                    </td>
                    <td className="payment-details-cell">
                      <div className="package-name">
                        {refund.paymentId?.packageType || '-'}
                      </div>
                      <div className="payment-amount">
                        ${refund.paymentId?.amount?.toFixed(2) || '0.00'}
                      </div>
                      <div className="payment-id">
                        ID: {refund.paymentId?._id?.slice(-6) || '-'}
                      </div>
                    </td>
                    <td className="amount-cell">
                      <strong>${Number(refund.amount || 0).toFixed(2)}</strong>
                    </td>
                    <td className="reason-cell">
                      <div className="reason">{refund.reason}</div>
                      {refund.note && (
                        <div className="note" title={refund.note}>
                          "{refund.note.length > 50 ? refund.note.substring(0, 50) + '...' : refund.note}"
                        </div>
                      )}
                    </td>
                    <td>{getStatusBadge(refund.status)}</td>
                    <td className="decision-cell">
                      {refund.decisionBy ? (
                        <div>
                          <div className="decision-by">{refund.decisionBy}</div>
                          <div className="decision-date">
                            {formatDate(refund.decisionAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="no-decision">-</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      {refund.status === 'Requested' ? (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleRefundDecision(refund._id, 'approve')}
                            disabled={processingRefunds.has(refund._id)}
                            className="approve-btn"
                            title="Approve refund request"
                          >
                            {processingRefunds.has(refund._id) ? '⏳' : '✅'} Approve
                          </button>
                          <button
                            onClick={() => handleRefundDecision(refund._id, 'deny')}
                            disabled={processingRefunds.has(refund._id)}
                            className="deny-btn"
                            title="Deny refund request"
                          >
                            {processingRefunds.has(refund._id) ? '⏳' : '❌'} Deny
                          </button>
                        </div>
                      ) : (
                        <span className="action-completed">
                          {refund.status === 'Refunded' ? '✅ Processed' : 
                           refund.status === 'Denied' ? '❌ Denied' : 
                           refund.status === 'Failed' ? '⚠️ Failed' : '⏳ Processing'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {currentRefunds.length === 0 && (
                  <tr>
                    <td colSpan="8" className="no-data">
                      {statusFilter ? `No ${statusFilter.toLowerCase()} refund requests found` : 'No refund requests found'}
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
              Page {currentPage} of {totalPages} ({refunds.length} requests)
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

export default RefundManagement;