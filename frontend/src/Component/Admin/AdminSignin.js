import React, { useState } from "react";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Signin/Signin.css"; // reuse existing Signin.css

function AdminSignin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/users/login", formData);
      const user = res.data.user;

      if (user.role !== "admin") {
        setError("⚠️ Access denied. Admins only.");
        return;
      }

      localStorage.setItem("admin", JSON.stringify(user));
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="signin-page">
      <div className="bg-image" aria-hidden="true" />
      <Nav />
      <div className="signin-wrapper">
        <div className="signin-box">
          <h2>Admin Sign In</h2>
          <form onSubmit={handleSubmit} className="signin-form" noValidate>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your admin email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="signin-btn">
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminSignin;
