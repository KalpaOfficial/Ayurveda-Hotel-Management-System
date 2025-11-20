import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./Reviews.css";
import Footer from "../Footer/Footer";
import { exportReviewsToPDF } from '../utils/Inquire&ReviewPdf/exportReviewsToPDF';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function Reviews() {
  const location = useLocation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ description: "", stars: 5 });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // Enhanced UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [starFilter, setStarFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching reviews from:", `${API_BASE}/reviews`);
      const res = await fetch(`${API_BASE}/reviews`);
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error(`Failed to load reviews: ${res.status}`);
      const data = await res.json();
      console.log("Fetched data:", data);
      setList(data.reviews || []);
    } catch (e) {
      console.error("Error fetching reviews:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Open Add Review form directly if navigated with ?action=add
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "add") {
      setEditingId(null);
      setShowForm(true);
    }
  }, [location.search]);

  const myReview = useMemo(() => {
    if (!currentUser) return null;
    return list.find(r => r.userId === currentUser.id) || null;
  }, [list, currentUser]);

  // Filter, sort, and paginate functionality
  const filteredAndSortedList = useMemo(() => {
    let filtered = list.filter(item => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.review_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStars = starFilter === "all" || item.stars === parseInt(starFilter);

      return matchesSearch && matchesStars;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "review_id":
          aValue = a.review_id || "";
          bValue = b.review_id || "";
          break;
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "stars":
          aValue = a.stars || 0;
          bValue = b.stars || 0;
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
  }, [list, searchTerm, sortBy, sortOrder, starFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedList.length / itemsPerPage);
  const currentItems = filteredAndSortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const avgRating = list.length > 0
      ? (list.reduce((sum, review) => sum + (review.stars || 0), 0) / list.length).toFixed(1)
      : 0;

    const starDistribution = [1, 2, 3, 4, 5].map(star =>
      list.filter(review => review.stars === star).length
    );

    return {
      total: list.length,
      average: avgRating,
      distribution: starDistribution
    };
  }, [list]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!currentUser) {
        setError("Please sign in to submit a review.");
        return;
      }
      if (!editingId && myReview) {
        setError("You have already submitted a review.");
        return;
      }
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/reviews/${editingId}` : `${API_BASE}/reviews`;
      const payload = { ...form, stars: Number(form.stars), userId: currentUser.id };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      setForm({ description: "", stars: 5 });
      setEditingId(null);
      fetchAll();
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({ review_id: item.review_id || "", description: item.description || "", stars: item.stars || 5 });
    setShowForm(true);
  };

  const handleExportPDF = () => {
    exportReviewsToPDF(filteredAndSortedList);
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className={`stars-container ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
            onClick={interactive ? () => onStarClick(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      if (!currentUser) {
        setError("Please sign in to delete your review.");
        return;
      }
      const res = await fetch(`${API_BASE}/reviews/${id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchAll();
    } catch (e) {
      setError(e.message);
    }
  };


  // no name field in form

  return (
    <div className="reviews-bg">
      <Nav />
      <div className="reviews-container">
        {/* Header Section */}
        <div className="reviews-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">⭐</span>
              Customer Reviews
            </h1>
            <p className="page-subtitle">Manage and showcase customer feedback and ratings</p>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
            <div className="stat-card success">
              <div className="stat-number">{stats.average}</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card info">
              <div className="stat-number">{filteredAndSortedList.length}</div>
              <div className="stat-label">Filtered Results</div>
            </div>
            <div className="stat-card rating-dist">
              <div className="distribution-chart">
                {stats.distribution.map((count, index) => (
                  <div key={index} className="dist-bar">
                    <div
                      className="bar-fill"
                      style={{ height: `${(count / Math.max(...stats.distribution)) * 100}%` }}
                    ></div>
                    <span className="bar-label">{index + 1}★</span>
                  </div>
                ))}
              </div>
              <div className="stat-label">Rating Distribution</div>
            </div>
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}

        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-filter-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search reviews..."
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
                value={starFilter}
                onChange={(e) => {
                  setStarFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
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
                <option value="review_id">Sort by ID</option>
                <option value="name">Sort by Name</option>
                <option value="stars">Sort by Rating</option>
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

          <div className="action-controls">
            {currentUser ? (
              !myReview && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingId(null);
                    setForm({ description: "", stars: 5 });
                  }}
                  className="btn btn-primary"
                >
                  <span>➕</span> Add Review
                </button>
              )
            ) : (
              <div className="error-text" style={{ margin: 0 }}>Please sign in to add a review.</div>
            )}

            <button
              onClick={handleExportPDF}
              className="btn btn-export"
              disabled={filteredAndSortedList.length === 0}
            >
              <span>📄</span> Export PDF
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="form-card">
            <div className="form-header">
              <h3>{editingId ? "Edit Review" : "Add New Review"}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ description: "", stars: 5 });
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="review-form">

              <div className="form-group">
                <label>Review Comment *</label>
                <textarea
                  placeholder="Enter review comment..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rating *</label>
                <div className="rating-input">
                  {renderStars(form.stars, true, (star) => setForm({ ...form, stars: star }))}
                  <span className="rating-text">({form.stars}/5 stars)</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={!currentUser}>
                  {editingId ? "Update Review" : "Create Review"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  setForm({ description: "", stars: 5 });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Section */}
        <div className="data-section">
          <div className="section-header">
            <h2>All Reviews ({filteredAndSortedList.length})</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : filteredAndSortedList.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">⭐</span>
              <h3>No reviews found</h3>
              <p>{searchTerm || starFilter !== "all" ? "Try adjusting your filters" : "Start by adding your first review"}</p>
            </div>
          ) : (
            <>
              <div className="reviews-grid">
                {currentItems.map((item) => (
                    <div className="review-card" key={item._id}>
                    <div className="review-card-header">
                      <div className="review-id-badge">{item.review_id}</div>
                      <div className="review-rating">
                        {renderStars(item.stars)}
                        <span className="rating-number">({item.stars}/5)</span>
                      </div>
                    </div>

                    <div className="review-card-body">
                      <div className="customer-section">
                        <span className="customer-avatar">
                          {item.user?.profilePicture ? (
                            <img 
                              src={item.user.profilePicture?.startsWith('http') ? item.user.profilePicture : `${API_BASE}${item.user.profilePicture}`}
                              alt="profile"
                              style={{ width: 35, height: 35, borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            '👤'
                          )}
                        </span>
                        <div className="customer-info">
                          <span className="customer-name">{`${item.user?.firstName || 'Guest'} ${item.user?.lastName || ''}`.trim()}</span>
                          <span className="review-date">
                            {new Date(item.createdAt || Date.now()).toLocaleDateString()} • {item.user?.country || 'Sri Lanka'}
                          </span>
                        </div>
                      </div>

                      <div className="review-comment">
                        "{item.description || 'No comment provided'}"
                      </div>
                    </div>

                    {currentUser && item.userId === currentUser.id && (
                      <div className="review-card-actions">
                        <button
                          onClick={() => startEdit(item)}
                          className="btn-small btn-edit"
                          title="Edit review"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn-small btn-delete"
                          title="Delete review"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
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
      <Footer />
    </div>
  );
}

export default Reviews;
