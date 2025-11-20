import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calendar.css';

const Calendar = ({ selectedDate, onDateSelect, packageDuration, disabled = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch unavailable dates when package duration changes
  useEffect(() => {
    if (packageDuration) {
      fetchUnavailableDates();
    }
  }, [packageDuration]);

  const fetchUnavailableDates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/bookings/availability/unavailable-dates?packageDuration=${packageDuration}`);
      setUnavailableDates(response.data.unavailableDates);
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateUnavailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return unavailableDates.includes(dateString);
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateDisabled = (date) => {
    return isDateInPast(date) || isDateUnavailable(date) || disabled;
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const days = getDaysInMonth(currentMonth);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          type="button"
          className="nav-button" 
          onClick={() => navigateMonth(-1)}
          disabled={loading}
        >
          ‹
        </button>
        <h3 className="month-year">{formatDate(currentMonth)}</h3>
        <button 
          type="button"
          className="nav-button" 
          onClick={() => navigateMonth(1)}
          disabled={loading}
        >
          ›
        </button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-header">{day}</div>
        ))}
        
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="empty-day"></div>;
          }
          
          const isSelected = selectedDate && 
            day.getDate() === selectedDate.getDate() &&
            day.getMonth() === selectedDate.getMonth() &&
            day.getFullYear() === selectedDate.getFullYear();
          
          const isDisabled = isDateDisabled(day);
          const isUnavailable = isDateUnavailable(day);
          
          return (
            <button
              type="button"
              key={index}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isUnavailable ? 'unavailable' : ''}`}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              title={isUnavailable ? 'No rooms available' : ''}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
      
      {loading && <div className="loading-indicator">Loading availability...</div>}
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <div className="legend-color past"></div>
          <span>Past dates</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
