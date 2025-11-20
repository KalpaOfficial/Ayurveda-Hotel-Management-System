import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaStar, FaSearch, FaFilter, FaDownload } from "react-icons/fa";
import { FaReply } from "react-icons/fa";
import "./AdminReviewManagement.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function AdminReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Admin is view-only for reviews
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [starFilter, setStarFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  // Filter, sort, and paginate functionality
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews.filter(review => {
      const matchesSearch =
        review.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.review_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStars = starFilter === "all" || review.stars === parseInt(starFilter);

      return matchesSearch && matchesStars;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
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
  }, [reviews, searchTerm, sortBy, sortOrder, starFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage);
  const currentItems = filteredAndSortedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + (review.stars || 0), 0) / reviews.length).toFixed(1)
      : 0;

    const starDistribution = [1, 2, 3, 4, 5].map(star =>
      reviews.filter(review => review.stars === star).length
    );

    return {
      total: reviews.length,
      average: avgRating,
      distribution: starDistribution
    };
  }, [reviews]);

  // View-only: no handlers for edit/create/delete

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className={`stars-container ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
            onClick={interactive ? () => onStarClick(star) : undefined}
          >
            <FaStar />
          </span>
        ))}
      </div>
    );
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Review ID', 'Customer Name', 'Rating', 'Description', 'Date'],
      ...filteredAndSortedReviews.map(review => [
        review.review_id || '',
        review.name || '',
        review.stars || 0,
        `"${(review.description || '').replace(/"/g, '""')}"`,
        new Date(review.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const replyToUser = async (review) => {
    try {
      const userId = review?.user?.id || review?.userId;
      if (!userId) {
        alert("No user found for this review.");
        return;
      }
      const defaultTitle = `Reply to your review ${review.review_id || ''}`.trim();
      const message = window.prompt("Enter your reply to the user:");
      if (!message) return;
      await axios.post(`${API_BASE}/notifications`, {
        userId,
        type: 'review_reply',
        title: defaultTitle,
        message,
        metadata: { reviewId: review._id, reviewCode: review.review_id }
      });
      alert("Reply sent to the user.");
    } catch (e) {
      console.error(e);
      alert("Failed to send reply. Please try again.");
    }
  };

  return (
    <div className="admin-review-management">
      <div className="review-header">
        <div className="header-content">
          <h2>⭐ Review Management</h2>
          <p>Manage customer reviews and ratings</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Reviews</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <h3>{stats.average}</h3>
              <p>Average Rating</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaFilter />
            </div>
            <div className="stat-content">
              <h3>{filteredAndSortedReviews.length}</h3>
              <p>Filtered Results</p>
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

        <div className="action-buttons">
          <button
            onClick={exportToCSV}
            className="btn btn-secondary"
            disabled={filteredAndSortedReviews.length === 0}
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {/* No form/modal: admin cannot add/edit reviews */}

      {/* Reviews Table */}
      <div className="reviews-section">
        <div className="section-header">
          <h3>All Reviews ({filteredAndSortedReviews.length})</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading reviews...</p>
          </div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>No reviews found</h3>
            <p>{searchTerm || starFilter !== "all" ? "Try adjusting your filters" : "Start by adding your first review"}</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Review ID</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((review) => (
                    <tr key={review._id}>
                      <td>
                        <span className="review-id-badge">
                          {review.review_id || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="customer-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="author-avatar" style={{ width: 35, height: 35, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e7f5ef', color: '#0f5132', fontWeight: 700 }}>
                            {review.user?.profilePicture ? (
                              <img 
                                src={review.user.profilePicture?.startsWith('http') ? review.user.profilePicture : `${API_BASE}${review.user.profilePicture}`}
                                alt="profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span>{(((review.user?.firstName || 'G')[0]) + (review.user?.lastName ? review.user.lastName[0] : 'U')).toUpperCase()}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="customer-name">{`${review.user?.firstName || 'Guest'} ${review.user?.lastName || ''}`.trim()}</span>
                            <span className="date-text">{review.user?.country || 'Sri Lanka'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="rating-display">
                          {renderStars(review.stars)}
                          <span className="rating-number">({review.stars}/5)</span>
                        </div>
                      </td>
                      <td>
                        <div className="comment-preview">
                          {review.description ? 
                            (review.description.length > 100 ? 
                              `${review.description.substring(0, 100)}...` : 
                              review.description
                            ) : 'No comment'
                          }
                        </div>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-primary" title="Reply to user" onClick={() => replyToUser(review)}>
                            <FaReply /> Reply
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

export default AdminReviewManagement;
