import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";
import { useNavigate, useParams } from "react-router";

function Update_Booking() {
  const [inputs, setInputs] = useState({});
  const history = useNavigate();
  const { id } = useParams();

  // Fetch booking data by ID
  useEffect(() => {
    const fetchHandler = async () => {
      const res = await axios.get(`http://localhost:5000/bookings/${id}`);
      setInputs(res.data.booking);
    };
    fetchHandler();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit updated data
  const sendRequest = async () => {
    await axios.put(`http://localhost:5000/bookings/${id}`, inputs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest().then(() => {
      alert("✅ Booking updated successfully!");
      history("/bookings");
    });
  };

  return (
    <div>
      <Nav />
      <div className="form-container">
        <h2 className="form-title">Update Booking</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <label>Name</label>
          <input
            type="text"
            name="b_name"
            value={inputs.b_name || ""}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="b_email"
            value={inputs.b_email || ""}
            onChange={handleChange}
          />

          <label>Phone</label>
          <input
            type="text"
            name="b_phone"
            value={inputs.b_phone || ""}
            onChange={handleChange}
            required
          />

          <label>Package Duration</label>
          <input
            type="text"
            name="b_packageDuration"
            value={inputs.b_packageDuration || ""}
            onChange={handleChange}
            required
          />

          <label>Check-In Date</label>
          <input
            type="date"
            name="b_checkInDate"
            value={inputs.b_checkInDate ? inputs.b_checkInDate.split("T")[0] : ""}
            onChange={handleChange}
            required
          />

          <label>Guests</label>
          <input
            type="number"
            name="b_guest"
            value={inputs.b_guest || 1}
            onChange={handleChange}
            min="1"
            required
          />

          <button type="submit" className="submit-btn">
            Save Booking
          </button>
        </form>
      </div>
    </div>
  );
}

export default Update_Booking;
