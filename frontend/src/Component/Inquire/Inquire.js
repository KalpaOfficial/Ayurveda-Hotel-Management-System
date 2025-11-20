import React, { useEffect, useState } from "react";
import Nav from "../Nav/Nav";
import "./Inquire.css";
import Footer from "../Footer/Footer";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function Inquire() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [myInquiries, setMyInquiries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);

  const fetchMine = async (userId) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/inquiries/user/${userId}/all`);
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error(`Failed to load inquiries: ${res.status}`);
      const data = await res.json();
      setMyInquiries(data.inquiries || []);
    } catch (e) {
      console.error("Error fetching inquiries:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    console.log("User from localStorage:", u);
    console.log("User _id:", u?._id);
    console.log("User id:", u?.id);
    setUser(u);
    if (u && (u._id || u.id)) {
      fetchMine(u._id || u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Get fresh user data from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user"));
      console.log("Current user:", currentUser);
      console.log("Current user _id:", currentUser?._id);
      console.log("Current user id:", currentUser?.id);
      
      const userId = currentUser?._id || currentUser?.id;
      if (!currentUser || !userId) {
        throw new Error("Please sign in to submit an inquiry");
      }
      
      const payload = { ...form, userId: userId };
      console.log("Submitting inquiry with payload:", payload);
      
      // If editing a specific pending inquiry, call user-scoped update endpoint
      const res = await fetch(editingId ? `${API_BASE}/inquiries/user/${userId}/${editingId}` : `${API_BASE}/inquiries`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Backend error response:", errorData);
        throw new Error(errorData.message || `Save failed (${res.status})`);
      }
      
      setForm({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchMine(userId);
    } catch (e) {
      console.error("Submit error:", e);
      setError(e.message);
    }
  };

  const handleNameChange = (e) => {
    // Only allow letters and spaces
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setForm({ ...form, name: value });
  };

  return (
    <div className="inquiries-bg">
      <Nav />
      <div className="inquiries-container">
        {/* Header Section */}
        <div className="inquiries-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">📝</span>
              Customer Inquiries
            </h1>
            <p className="page-subtitle">Submit your question and our team will respond here</p>
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}

        {!user && (
          <div className="empty-state">
            <span className="empty-icon">🔒</span>
            <h3>Please sign in to submit an inquiry</h3>
          </div>
        )}

        {user && (
          <>
            {/* Always show button to create new inquiry */}
            <div className="controls-section">
              <div className="action-controls">
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingId(null);
                    setForm({ 
                      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
                      email: user.email || "",
                      phone: user.phone || "",
                      description: "" 
                    });
                  }}
                  className="btn btn-primary"
                >
                  <span>➕</span> Write New Inquiry
                </button>
              </div>
            </div>

            {showForm && (
              <div className="form-card">
                <div className="form-header">
                  <h3>{editingId ? 'Edit Inquiry' : 'New Inquiry'}</h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm({ name: "", email: "", phone: "", description: "" });
                    }}
                    className="close-btn"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="inquiry-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Your Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleNameChange}
                        pattern="^[a-zA-Z\s]+$"
                        title="Name can only contain letters and spaces"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type of Inquiry</label>
                      <select
                        className="form-control"
                        value={form.type || 'general'}
                        onChange={(e) => {
                          const t = e.target.value;
                          // map type to default priority on client side for UX
                          const mappedPriority = t === 'complaint' || t === 'booking' ? 'high' : (t === 'product' || t === 'support') ? 'medium' : 'low';
                          setForm({ ...form, type: t, priority: mappedPriority });
                        }}
                      >
                        <option value="general">General</option>
                        <option value="booking">Booking</option>
                        <option value="product">Product</option>
                        <option value="support">Support</option>
                        <option value="complaint">Complaint</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Your Question *</label>
                    <textarea
                      placeholder="Enter your inquiry..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                      {editingId ? 'Update Inquiry' : 'Submit Inquiry'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm({ name: "", email: "", phone: "", description: "" });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your inquiries...</p>
              </div>
            ) : myInquiries.length > 0 ? (
              <div className="data-section">
                <div className="section-header">
                  <h2>Your Inquiries ({myInquiries.length})</h2>
                </div>
                <div className="table-container">
                  <table className="inquiries-table">
                    <thead>
                      <tr>
                        <th>Inquiry ID</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Response</th>
                        <th>Date</th>
                        <th style={{minWidth: 140}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myInquiries.map((inquiry) => (
                        <tr key={inquiry._id}>
                          <td><span className="inquiry-id">{inquiry.inquiry_id}</span></td>
                          <td><div className="description-cell">{inquiry.description}</div></td>
                          <td><span className="status-badge">{inquiry.status || 'pending'}</span></td>
                          <td><div className="description-cell">{inquiry.response || 'Awaiting response'}</div></td>
                          <td><span className="date-text">{new Date(inquiry.createdAt || Date.now()).toLocaleDateString()}</span></td>
                          <td>
                            {(!inquiry.status || inquiry.status === 'pending') ? (
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button
                                  className="btn btn-small"
                                  onClick={() => {
                                    setShowForm(true);
                                    setEditingId(inquiry._id);
                                    setForm({ name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "", description: inquiry.description });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-small"
                                  onClick={async () => {
                                    try {
                                      const currentUser = JSON.parse(localStorage.getItem("user"));
                                      const userId = currentUser?._id || currentUser?.id;
                                      const resp = await fetch(`${API_BASE}/inquiries/user/${userId}/${inquiry._id}`, { method: 'DELETE' });
                                      if (!resp.ok) {
                                        const data = await resp.json().catch(() => ({}));
                                        throw new Error(data.message || 'Delete failed');
                                      }
                                      fetchMine(userId);
                                    } catch (err) {
                                      console.error('Delete failed:', err);
                                      setError(err.message);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', color: '#666' }}>View only</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No inquiries yet</h3>
                <p>Click "Write New Inquiry" to send us your question.</p>
              </div>
            )}
          </>
        )}


      </div>
      <Footer />
    </div>
  );
}

export default Inquire;
