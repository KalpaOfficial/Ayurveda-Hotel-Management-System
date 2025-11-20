import React, { useState } from "react";
import "./Signin.css";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/users/login",
        formData
      );

      if (response.status === 200) {
        const user = response.data.user;
        
        // Save user info in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        
        // Role-based routing
        if (user.role === "admin") {
          alert("✅ Admin login successful!");
          navigate("/admin-dashboard"); // Redirect to admin dashboard
        } else {
          alert("✅ Login successful!");
          navigate("/"); // Redirect to user home
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        alert("❌ Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="signin-page">
      <div className="bg-image" aria-hidden="true" />
      <Nav />

      <div className="signin-wrapper">
        <div className="signin-box">
          <h2>Log In</h2>

          <form onSubmit={handleSubmit} className="signin-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </span>
              </div>
            </div>

            <button type="submit" className="signin-btn">
              Log In
            </button>
          </form>

          <p className="signup-link">
            Don’t have an account? <a href="/Signup">Sign Up</a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Signin;
