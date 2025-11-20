import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./HomeIR.css";
import Footer from "../Footer/Footer";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function InquireAndReviewHome() {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    totalReviews: 0,
    avgRating: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [inquiriesRes, reviewsRes] = await Promise.all([
          fetch(`${API_BASE}/inquiries`),
          fetch(`${API_BASE}/reviews`)
        ]);

        const inquiriesData = await inquiriesRes.json();
        const reviewsData = await reviewsRes.json();

        const inquiries = inquiriesData.inquiries || [];
        const reviews = reviewsData.reviews || [];

        const avgRating = reviews.length > 0
          ? (reviews.reduce((sum, review) => sum + (review.stars || 0), 0) / reviews.length).toFixed(1)
          : 0;

        setStats({
          totalInquiries: inquiries.length,
          totalReviews: reviews.length,
          avgRating,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="creative-bg">
      <Nav />

      {/* Hero Section */}
      <div className="hero-sectionIR">
        <div className="hero-contentIR">
          <h1 className="hero-title">
            <span className="hero-icon">🌿</span>
            Sath Villa Ayurvedic
            <span className="hero-subtitle">Customer Care Portal</span>
          </h1>
          <p className="hero-description">
            Your voice matters! Share your thoughts, ask questions, and help us serve you better with our traditional Ayurvedic treatments.
          </p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-number">{stats.loading ? "..." : stats.totalInquiries}</div>
            <div className="stat-label">Total Inquiries</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-number">{stats.loading ? "..." : stats.totalReviews}</div>
            <div className="stat-label">Customer Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">{stats.loading ? "..." : stats.avgRating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="creative-card">
        <h2 className="creative-title">
          <span role="img" aria-label="question">❓</span> How can we help you today? <span role="img" aria-label="star">⭐</span>
        </h2>
        <p className="creative-sub">Choose an option to get started with your inquiry or review</p>

        <div className="creative-actions">
          <Link to="/inquire" className="creative-link">
            <div className="creative-btn creative-btn-inquire">
              <span role="img" aria-label="inquire">📝</span>
              <span>Submit Inquiry</span>
              <small className="btn-description">Ask questions about our treatments</small>
            </div>
          </Link>
          <Link to="/reviews" className="creative-link">
            <div className="creative-btn creative-btn-reviews">
              <span role="img" aria-label="reviews">💬</span>
              <span>Share Review</span>
              <small className="btn-description">Rate your experience with us</small>
            </div>
          </Link>
        </div>

        {/* Quick Info Cards */}
        <div className="quick-info-section">
          <div className="info-card">
            <h4>🔍 Browse Inquiries</h4>
            <p>View all customer inquiries and find answers to common questions</p>
          </div>
          <div className="info-card">
            <h4>⭐ Read Reviews</h4>
            <p>See what other customers say about our Ayurvedic treatments</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default InquireAndReviewHome;
