import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  FaEnvelope, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaPlus, 
  FaEye, 
  FaReply,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaMailBulk
} from "react-icons/fa";
import "./AdminInquiryManagement.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function AdminInquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    status: "pending",
    priority: "medium",
    email: "",
    phone: "",
    response: ""
  });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE}/inquiries`);
      setInquiries(response.data.inquiries || []);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setError("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  // Filter, sort, and paginate functionality
  const filteredAndSortedInquiries = useMemo(() => {
    let filtered = inquiries.filter(inquiry => {
      const matchesSearch =
        inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.inquiry_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || inquiry.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "status":
          aValue = a.status || "pending";
          bValue = b.status || "pending";
          break;
        case "priority":
          aValue = a.priority || "medium";
          bValue = b.priority || "medium";
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [inquiries, searchTerm, sortBy, sortOrder, statusFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedInquiries.length / itemsPerPage);
  const currentItems = filteredAndSortedInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter(inquiry => inquiry.status === "pending").length;
    const responded = inquiries.filter(inquiry => inquiry.status === "responded").length;
    const closed = inquiries.filter(inquiry => inquiry.status === "closed").length;
    const highPriority = inquiries.filter(inquiry => inquiry.priority === "high").length;

    return {
      total,
      pending,
      responded,
      closed,
      highPriority
    };
  }, [inquiries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/inquiries/${editingId}` : `${API_BASE}/inquiries`;
      
      // If editing and adding a response, automatically set status to "responded"
      let payload = { ...form };
      if (editingId && form.response && form.response.trim() !== "" && form.status === "pending") {
        payload.status = "responded";
      }
      
      const resp = await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      // Fire notificationsUpdated so bell refreshes
      try { window.dispatchEvent(new Event('notificationsUpdated')); } catch {}

      setForm({ 
        name: "", 
        description: "", 
        status: "pending",
        priority: "medium",
        email: "",
        phone: "",
        response: ""
      });
      setEditingId(null);
      setShowForm(false);
      fetchInquiries();
    } catch (err) {
      console.error("Error saving inquiry:", err);
      setError(err.response?.data?.message || "Failed to save inquiry");
    }
  };

  

  const handleEdit = (inquiry) => {
    setEditingId(inquiry._id);
    setForm({ 
      name: inquiry.name || "", 
      description: inquiry.description || "",
      status: inquiry.status || "pending",
      priority: inquiry.priority || "medium",
      email: inquiry.email || "",
      phone: inquiry.phone || "",
      response: inquiry.response || ""
    });
    setShowForm(true);
  };

  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetails(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      await axios.delete(`${API_BASE}/inquiries/${id}`);
      fetchInquiries();
    } catch (err) {
      console.error("Error deleting inquiry:", err);
      setError("Failed to delete inquiry");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/inquiries/${id}`, { status: newStatus });
      fetchInquiries();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setForm({ ...form, name: value });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "responded":
        return <FaReply className="status-icon responded" />;
      case "closed":
        return <FaCheckCircle className="status-icon closed" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <FaExclamationTriangle className="priority-icon high" />;
      case "medium":
        return <FaClock className="priority-icon medium" />;
      case "low":
        return <FaCheckCircle className="priority-icon low" />;
      default:
        return <FaClock className="priority-icon medium" />;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Inquiry ID', 'Customer Name', 'Email', 'Phone', 'Status', 'Priority', 'Description', 'Response', 'Date'],
      ...filteredAndSortedInquiries.map(inquiry => [
        inquiry.inquiry_id || '',
        inquiry.name || '',
        inquiry.email || '',
        inquiry.phone || '',
        inquiry.status || 'pending',
        inquiry.priority || 'medium',
        `"${(inquiry.description || '').replace(/"/g, '""')}"`,
        `"${(inquiry.response || '').replace(/"/g, '""')}"`,
        new Date(inquiry.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-inquiry-management">
      <div className="inquiry-header">
        <div className="header-content">
          <h2>📝 Inquiry Management</h2>
          <p>Manage customer inquiries, responses, and support tickets</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaEnvelope />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Inquiries</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon responded">
              <FaReply />
            </div>
            <div className="stat-content">
              <h3>{stats.responded}</h3>
              <p>Responded</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon high-priority">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <h3>{stats.highPriority}</h3>
              <p>High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="sort-select"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="priority">Sort by Priority</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="sort-order-btn"
              title={`Currently: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={exportToCSV}
            className="btn btn-secondary"
            disabled={filteredAndSortedInquiries.length === 0}
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? "Respond to Inquiry" : "Add New Inquiry"}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ 
                    name: "", 
                    description: "", 
                    status: "pending",
                    priority: "medium",
                    email: "",
                    phone: "",
                    response: ""
                  });
                }}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="inquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={handleNameChange}
                    pattern="^[a-zA-Z\s]+$"
                    title="Name can only contain letters and spaces"
                    className="form-control"
                    required
                    disabled={!!editingId}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-control"
                    disabled={!!editingId}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="form-control"
                    disabled={!!editingId}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <input
                    type="text"
                    value={form.status}
                    readOnly
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <input
                  type="text"
                  value={form.priority}
                  readOnly
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Inquiry Description *</label>
                <textarea
                  placeholder="Enter inquiry description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                  className="form-control"
                  disabled={!!editingId}
                />
              </div>

              <div className="form-group">
                <label>Response</label>
                <textarea
                  placeholder="Enter response (optional)..."
                  value={form.response}
                  onChange={(e) => setForm({ ...form, response: e.target.value })}
                  rows={3}
                  className="form-control"
                />
                {editingId && form.status === "pending" && (
                  <small className="form-text" style={{ color: '#4CAF50', fontStyle: 'italic' }}>
                    💡 Adding a response will automatically change status to "Responded"
                  </small>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  {editingId ? "Send Response" : "Create Inquiry"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({ 
                      name: "", 
                      description: "", 
                      status: "pending",
                      priority: "medium",
                      email: "",
                      phone: "",
                      response: ""
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedInquiry && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h3>Inquiry Details - {selectedInquiry.inquiry_id}</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedInquiry(null);
                }}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="inquiry-details">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <FaUser className="detail-icon" />
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedInquiry.name || 'Anonymous'}</span>
                  </div>
                  {selectedInquiry.email && (
                    <div className="detail-item">
                      <FaMailBulk className="detail-icon" />
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedInquiry.email}</span>
                    </div>
                  )}
                  {selectedInquiry.phone && (
                    <div className="detail-item">
                      <FaPhone className="detail-icon" />
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedInquiry.phone}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Inquiry Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <div className="status-badge">
                      {getStatusIcon(selectedInquiry.status)}
                      <span className="status-text">{selectedInquiry.status || 'pending'}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priority:</span>
                    <div className="priority-badge">
                      {getPriorityIcon(selectedInquiry.priority)}
                      <span className="priority-text">{selectedInquiry.priority || 'medium'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Description</h4>
                <div className="description-content">
                  {selectedInquiry.description || 'No description provided'}
                </div>
              </div>

              {selectedInquiry.response && (
                <div className="detail-section">
                  <h4>Response</h4>
                  <div className="response-content">
                    {selectedInquiry.response}
                  </div>
                </div>
              )}

              <div className="detail-actions">
                <button
                  onClick={() => handleEdit(selectedInquiry)}
                  className="btn btn-primary"
                >
                  <FaEdit /> Edit Inquiry
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedInquiry(null);
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Inquiries Table */}
      <div className="inquiries-section">
        <div className="section-header">
          <h3>All Inquiries ({filteredAndSortedInquiries.length})</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading inquiries...</p>
          </div>
        ) : filteredAndSortedInquiries.length === 0 ? (
          <div className="empty-state">
            <FaEnvelope className="empty-icon" />
            <h3>No inquiries found</h3>
            <p>{searchTerm || statusFilter !== "all" || priorityFilter !== "all" ? "Try adjusting your filters" : "Start by adding your first inquiry"}</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Inquiry ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Respond</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((inquiry) => (
                    <tr key={inquiry._id}>
                      <td>
                        <span className="inquiry-id-badge">
                          {inquiry.inquiry_id || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="description-preview">
                          <div style={{ fontWeight: 600 }}>{inquiry.name || 'Anonymous'}</div>
                          {inquiry.email && (
                            <div style={{ marginTop: 2 }}>{inquiry.email}</div>
                          )}
                          {inquiry.phone && (
                            <div style={{ marginTop: 2 }}>{inquiry.phone}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <div className="status-badge">
                            {getStatusIcon(inquiry.status)}
                            <span className="status-text">{inquiry.status || 'pending'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="status-text">{inquiry.type || 'general'}</span>
                          <div className="priority-badge" style={{ marginTop: 4 }}>
                            {getPriorityIcon(inquiry.priority)}
                            <span className="priority-text">{inquiry.priority || 'medium'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="description-preview">
                          {inquiry.description ? 
                            (inquiry.description.length > 100 ? 
                              `${inquiry.description.substring(0, 100)}...` : 
                              inquiry.description
                            ) : 'No description'
                          }
                        </div>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(inquiry)}
                            className="btn-edit"
                            title="Respond"
                          >
                            <FaReply />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminInquiryManagement;
