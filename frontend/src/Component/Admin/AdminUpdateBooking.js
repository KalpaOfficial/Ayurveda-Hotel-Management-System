import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Add Product/Add_Product.css";
import "./AdminUpdateBooking.css";

function AdminUpdateBooking({ bookingId, onBack }) {
  const [inputs, setInputs] = useState({
    b_name: "",
    b_email: "",
    b_phone: "",
    b_packageType: "",
    b_packageDuration: "",
    b_checkInDate: "",
    b_checkOutDate: "",
    b_guest: "",
    b_roomNumber: "",
    b_totalPrice: "",
    b_discount: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Package options with their corresponding durations
  const packageOptions = [
    { name: "7 Days Rejuvenation", duration: 7 },
    { name: "14 Days Wellness", duration: 14 },
    { name: "21 Days Detox & Healing", duration: 21 },
    { name: "Weekend Refresh (3 Days)", duration: 3 },
    { name: "Senior Wellness (10 Days)", duration: 10 }
  ];

  // Fetch existing booking data
  useEffect(() => {
    if (!bookingId) return;
    
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/bookings/${bookingId}`);
        const bookingData = response.data.booking;
        
        setInputs({
          b_name: bookingData.b_name || "",
          b_email: bookingData.b_email || "",
          b_phone: bookingData.b_phone || "",
          b_packageType: bookingData.b_packageType || "",
          b_packageDuration: bookingData.b_packageDuration || "",
          b_checkInDate: bookingData.b_checkInDate ? bookingData.b_checkInDate.split('T')[0] : "",
          b_checkOutDate: bookingData.b_checkOutDate ? bookingData.b_checkOutDate.split('T')[0] : "",
          b_guest: bookingData.b_guest || "",
          b_roomNumber: bookingData.b_roomNumber || "",
          b_totalPrice: bookingData.b_totalPrice || "",
          b_discount: bookingData.b_discount || "",
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching booking:", error);
        setError("Failed to load booking data");
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-select package duration when package type changes
  useEffect(() => {
    if (inputs.b_packageType) {
      const selectedPackage = packageOptions.find(pkg => pkg.name === inputs.b_packageType);
      if (selectedPackage) {
        setInputs(prev => ({
          ...prev,
          b_packageDuration: selectedPackage.duration
        }));
      }
    }
  }, [inputs.b_packageType]);

  // Calculate checkout date when check-in date or duration changes
  useEffect(() => {
    if (inputs.b_checkInDate && inputs.b_packageDuration) {
      const checkInDate = new Date(inputs.b_checkInDate);
      const duration = parseInt(inputs.b_packageDuration);
      
      if (!isNaN(duration) && duration > 0) {
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkInDate.getDate() + duration);
        
        setInputs(prev => ({
          ...prev,
          b_checkOutDate: checkOutDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [inputs.b_checkInDate, inputs.b_packageDuration]);

  // Validate form
  const validateForm = () => {
    if (!inputs.b_name.trim()) {
      setError("Guest name is required");
      return false;
    }
    if (!inputs.b_email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!inputs.b_phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!inputs.b_packageType) {
      setError("Package type is required");
      return false;
    }
    if (!inputs.b_packageDuration || inputs.b_packageDuration < 1) {
      setError("Package duration must be at least 1 day");
      return false;
    }
    if (!inputs.b_checkInDate) {
      setError("Check-in date is required");
      return false;
    }
    if (!inputs.b_guest || inputs.b_guest < 1 || inputs.b_guest > 2) {
      setError("Number of guests must be 1 or 2");
      return false;
    }
    if (!inputs.b_roomNumber || inputs.b_roomNumber < 1 || inputs.b_roomNumber > 12) {
      setError("Room number must be between 1 and 12");
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        b_name: inputs.b_name,
        b_email: inputs.b_email,
        b_phone: inputs.b_phone,
        b_packageType: inputs.b_packageType,
        b_packageDuration: parseInt(inputs.b_packageDuration),
        b_checkInDate: inputs.b_checkInDate,
        b_checkOutDate: inputs.b_checkOutDate,
        b_guest: parseInt(inputs.b_guest),
        b_roomNumber: parseInt(inputs.b_roomNumber),
        b_totalPrice: parseFloat(inputs.b_totalPrice),
        b_discount: parseFloat(inputs.b_discount) || 0,
      };

      await axios.put(`http://localhost:5000/bookings/${bookingId}`, updateData);

      alert("✅ Booking updated successfully!");
      onBack(); // Go back to bookings view
    } catch (err) {
      console.error(err);
      setError("❌ Failed to update booking. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <div className="loading-container">
          <h3>Loading booking data...</h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="product-header">
        <h2>✏️ Update Booking</h2>
        <button 
          className="btn-back"
          onClick={onBack}
        >
          ← Back to Bookings
        </button>
      </div>

      <div className="form-container">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Guest Information */}
          <div className="section-container guest-section">
            <h3 className="section-header">
              👤 Guest Information
            </h3>
            
            <label>Guest Name</label>
            <input
              type="text"
              name="b_name"
              value={inputs.b_name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="b_email"
              value={inputs.b_email}
              onChange={handleChange}
              required
            />

            <label>Phone Number</label>
            <input
              type="tel"
              name="b_phone"
              value={inputs.b_phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Booking Details */}
          <div className="section-container booking-section">
            <h3 className="section-header">
              📅 Booking Details
            </h3>

            <label>Package Type</label>
            <select
              name="b_packageType"
              value={inputs.b_packageType}
              onChange={handleChange}
              required
            >
              <option value="">Select Package</option>
              {packageOptions.map((pkg) => (
                <option key={pkg.name} value={pkg.name}>{pkg.name}</option>
              ))}
            </select>

            <label>Package Duration (Days)</label>
            <input
              type="number"
              name="b_packageDuration"
              value={inputs.b_packageDuration}
              onChange={handleChange}
              min="1"
              max="30"
              required
              readOnly
              className="package-duration-input"
            />
            <p className="package-duration-help">
              Duration is automatically set based on the selected package type
            </p>

            <label>Check-in Date</label>
            <input
              type="date"
              name="b_checkInDate"
              value={inputs.b_checkInDate}
              onChange={handleChange}
              required
            />

            <label>Check-out Date</label>
            <input
              type="date"
              name="b_checkOutDate"
              value={inputs.b_checkOutDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Room & Guest Information */}
          <div className="section-container room-section">
            <h3 className="section-header">
              🏨 Room & Guest Information
            </h3>

            <label>Number of Guests</label>
            <select
              name="b_guest"
              value={inputs.b_guest}
              onChange={handleChange}
              required
            >
              <option value="">Select Guests</option>
              <option value="1">1 Guest (Single)</option>
              <option value="2">2 Guests (Double)</option>
            </select>

            <label>Room Number</label>
            <select
              name="b_roomNumber"
              value={inputs.b_roomNumber}
              onChange={handleChange}
              required
            >
              <option value="">Select Room</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Room {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Pricing Information */}
          <div className="section-container pricing-section">
            <h3 className="section-header">
              💰 Pricing Information
            </h3>

            <label>Total Price ($)</label>
            <input
              type="number"
              name="b_totalPrice"
              value={inputs.b_totalPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />

            <label>Discount ($)</label>
            <input
              type="number"
              name="b_discount"
              value={inputs.b_discount}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <button type="submit" className="submit-btn">
            Update Booking
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUpdateBooking;
