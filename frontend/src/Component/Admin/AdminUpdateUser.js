import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaUser, FaUserShield, FaSave, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import "./AdminUserManagement.css";

function AdminUpdateUser({ userId, onBack, onUpdate }) {
  const [user, setUser] = useState(null);
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    country: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    role: "user",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/users/${userId}`);
      const userData = response.data.user;
      setUser(userData);
      
      // Format date for input field
      const formattedDate = userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '';
      
      setInputs({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        country: userData.country || "",
        dob: formattedDate,
        gender: userData.gender || "",
        phone: userData.phone || "",
        email: userData.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        role: userData.role || "user",
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation (align with signup)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9+\-()\s]{7,20}$/; // basic phone pattern

    if (!inputs.firstName || !inputs.lastName || !inputs.email) {
      setError("Please fill in all required fields");
      return;
    }
    if (!nameRegex.test(inputs.firstName)) {
      setError("First name can only contain letters and spaces");
      return;
    }
    if (!nameRegex.test(inputs.lastName)) {
      setError("Last name can only contain letters and spaces");
      return;
    }
    if (!emailRegex.test(inputs.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (inputs.phone && !phoneRegex.test(inputs.phone)) {
      setError("Please enter a valid phone number");
      return;
    }
    if (inputs.newPassword) {
      const pwd = inputs.newPassword;
      const hasMinLen = pwd.length >= 8;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
      if (!(hasMinLen && hasUpper && hasLower && hasNumber && hasSymbol)) {
        setError("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol");
        return;
      }
    }
    if (inputs.newPassword && inputs.newPassword !== inputs.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        country: inputs.country,
        dob: inputs.dob,
        gender: inputs.gender,
        phone: inputs.phone,
        email: inputs.email,
        // Admin override: no current password required
        adminOverride: true,
        currentPassword: inputs.currentPassword || undefined,
        newPassword: inputs.newPassword || undefined,
        confirmPassword: inputs.confirmPassword || undefined,
        role: inputs.role,
      };
      const response = await axios.put(`http://localhost:5000/users/update/${userId}`, payload);
      
      alert("✅ User updated successfully!");
      try { window.dispatchEvent(new Event('usersUpdated')); } catch {}
      onUpdate(response.data.user);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-management-container">
        <div className="error-message">
          <p>❌ User not found</p>
          <button onClick={onBack} className="retry-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2>✏️ Edit User: {user.firstName} {user.lastName}</h2>
        <button className="btn-back" onClick={onBack}>
          <FaTimes /> Cancel
        </button>
      </div>

      <div className="update-user-container">
        <form onSubmit={handleSubmit} className="update-user-form">
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={inputs.firstName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={inputs.lastName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={inputs.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={inputs.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={inputs.country}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={inputs.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={inputs.dob}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">User Role *</label>
              <div className="role-selection">
                <div className="role-option">
                  <input
                    type="radio"
                    id="role-user"
                    name="role"
                    value="user"
                    checked={inputs.role === "user"}
                    onChange={handleChange}
                    className="role-radio"
                  />
                  <label htmlFor="role-user" className="role-label">
                    <FaUser className="role-icon" />
                    <span>Regular User</span>
                  </label>
                </div>
                <div className="role-option">
                  <input
                    type="radio"
                    id="role-admin"
                    name="role"
                    value="admin"
                    checked={inputs.role === "admin"}
                    onChange={handleChange}
                    className="role-radio"
                  />
                  <label htmlFor="role-admin" className="role-label">
                    <FaUserShield className="role-icon" />
                    <span>Administrator</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={inputs.newPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={inputs.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onBack}
              className="btn-cancel"
              disabled={saving}
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner-small"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUpdateUser;
