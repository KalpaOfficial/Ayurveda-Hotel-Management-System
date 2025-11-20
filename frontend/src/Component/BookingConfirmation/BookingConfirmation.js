import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import './BookingConfirmation.css';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get booking data from location state or fetch from API
    if (location.state?.booking) {
      setBooking(location.state.booking);
      setLoading(false);
    } else {
      // If no booking data, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPackageColor = (packageType) => {
    const colors = {
      '7 Days Rejuvenation': '#6f42c1',
      '14 Days Wellness': '#fd7e14',
      '21 Days Detox & Healing': '#e83e8c',
      'Weekend Refresh (3 Days)': '#20c997',
      'Senior Wellness (10 Days)': '#6c757d'
    };
    return colors[packageType] || '#6c757d';
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  const handleNewBooking = () => {
    navigate('/add-booking');
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading booking confirmation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="error-container">
        <h2>Booking Not Found</h2>
        <p>Unable to load booking confirmation.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      <Nav />
      
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p className="confirmation-subtitle">
            Your Ayurveda wellness retreat has been successfully booked
          </p>
        </div>

        <div className="booking-details-card">
          <div className="card-header">
            <h2>Booking Details</h2>
            <div className="booking-id">
              Booking ID: #{booking._id?.slice(-8) || 'N/A'}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-section">
              <h3>👤 Guest Information</h3>
              <div className="detail-item">
                <span className="label">Name:</span>
                <span className="value">{booking.b_name}</span>
              </div>
              {booking.b_email && (
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{booking.b_email}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{booking.b_phone}</span>
              </div>
              <div className="detail-item">
                <span className="label">Guests:</span>
                <span className="value">{booking.b_guest} {booking.b_guest === 1 ? 'person' : 'people'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>🏨 Accommodation</h3>
              <div className="detail-item">
                <span className="label">Room:</span>
                <span className="value room-number">Room {booking.b_roomNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Room Type:</span>
                <span className="value occupancy">
                  👥 Double Room
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Check-in:</span>
                <span className="value">{formatDate(booking.b_checkInDate)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Check-out:</span>
                <span className="value">{formatDate(booking.b_checkOutDate)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">{booking.b_packageDuration} days</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>🌿 Package Information</h3>
              <div className="package-info">
                <div 
                  className="package-badge"
                  style={{ backgroundColor: getPackageColor(booking.b_packageType) }}
                >
                  {booking.b_packageType}
                </div>
                <div className="package-description">
                  {booking.b_packageType === '7 Days Rejuvenation' && 
                    'A one-week journey to refresh and restore your energy with daily treatments'
                  }
                  {booking.b_packageType === '14 Days Wellness' && 
                    'Two weeks of holistic therapies for body and mind balance'
                  }
                  {booking.b_packageType === '21 Days Detox & Healing' && 
                    'A complete detoxification and healing experience over 21 days'
                  }
                  {booking.b_packageType === 'Weekend Refresh (3 Days)' && 
                    'A quick escape to relax and recharge in nature'
                  }
                  {booking.b_packageType === 'Senior Wellness (10 Days)' && 
                    'Gentle therapies designed for healthy aging and vitality'
                  }
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>💰 Payment Summary</h3>
              <div className="pricing-breakdown">
                <div className="price-item">
                  <span className="label">Package Price:</span>
                  <span className="value">${booking.b_packagePrice?.toFixed(2) || 'N/A'}</span>
                </div>
                {booking.b_discount > 0 && (
                  <div className="price-item">
                    <span className="label">Discount (10% off for double occupancy):</span>
                    <span className="value">-${booking.b_discount?.toFixed(2) || 'N/A'}</span>
                  </div>
                )}
                <div className="price-item total">
                  <span className="label">Total Amount:</span>
                  <span className="value">${booking.b_totalPrice?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="payment-status">
                  <span className="status-badge paid">✅ Payment Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="important-notes">
          <h3>📋 Important Information</h3>
          <div className="notes-list">
            <div className="note-item">
              <span className="note-icon">🕐</span>
              <span>Check-in time: 2:00 PM | Check-out time: 11:00 AM</span>
            </div>
            <div className="note-item">
              <span className="note-icon">📞</span>
              <span>Contact us at +91-XXXX-XXXX for any queries</span>
            </div>
            <div className="note-item">
              <span className="note-icon">📧</span>
              <span>Confirmation email sent to {booking.b_email || 'your registered email'}</span>
            </div>
            <div className="note-item">
              <span className="note-icon">📱</span>
              <span>Please bring a valid ID for check-in</span>
            </div>
            <div className="note-item">
              <span className="note-icon">🌿</span>
              <span>Dietary restrictions can be mentioned at check-in</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handlePrintConfirmation} className="btn-secondary">
            🖨️ Print Confirmation
          </button>
          <button onClick={handleNewBooking} className="btn-primary">
            📅 Book Another Stay
          </button>
          <button onClick={handleViewBookings} className="btn-outline">
            📋 View All Bookings
          </button>
        </div>

        <div className="footer-actions">
          <p>Need help? Contact our support team</p>
          <div className="contact-info">
            <span>📞 +91-XXXX-XXXX</span>
            <span>📧 support@sathvilla.com</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookingConfirmation;
