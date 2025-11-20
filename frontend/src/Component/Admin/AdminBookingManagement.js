import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBookingManagement.css';
import { FaEdit, FaTrash, FaUser, FaUserShield, FaSearch } from "react-icons/fa";
import AdminUpdateBooking from './AdminUpdateBooking';

function AdminBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'list', 'analytics'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [availabilityStats, setAvailabilityStats] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchAvailabilityStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityStats = async () => {
    try {
      // Get comprehensive booking statistics
      const response = await axios.get('http://localhost:5000/bookings/stats');
      setAvailabilityStats(response.data);
    } catch (error) {
      console.error('Error fetching availability stats:', error);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`http://localhost:5000/bookings/${bookingId}`);
        setBookings(bookings.filter(booking => booking._id !== bookingId));
        fetchAvailabilityStats(); // Refresh stats
        alert('Booking deleted successfully');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
      }
    }
  };

  const copyBookingId = (bookingId) => {
    navigator.clipboard.writeText(bookingId).then(() => {
      alert('Booking ID copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bookingId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Booking ID copied to clipboard!');
    });
  };

  const handleUpdateBooking = (bookingId) => {
    setEditingBooking(bookingId);
  };

  const handleBackFromUpdate = () => {
    setEditingBooking(null);
    fetchBookings(); // Refresh bookings list
    fetchAvailabilityStats(); // Refresh stats
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoomStatus = (roomNumber, checkInDate, checkOutDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (today < checkIn) {
      return { status: 'upcoming', color: '#ffc107', text: 'Upcoming' };
    } else if (today >= checkIn && today < checkOut) {
      return { status: 'occupied', color: '#dc3545', text: 'Occupied' };
    } else {
      return { status: 'completed', color: '#28a745', text: 'Completed' };
    }
  };

  const getPackageColor = (packageType) => {
    const colors = {
      '7 Days Rejuvenation': '#6f42c1',
      '14 Days Wellness': '#28a745',
      '21 Days Detox & Healing': '#fd7e14',
      'Weekend Refresh (3 Days)': '#17a2b8',
      'Senior Wellness (10 Days)': '#e83e8c'
    };
    return colors[packageType] || '#6c757d';
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = booking.b_name.toLowerCase().includes(searchLower) ||
                         booking.b_email?.toLowerCase().includes(searchLower) ||
                         booking._id.toLowerCase().includes(searchLower);
    const matchesPackage = !filterPackage || booking.b_packageType === filterPackage;
    const matchesRoom = !filterRoom || booking.b_roomNumber.toString() === filterRoom;
    
    return matchesSearch && matchesPackage && matchesRoom;
  });

  const getRoomOccupancy = () => {
    const roomOccupancy = {};
    for (let i = 1; i <= 12; i++) {
      roomOccupancy[i] = {
        roomNumber: i,
        bookings: [],
        status: 'available'
      };
    }

    bookings.forEach(booking => {
      const roomNum = booking.b_roomNumber;
      if (roomOccupancy[roomNum]) {
        roomOccupancy[roomNum].bookings.push(booking);
        const roomStatus = getRoomStatus(roomNum, booking.b_checkInDate, booking.b_checkOutDate);
        if (roomStatus.status === 'occupied') {
          roomOccupancy[roomNum].status = 'occupied';
        }
      }
    });

    return Object.values(roomOccupancy);
  };

  const getAnalytics = () => {
    const totalBookings = bookings.length;
    const packageCounts = bookings.reduce((acc, booking) => {
      acc[booking.b_packageType] = (acc[booking.b_packageType] || 0) + 1;
      return acc;
    }, {});

    const roomOccupancy = getRoomOccupancy();
    const occupiedRooms = roomOccupancy.filter(room => room.status === 'occupied').length;
    const availableRooms = 12 - occupiedRooms;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.b_checkInDate);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    }).length;

    return {
      totalBookings,
      packageCounts,
      occupiedRooms,
      availableRooms,
      monthlyBookings
    };
  };

  const renderCalendarView = () => {
    const roomOccupancy = getRoomOccupancy();
    
    return (
      <div className="calendar-view">
        <h3>📅 Room Calendar View</h3>
        <div className="room-grid">
          {roomOccupancy.map(room => (
            <div key={room.roomNumber} className={`room-card ${room.status}`}>
              <div className="room-header">
                <h4>Room {room.roomNumber}</h4>
                <span className={`room-status ${room.status}`}>
                  {room.status === 'occupied' ? '🔴 Occupied' : '🟢 Available'}
                </span>
              </div>
              <div className="room-bookings">
                {room.bookings.map(booking => {
                  const roomStatus = getRoomStatus(room.roomNumber, booking.b_checkInDate, booking.b_checkOutDate);
                  return (
                    <div key={booking._id} className="booking-item" style={{ borderLeftColor: getPackageColor(booking.b_packageType) }}>
                      <div className="booking-dates">
                        {formatDate(booking.b_checkInDate)} - {formatDate(booking.b_checkOutDate)}
                      </div>
                      <div className="booking-details">
                        <strong>{booking.b_name}</strong>
                        <span className="package-type" style={{ color: getPackageColor(booking.b_packageType) }}>
                          {booking.b_packageType}
                        </span>
                        <span className={`booking-status ${roomStatus.status}`}>
                          {roomStatus.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="list-view">
        <h3>📋 All Bookings</h3>
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Details</th>
                <th>Package</th>
                <th>Room & Dates</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => {
                const roomStatus = getRoomStatus(booking.b_roomNumber, booking.b_checkInDate, booking.b_checkOutDate);
                return (
                  <tr key={booking._id}>
                    <td>
                      <div className="booking-id">
                        <code 
                          className="booking-id-code" 
                          onClick={() => copyBookingId(booking._id)}
                          title="Click to copy booking ID"
                        >
                          {booking._id}
                        </code>
                      </div>
                    </td>
                    <td>
                      <div className="guest-details">
                        <div className="guest-name">{booking.b_name}</div>
                        <div className="guest-email">{booking.b_email}</div>
                        <div className="guest-phone">{booking.b_phone}</div>
                        <div className="guest-count">
                          👥 {booking.b_guest} guest{booking.b_guest > 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="package-name">
                        {booking.b_packageType}
                      </div>
                    </td>
                    <td>
                      <div className="room-dates">
                        <div className="room-info">
                          <span className="room-number">Room {booking.b_roomNumber}</span>
                        </div>
                        <div className="date-info">
                          <div className="checkin-date">
                            <strong>Check-in:</strong> {formatDate(booking.b_checkInDate)}
                          </div>
                          <div className="checkout-date">
                            <strong>Check-out:</strong> {formatDate(booking.b_checkOutDate)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-details">
                        <div className="price-amount">
                          ${booking.b_totalPrice?.toFixed(2) || 'N/A'}
                        </div>
                        {booking.b_discount > 0 && (
                          <div className="discount-info">
                            -${booking.b_discount?.toFixed(2)} discount
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`status-badge ${roomStatus.status}`}
                        style={{ backgroundColor: roomStatus.color }}
                      >
                        {roomStatus.text}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => handleUpdateBooking(booking._id)}
                        >
                          <FaEdit />Update Booking
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteBooking(booking._id)}
                        >
                          <FaTrash />Cancel Booking
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    const analytics = getAnalytics();
    
    return (
      <div className="analytics-view">
        <h3>📊 Booking Analytics & Availability</h3>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Bookings</h4>
            <div className="stat-number">{analytics.totalBookings}</div>
          </div>
          
          <div className="stat-card">
            <h4>Available Rooms</h4>
            <div className="stat-number available">{analytics.availableRooms}/12</div>
          </div>
          
          <div className="stat-card">
            <h4>Occupied Rooms</h4>
            <div className="stat-number occupied">{analytics.occupiedRooms}/12</div>
          </div>
          
          <div className="stat-card">
            <h4>This Month</h4>
            <div className="stat-number">{analytics.monthlyBookings}</div>
          </div>
          
          <div className="stat-card">
            <h4>Total Revenue</h4>
            <div className="stat-number revenue">
              ${bookings.reduce((sum, b) => sum + (b.b_totalPrice || 0), 0).toFixed(2)}
            </div>
          </div>
          
          <div className="stat-card">
            <h4>Avg. Booking Value</h4>
            <div className="stat-number">
              ${analytics.totalBookings > 0 ? (bookings.reduce((sum, b) => sum + (b.b_totalPrice || 0), 0) / analytics.totalBookings).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        {availabilityStats && (
          <div className="revenue-card">
            <h4>💰 Revenue Overview</h4>
            <div className="revenue-amount">
              ${availabilityStats.totalRevenue?.toFixed(2) || '0.00'}
            </div>
            <small>Total revenue from all bookings</small>
          </div>
        )}

        <div className="package-breakdown">
          <h4>Package Distribution</h4>
          <div className="package-stats">
            {Object.entries(analytics.packageCounts).map(([packageType, count]) => (
              <div key={packageType} className="package-stat">
                <div 
                  className="package-bar" 
                  style={{ 
                    backgroundColor: getPackageColor(packageType),
                    width: `${analytics.totalBookings > 0 ? (count / analytics.totalBookings) * 100 : 0}%`
                  }}
                ></div>
                <span className="package-label">
                  {packageType}: {count} bookings
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="room-availability">
          <h4>Room Availability Status</h4>
          <div className="room-status-grid">
            {getRoomOccupancy().map(room => (
              <div key={room.roomNumber} className={`room-status-item ${room.status}`}>
                <span className="room-number">Room {room.roomNumber}</span>
                <span className="room-status-text">
                  {room.status === 'occupied' ? '🔴 Occupied' : '🟢 Available'}
                </span>
                <span className="booking-count">
                  {room.bookings.length} booking{room.bookings.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="date-range-info">
          <h4>📅 Date Range Analysis</h4>
          <div className="date-stats">
            <div className="date-stat">
              <strong>Earliest Booking:</strong> {bookings.length > 0 ? formatDate(Math.min(...bookings.map(b => new Date(b.b_checkInDate)))) : 'N/A'}
            </div>
            <div className="date-stat">
              <strong>Latest Booking:</strong> {bookings.length > 0 ? formatDate(Math.max(...bookings.map(b => new Date(b.b_checkOutDate)))) : 'N/A'}
            </div>
            <div className="date-stat">
              <strong>Average Stay Duration:</strong> {analytics.totalBookings > 0 ? (bookings.reduce((sum, b) => sum + b.b_packageDuration, 0) / analytics.totalBookings).toFixed(1) : '0'} days
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  // Show update booking form if editing
  if (editingBooking) {
    return (
      <AdminUpdateBooking 
        bookingId={editingBooking} 
        onBack={handleBackFromUpdate}
      />
    );
  }

  return (
    <div className="admin-booking-management">
      <div className="booking-header">
        <h2>📅 Booking Management</h2>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
          <button 
            className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => setViewMode('analytics')}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {(viewMode === 'list' || viewMode === 'calendar') && (
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name, email, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
            className="filter-select"
          >
            <option value="">All Packages</option>
            <option value="7 Days Rejuvenation">7 Days Rejuvenation</option>
            <option value="14 Days Wellness">14 Days Wellness</option>
            <option value="21 Days Detox & Healing">21 Days Detox & Healing</option>
            <option value="Weekend Refresh (3 Days)">Weekend Refresh (3 Days)</option>
            <option value="Senior Wellness (10 Days)">Senior Wellness (10 Days)</option>
          </select>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="filter-select"
          >
            <option value="">All Rooms</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Room {i + 1}</option>
                ))}
          </select>
        </div>
      )}

      <div className="booking-content">
        {viewMode === 'calendar' && renderCalendarView()}
        {viewMode === 'list' && renderListView()}
        {viewMode === 'analytics' && renderAnalyticsView()}
      </div>
    </div>
  );
}

export default AdminBookingManagement;

