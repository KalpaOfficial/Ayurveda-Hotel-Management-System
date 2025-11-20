import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import axios from "axios";
import Booking from "./Booking";
import "./Booking.css";
import Footer from "../Footer/Footer";

const URL = "http://localhost:5000/bookings";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/signin");
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchHandler().then((data) => {
        // Filter bookings to show only current user's bookings
        const userBookings = data.bookings.filter(booking => 
          booking.b_email === user.email || booking.b_name === `${user.firstName} ${user.lastName}`
        );
        setBookings(userBookings);
      });
    }
  }, [user]);

  // Refresh bookings when component comes into focus (e.g., after navigation)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchHandler().then((data) => {
          const userBookings = data.bookings.filter(booking => 
            booking.b_email === user.email || booking.b_name === `${user.firstName} ${user.lastName}`
          );
          setBookings(userBookings);
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleDelete = (deletedId) => {
    setBookings((prev) => prev.filter((b) => b._id !== deletedId));
  };

  const handleRefresh = () => {
    if (user) {
      fetchHandler().then((data) => {
        const userBookings = data.bookings.filter(booking => 
          booking.b_email === user.email || booking.b_name === `${user.firstName} ${user.lastName}`
        );
        setBookings(userBookings);
      });
    }
  };

  const handleViewPayments = () => {
    // Navigate to the integrated payment history page
    navigate('/payment-history');
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="bookings-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="bookings-page">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Welcome back, {user?.firstName}! Here are your wellness retreat bookings.</p>
          <div className="header-buttons">
            <button onClick={handleRefresh} className="refresh-btn">
              🔄 Refresh
            </button>
            <button onClick={handleViewPayments} className="payments-btn">
              💳 My Payments
            </button>
          </div>
        </div>
        <div className="bookings-grid">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <Booking
                key={booking._id}
                booking={booking}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="no-bookings">
              <div className="no-bookings-icon">📅</div>
              <h3>No bookings yet</h3>
              <p>You haven't made any bookings yet. Start your wellness journey today!</p>
              <a href="/add-booking" className="btn-primary">Book Your Stay</a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Bookings;
