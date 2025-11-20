import React from "react";
import { useNavigate } from "react-router-dom";

function Booking({ booking, onDelete }) {
  const navigate = useNavigate();
  const {
    b_name,
    b_email,
    b_phone,
    b_packageDuration,
    b_checkInDate,
    b_guest,
    b_createdAt,
    _id,
  } = booking;

  const handleUpdateRequest = () => {
    // Navigate to About Us page with update request parameter and booking ID
    navigate(`/about?request=update&bookingId=${_id}`);
    // Scroll to contact form after navigation
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCancellationRequest = () => {
    // Navigate to About Us page with cancellation request parameter and booking ID
    navigate(`/about?request=cancellation&bookingId=${_id}`);
    // Scroll to contact form after navigation
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="booking-card">
      <div className="booking-details">
        <h3 className="booking-name">{b_name}</h3>
        <p className="booking-meta">
          <strong>Email:</strong> {b_email || "N/A"}
        </p>
        <p className="booking-meta">
          <strong>Phone:</strong> {b_phone}
        </p>
        <p className="booking-meta">
          <strong>Package:</strong> {b_packageDuration}
        </p>
        <p className="booking-meta">
          <strong>Check-In:</strong>{" "}
          {new Date(b_checkInDate).toLocaleDateString()}
        </p>
        <p className="booking-meta">
          <strong>Guests:</strong> {b_guest}
        </p>
        <p className="booking-meta">
          <strong>Booked At:</strong>{" "}
          {new Date(b_createdAt).toLocaleString()}
        </p>

        <div className="booking-actions">
          <button className="btn update-btn" onClick={handleUpdateRequest}>
            Request to Update
          </button>
          <button className="btn delete-btn" onClick={handleCancellationRequest}>
            Request to Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

export default Booking;
