import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEdit, FaSignOutAlt, FaCamera, FaSave, FaTimes } from "react-icons/fa";
import "./Profile.css";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/signin");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Always fetch fresh data from server to ensure we have complete information
    fetchCompleteUserData(parsedUser.id);
  }, [navigate]);

  const fetchCompleteUserData = async (userId) => {
    try {
      console.log("Fetching user data for ID:", userId);
      const response = await axios.get(`http://localhost:5000/users/${userId}`);
      const completeUserData = response.data.user;
      
      console.log("Complete user data received:", completeUserData);
      
      // Update localStorage with complete user data
      localStorage.setItem("user", JSON.stringify(completeUserData));
      setUser(completeUserData);
      
      const formDataToSet = {
        firstName: completeUserData.firstName || "",
        lastName: completeUserData.lastName || "",
        country: completeUserData.country || "",
        dob: completeUserData.dob || "",
        gender: completeUserData.gender || "",
        phone: completeUserData.phone || "",
        email: completeUserData.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      
      console.log("Setting form data:", formDataToSet);
      setFormData(formDataToSet);
    } catch (error) {
      console.error("Error fetching complete user data:", error);
      // Fallback to existing data if fetch fails
      const fallbackData = {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        country: user?.country || "",
        dob: user?.dob || "",
        gender: user?.gender || "",
        phone: user?.phone || "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      console.log("Using fallback data:", fallbackData);
      setFormData(fallbackData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setProfilePicture(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validations (align with signup rules)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9+\-()\s]{7,20}$/; // basic phone pattern

    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("❌ Please fill in all required fields");
      setLoading(false);
      return;
    }
    if (!nameRegex.test(formData.firstName)) {
      alert("❌ First name can only contain letters and spaces");
      setLoading(false);
      return;
    }
    if (!nameRegex.test(formData.lastName)) {
      alert("❌ Last name can only contain letters and spaces");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(formData.email)) {
      alert("❌ Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      alert("❌ Please enter a valid phone number");
      setLoading(false);
      return;
    }
    // Password validations
    if (formData.newPassword) {
      const pwd = formData.newPassword;
      const hasMinLen = pwd.length >= 8;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
      if (!(hasMinLen && hasUpper && hasLower && hasNumber && hasSymbol)) {
        alert("❌ Password must be at least 8 characters and include uppercase, lowercase, number, and symbol");
        setLoading(false);
        return;
      }
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("❌ New passwords do not match!");
      setLoading(false);
      return;
    }
    if (formData.newPassword && !formData.currentPassword) {
      alert("❌ Current password is required to change password!");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      console.log("Form data being submitted:", formData);
      console.log("New password provided:", !!formData.newPassword);
      console.log("Current password provided:", !!formData.currentPassword);
      
      // Add form fields (exclude password fields if new password is not provided)
      Object.keys(formData).forEach(key => {
        if (key === 'currentPassword' || key === 'newPassword' || key === 'confirmPassword') {
          if (formData.newPassword && formData[key]) {
            console.log(`Adding ${key} to form data`);
            submitData.append(key, formData[key]);
          }
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add profile picture if selected
      if (profilePicture) {
        submitData.append('profilePicture', profilePicture);
      }
      
      console.log("FormData contents:");
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.put(`http://localhost:5000/users/update/${user.id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update localStorage with new user data
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setIsEditing(false);
      setProfilePicture(null);
      setProfilePicturePreview(null);
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err);
      console.error("Full error object:", err);
      
      let errorMessage = "Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`❌ Failed to update profile. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    // Clear user-specific cart
    const userCartKey = `cart_${user.id}`;
    localStorage.removeItem(userCartKey);
    navigate("/");
    window.location.reload(); // Refresh to update navigation
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      country: user.country || "",
      dob: user.dob || "",
      gender: user.gender || "",
      phone: user.phone || "",
      email: user.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <Nav />
      <div className="profile-page">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>

        <div className="profile-content">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile Preview" className="profile-picture" />
              ) : user.profilePicture ? (
                <img 
                  src={`http://localhost:5000${user.profilePicture}`} 
                  alt="Profile" 
                  className="profile-picture"
                />
              ) : (
                <div className="default-profile-picture">
                  <FaUser />
                </div>
              )}
              
              {isEditing && (
                <div className="profile-picture-overlay">
                  <label htmlFor="profile-picture-input" className="camera-btn">
                    <FaCamera />
                  </label>
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="profile-email">{user.email}</p>
              <p className="profile-member-since">
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form-section">
            <div className="form-header">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Country</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <>
                  <div className="password-section">
                    <h4>Change Password (Optional)</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="form-group">
                        {/* Empty div for layout */}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={loading}
                    >
                      <FaSave />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Account Actions */}
          
           
            <div className="action-buttons">
              <button 
                className="logout-btnP"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
