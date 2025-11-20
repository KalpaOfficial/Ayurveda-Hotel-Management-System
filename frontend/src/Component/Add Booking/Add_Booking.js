import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import { useNavigate } from "react-router";
import axios from "axios";
import Footer from "../Footer/Footer";
import Calendar from "../Calendar/Calendar";
import PaymentService from "../../services/paymentService";
import "../Add Booking/Add_Booking.css";

function Add_Booking() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [inputs, setInputs] = useState({
    b_name: "",
    b_email: "",
    b_phone: "",
    b_packageType: "",
    b_packageDuration: "",
    b_checkInDate: "",
    b_guest: 1,
    b_roomNumber: "",
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Package details from Ayurveda page
  const packageData = [
    {
      id: 1,
      title: "7 Days Rejuvenation",
      description: "A one-week journey to refresh and restore your energy.",
      fullDescription: "Our 7-day rejuvenation program is designed for those seeking a short yet deeply transformative Ayurvedic experience. With daily treatments, herbal therapies, yoga, and mindful nutrition, this package helps reduce stress, boost vitality, and leave you feeling refreshed from head to toe.",
      price: {
        season: "$950",
        offSeason: "$750",
      },
    },
    {
      id: 2,
      title: "14 Days Wellness",
      description: "Two weeks of holistic therapies for body and mind balance.",
      fullDescription: "This 14-day wellness package combines personalized Ayurvedic treatments, yoga sessions, meditation, and dietary guidance to restore balance across all three doshas — Vatha, Pitha, and Kapha. Perfect for guests looking to reset their lifestyle and cultivate sustainable well-being.",
      price: {
        season: "$1,800",
        offSeason: "$1,450",
      },
    },
    {
      id: 3,
      title: "21 Days Detox & Healing",
      description: "A complete detoxification and healing experience.",
      fullDescription: "Over 21 days, this immersive program gently cleanses the body of toxins while strengthening your inner systems through Panchakarma therapies, herbal medicines, and restorative practices. Ideal for those seeking long-term healing, deep detoxification, and renewed vitality.",
      price: {
        season: "$2,500",
        offSeason: "$2,100",
      },
    },
    {
      id: 4,
      title: "Weekend Refresh (3 Days)",
      description: "A quick escape to relax and recharge in nature.",
      fullDescription: "Perfect for a short getaway, this 3-day refresh package offers traditional Ayurvedic massages, herbal steam baths, and calming yoga sessions. Designed to melt away fatigue and stress, it's a weekend retreat that leaves you energized and at peace.",
      price: {
        season: "$450",
        offSeason: "$350",
      },
    },
    {
      id: 6,
      title: "Senior Wellness (10 Days)",
      description: "Gentle therapies designed for healthy aging and vitality.",
      fullDescription: "Tailored for seniors, this 10-day program focuses on joint care, improved mobility, memory enhancement, and relaxation. Using time-tested Ayurvedic therapies and Rasayana rejuvenation techniques, it helps maintain strength, energy, and peace of mind during graceful aging.",
      price: {
        season: "$1,600",
        offSeason: "$1,250",
      },
    },
  ];

  // Check if user is logged in and auto-fill user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Please login to make a booking!");
      navigate("/signin");
      return;
    }
    
    const user = JSON.parse(userData);
    setUser(user);
    
    // Auto-fill user data
    setInputs(prev => ({
      ...prev,
      b_name: `${user.firstName} ${user.lastName}`,
      b_email: user.email,
      b_phone: user.phone || ""
    }));
    
    setLoading(false);
  }, [navigate]);

  // handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If package type changes, update duration and reset calendar
    if (name === 'b_packageType') {
      const packageDurations = {
        '7 Days Rejuvenation': 7,
        '14 Days Wellness': 14,
        '21 Days Detox & Healing': 21,
        'Weekend Refresh (3 Days)': 3,
        'Senior Wellness (10 Days)': 10
      };
      
      setInputs(prev => ({
        ...prev,
        b_packageDuration: packageDurations[value] || '',
        b_checkInDate: '',
        b_roomNumber: '',
      }));
      setShowCalendar(false);
      setAvailability(null);
      setAvailableRooms([]);
      setPricing(null);
    }

    // If guest count changes, validate against room capacity
    if (name === 'b_guest') {
      const maxGuests = 2; // All rooms are double rooms
      if (parseInt(value) > maxGuests) {
        alert(`Maximum ${maxGuests} guests allowed per room`);
        return;
      }
    }
  };

  // Handle calendar date selection
  const handleDateSelect = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setInputs(prev => ({
      ...prev,
      b_checkInDate: dateString,
    }));
    setShowCalendar(false);
    checkAvailability(dateString);
    fetchAvailableRooms(dateString);
  };

  // Check availability for selected date
  const checkAvailability = async (checkInDate) => {
    if (!inputs.b_packageDuration) return;
    
    setCheckingAvailability(true);
    try {
      const response = await axios.post('http://localhost:5000/bookings/availability/check', {
        checkInDate,
        packageDuration: parseInt(inputs.b_packageDuration)
      });
      setAvailability(response.data);
      
      // Update available rooms if we have them
      if (response.data.availableRooms) {
        setAvailableRooms(response.data.availableRooms);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailability({ available: false });
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Fetch available rooms for selected dates
  const fetchAvailableRooms = async (checkInDate) => {
    if (!inputs.b_packageDuration) return;
    
    try {
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + parseInt(inputs.b_packageDuration));
      
      const response = await axios.get('http://localhost:5000/bookings/rooms/available', {
        params: {
          checkInDate,
          checkOutDate: checkOutDate.toISOString().split('T')[0]
        }
      });
      setAvailableRooms(response.data.availableRooms);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRooms([]);
    }
  };

  // Calculate pricing when all required fields are filled
  const calculatePricing = async () => {
    if (!inputs.b_packageType || !inputs.b_packageDuration) {
      return;
    }
    
    try {
      const params = {
        packageType: inputs.b_packageType,
        duration: inputs.b_packageDuration,
        guestCount: inputs.b_guest
      };
      
      // Add check-in date if available for accurate season calculation
      if (inputs.b_checkInDate) {
        params.checkInDate = inputs.b_checkInDate;
      }
      
      const response = await axios.get('http://localhost:5000/bookings/pricing', { params });
      setPricing(response.data.pricing);
    } catch (error) {
      console.error('Error calculating pricing:', error);
    }
  };

  // Effect to calculate pricing when relevant fields change
  useEffect(() => {
    calculatePricing();
  }, [inputs.b_packageType, inputs.b_packageDuration, inputs.b_guest, inputs.b_checkInDate]);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Validate form before submission
  const validateForm = () => {
    
    if (!inputs.b_roomNumber) {
      alert('Please select a room');
      return false;
    }
    
    if (parseInt(inputs.b_guest) > 2) {
      alert('Maximum 2 guests allowed per room');
      return false;
    }
    
    if (!pricing) {
      alert('Please wait for pricing calculation');
      return false;
    }
    
    if (!availability || !availability.available || availableRooms.length === 0) {
      alert('No rooms available for the selected dates');
      return false;
    }
    
    return true;
  };

  // submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate pricing synchronously if not already calculated
    if (inputs.b_packageType && inputs.b_packageDuration && !pricing) {
      try {
        const params = {
          packageType: inputs.b_packageType,
          duration: inputs.b_packageDuration,
          guestCount: inputs.b_guest
        };
        
        // Add check-in date if available for accurate season calculation
        if (inputs.b_checkInDate) {
          params.checkInDate = inputs.b_checkInDate;
        }
        
        const response = await axios.get('http://localhost:5000/bookings/pricing', { params });
        setPricing(response.data.pricing);
        
        // Wait for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error calculating pricing synchronously:', error);
        alert('Error calculating pricing. Please try again.');
        return;
      }
    }

    if (!validateForm()) {
      return;
    }

    // Show payment instead of directly submitting
    setShowPayment(true);
  };

  // Process payment and create booking
  const processPayment = async () => {
    setProcessingPayment(true);
    
    try {
      // Prepare booking data with all required fields including pricing
      const bookingData = {
        ...inputs,
        b_packageDuration: parseInt(inputs.b_packageDuration),
        b_roomNumber: parseInt(inputs.b_roomNumber),
        b_packagePrice: pricing?.packagePrice || 0,
        b_roomPrice: pricing?.roomPrice || 0,
        b_totalPrice: pricing?.totalPrice || 0,
        b_occupancyType: pricing?.occupancyType || 'Double',
        b_checkOutDate: pricing?.checkOutDate || null
      };

      // Prepare payment data for Stripe
      const paymentData = {
        name: inputs.b_name,
        email: inputs.b_email,
        amount: pricing?.totalPrice || 100, // Send LKR amount directly as USD (no conversion)
        packageType: `${inputs.b_packageType} (${inputs.b_packageDuration} days)`,
        bookingData: bookingData
      };

      // Redirect to Stripe checkout - this will handle the payment and booking creation
      await PaymentService.checkoutFromBooking(paymentData);
      
    } catch (err) {
      console.error('Error initiating payment:', err);
      const errorMessage = err.message || "Failed to initiate payment";
      alert(`❌ ${errorMessage}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="form-container">
          <div className="loading-message">Loading booking form...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="form-container">
        <h2 className="form-title">Book Your Ayurveda Package</h2>
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Name */}
          <label>Full Name</label>
          <input
            type="text"
            name="b_name"
            value={inputs.b_name}
            onChange={handleChange}
            required
          />

          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            name="b_email"
            value={inputs.b_email}
            onChange={handleChange}
          />

          {/* Phone */}
          <label>Phone</label>
          <input
            type="tel"
            name="b_phone"
            value={inputs.b_phone}
            onChange={handleChange}
            required
          />

          {/* Package Type */}
          <label>Package Type</label>
          <select
            name="b_packageType"
            value={inputs.b_packageType}
            onChange={handleChange}
            required
          >
            <option value="">Select Package Type</option>
            <option value="7 Days Rejuvenation">7 Days Rejuvenation</option>
            <option value="14 Days Wellness">14 Days Wellness</option>
            <option value="21 Days Detox & Healing">21 Days Detox & Healing</option>
            <option value="Weekend Refresh (3 Days)">Weekend Refresh (3 Days)</option>
            <option value="Senior Wellness (10 Days)">Senior Wellness (10 Days)</option>
          </select>

          {/* Package Details Display */}
          {inputs.b_packageType && (() => {
            const selectedPackage = packageData.find(pkg => pkg.title === inputs.b_packageType);
            return selectedPackage ? (
              <div className="package-details-section">
                <h3>📋 Package Details</h3>
                <div className="package-details-card">
                  <div className="package-header">
                    <h4>{selectedPackage.title}</h4>
                    <div className="package-meta">
                      <span className="package-duration">{selectedPackage.title.split(' ')[0]} {selectedPackage.title.split(' ')[1]}</span>
                      <div className="package-prices">
                        <span className="price-label">Season:</span> {selectedPackage.price.season}
                        <span className="price-label">Off-Season:</span> {selectedPackage.price.offSeason}
                      </div>
                    </div>
                  </div>
                  
                  <div className="package-description">
                    <p><strong>Description:</strong> {selectedPackage.description}</p>
                  </div>

                  <div className="package-full-description">
                    <p>{selectedPackage.fullDescription}</p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Package Duration */}
          <label>Package Duration (Days)</label>
          <input
            type="number"
            name="b_packageDuration"
            value={inputs.b_packageDuration}
            onChange={handleChange}
            min="1"
            max={30}
            required
            disabled={inputs.b_packageType && inputs.b_packageType !== ''}
          />

          {/* Check-In Date */}
          <label>Check-In Date</label>
          <div className="date-input-container">
            <input
              type="text"
              name="b_checkInDate"
              value={inputs.b_checkInDate}
              onChange={handleChange}
              placeholder="Select check-in date"
              readOnly
              required
            />
            <button
              type="button"
              className="calendar-toggle-btn"
              onClick={() => setShowCalendar(!showCalendar)}
              disabled={!inputs.b_packageDuration}
            >
              📅
            </button>
          </div>
          
          {showCalendar && inputs.b_packageDuration && (
            <div className="calendar-wrapper">
              <Calendar
                selectedDate={inputs.b_checkInDate ? new Date(inputs.b_checkInDate) : null}
                onDateSelect={handleDateSelect}
                packageDuration={parseInt(inputs.b_packageDuration)}
              />
            </div>
          )}

          {/* Availability Status */}
          {checkingAvailability && (
            <div className="availability-status checking">
              🔍 Checking availability...
            </div>
          )}
          
          {availability && !checkingAvailability && (
            <div className={`availability-status ${availability.available ? 'available' : 'unavailable'}`}>
              {availability.available ? (
                `✅ ${availability.availableCount} room(s) available! Check-out: ${availability.checkOutDate}`
              ) : (
                '❌ No rooms available for selected dates'
              )}
            </div>
          )}

          {/* Guests */}
          <label>Number of Guests</label>
          <input
            type="number"
            name="b_guest"
            value={inputs.b_guest}
            onChange={handleChange}
            min="1"
            max="2"
            required
          />
          <small className="form-note">
            Maximum 2 guests allowed per room (all rooms are double rooms)
          </small>

          {/* Room Selection */}
          <label>Select Room</label>
          <select
            name="b_roomNumber"
            value={inputs.b_roomNumber}
            onChange={handleChange}
            required
            disabled={!inputs.b_checkInDate || availableRooms.length === 0}
          >
            <option value="">{availableRooms.length === 0 ? 'No rooms available' : 'Select Room'}</option>
            {availableRooms.map(roomNumber => (
              <option key={roomNumber} value={roomNumber}>Room {roomNumber}</option>
            ))}
          </select>
          {inputs.b_checkInDate && (
            <small className="form-note">
              {availableRooms.length > 0 
                ? `${availableRooms.length} room(s) available for selected dates (${12 - availableRooms.length} occupied)`
                : 'All 12 rooms are occupied for selected dates'
              }
            </small>
          )}

          {/* Pricing Display */}
          {pricing && (
            <div className="pricing-section">
              <h3>💰 Pricing Breakdown</h3>
              <div className="pricing-details">
                <div className="price-item">
                  <span>Package Price ({inputs.b_packageDuration} days):</span>
                  <span>${pricing.packagePrice.toFixed(2)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="price-item discount">
                    <span>Discount (10% off for double occupancy):</span>
                    <span>-${pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="price-item total">
                  <span><strong>Total Price:</strong></span>
                  <span><strong>${pricing.totalPrice.toFixed(2)}</strong></span>
                </div>
                <div className="price-item season">
                  <span>Season:</span>
                  <span>{pricing.season}</span>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn">
            Proceed to Payment
          </button>
        </form>

        {/* Payment Modal */}
        {showPayment && pricing && (
          <div className="payment-modal">
            <div className="payment-content">
              <h3>💳 Payment Portal</h3>
              <div className="payment-summary">
                <h4>Booking Summary</h4>
                <div className="summary-item">
                  <span>Guest:</span>
                  <span>{inputs.b_name}</span>
                </div>
                <div className="summary-item">
                  <span>Package:</span>
                  <span>{inputs.b_packageType} ({inputs.b_packageDuration} days)</span>
                </div>
                <div className="summary-item">
                  <span>Room:</span>
                  <span>Room {inputs.b_roomNumber} ({inputs.b_guest} guest{inputs.b_guest > 1 ? 's' : ''})</span>
                </div>
                <div className="summary-item">
                  <span>Check-in:</span>
                  <span>{formatDate(new Date(inputs.b_checkInDate))}</span>
                </div>
                <div className="summary-item">
                  <span>Check-out:</span>
                  <span>{formatDate(new Date(new Date(inputs.b_checkInDate).getTime() + inputs.b_packageDuration * 24 * 60 * 60 * 1000))}</span>
                </div>
                <div className="summary-item total">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>${pricing.totalPrice.toFixed(2)}</strong></span>
                </div>
              </div>
              
              <div className="payment-methods">
                <h4>Payment Methods</h4>
                {processingPayment ? (
                  <div className="payment-processing">
                    <div className="processing-spinner">⏳</div>
                    <p>Processing your payment...</p>
                    <p className="processing-note">Please wait while we confirm your booking</p>
                  </div>
                ) : (
                  <div className="payment-options">
                    <button className="payment-btn" onClick={processPayment}>
                      💳 Pay with Card
                    </button>
                    <button className="payment-btn" onClick={processPayment}>
                      📱 UPI Payment
                    </button>
                    <button className="payment-btn" onClick={processPayment}>
                      🏦 Net Banking
                    </button>
                  </div>
                )}
              </div>
              
              <div className="payment-actions">
                <button className="cancel-btn" onClick={() => setShowPayment(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Add_Booking;
