import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaMoneyBill,
  FaEnvelopeOpenText,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaLeaf,
  FaShoppingCart,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";
import AdminProducts from "./AdminProducts";
import AdminAddProduct from "./AdminAddProduct";
import AdminBookingManagement from "./AdminBookingManagement";
import AdminUpdateProduct from "./AdminUpdateProduct";
import AdminUserManagement from "./AdminUserManagement";
import AdminUpdateUser from "./AdminUpdateUser";
import AdminReviewManagement from "./AdminReviewManagement";
import AdminInquiryManagement from "./AdminInquiryManagement";
import AdminNotificationManagement from "./AdminNotificationManagement";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminUser, setAdminUser] = useState(null);
  const [productView, setProductView] = useState("list"); // "list", "add", or "edit"
  const [editingProductId, setEditingProductId] = useState(null);
  const [userView, setUserView] = useState("list"); // "list" or "edit"
  const [editingUserId, setEditingUserId] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/signin"); // redirect non-admins to regular signin
      return;
    }

    // Set admin user info
    setAdminUser(user);

    // fetch all users
    axios
      .get("http://localhost:5000/users")
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.log(err));

    // fetch all products
    fetchProducts();
    
    // Initialize recent activities
    initializeRecentActivities();
  }, [navigate]);

  // Real-time refresh for recent activities via events and periodic polling
  useEffect(() => {
    const refresh = () => initializeRecentActivities();
    const interval = setInterval(refresh, 30000); // refresh every 30s
    window.addEventListener('notificationsUpdated', refresh);
    window.addEventListener('inquiriesUpdated', refresh);
    window.addEventListener('productsUpdated', refresh);
    window.addEventListener('usersUpdated', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', refresh);
      window.removeEventListener('inquiriesUpdated', refresh);
      window.removeEventListener('productsUpdated', refresh);
      window.removeEventListener('usersUpdated', refresh);
    };
  }, []);

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/products");
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
    }
  };

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data.users);
    } catch (err) {
      console.log(err);
    }
  };

  // Initialize recent activities with real data
  const initializeRecentActivities = async () => {
    try {
      const [productsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/products"),
        axios.get("http://localhost:5000/users")
      ]);
      
      const allProducts = productsRes.data.products || [];
      const allUsers = usersRes.data.users || [];
      
      // Get recent products (last 3)
      const recentProducts = allProducts
        .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
        .slice(0, 3);
      
      // Get recent users (last 3)
      const recentUsers = allUsers
        .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
        .slice(0, 3);
      
      // Create activities array
      const activities = [];
      
      recentProducts.forEach((product, index) => {
        activities.push({
          id: `product-${product._id}`,
          type: 'product',
          title: 'New Product Added',
          description: product.p_name,
          time: new Date(product.createdAt || Date.now() - (index * 3600000)).toLocaleString(),
          icon: 'FaBoxOpen',
          color: '#4CAF50'
        });
      });
      
      recentUsers.forEach((user, index) => {
        activities.push({
          id: `user-${user._id}`,
          type: 'user',
          title: 'New User Registered',
          description: `${user.firstName} ${user.lastName}`,
          time: new Date(user.createdAt || Date.now() - (index * 7200000)).toLocaleString(),
          icon: 'FaUsers',
          color: '#2196F3'
        });
      });
      
      // Sort by time and take latest 5
      setRecentActivities(activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5));
    } catch (err) {
      console.log(err);
      // Fallback to static activities if API fails
      setRecentActivities([
        {
          id: '1',
          type: 'product',
          title: 'New Product Added',
          description: 'Turmeric Golden Milk',
          time: new Date(Date.now() - 2 * 3600000).toLocaleString(),
          icon: 'FaBoxOpen',
          color: '#4CAF50'
        },
        {
          id: '2',
          type: 'user',
          title: 'New User Registered',
          description: 'Sarah Johnson',
          time: new Date(Date.now() - 4 * 3600000).toLocaleString(),
          icon: 'FaUsers',
          color: '#2196F3'
        },
        {
          id: '3',
          type: 'order',
          title: 'Order Completed',
          description: 'Ayurvedic Oil Set',
          time: new Date(Date.now() - 6 * 3600000).toLocaleString(),
          icon: 'FaShoppingCart',
          color: '#FF9800'
        }
      ]);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleGoToWebsite = () => {
    // Open the main website in a new tab
    window.open("/", "_blank");
  };

  const handleProductManagement = () => {
    setActiveTab("products");
    setProductView("list");
  };

  const handleAddProduct = () => {
    setActiveTab("products");
    setProductView("add");
  };

  const handleBackToProducts = () => {
    setProductView("list");
    setEditingProductId(null);
    // Refresh products data when going back
    fetchProducts();
  };

  // Handle product added successfully
  const handleProductAdded = () => {
    fetchProducts(); // Refresh products list
    initializeRecentActivities(); // Refresh activities
    setProductView("list"); // Go back to products list
  };

  // Handle product updated successfully
  const handleProductUpdated = () => {
    fetchProducts(); // Refresh products list
    initializeRecentActivities(); // Refresh activities
    setProductView("list"); // Go back to products list
    setEditingProductId(null);
  };

  const handleEditProduct = (productId) => {
    setEditingProductId(productId);
    setProductView("edit");
  };

  const handleUserManagement = () => {
    setActiveTab("users");
    setUserView("list");
  };

  const handleBackToUsers = () => {
    setUserView("list");
    setEditingUserId(null);
  };


  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
    setUserView("list");
    setEditingUserId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-overview">
            <div className="dashboard-header">
              <div className="header-content">
                <div>
                  <h2>🌿 Ayurvedic Wellness Dashboard</h2>
                  <p>Welcome back, {adminUser?.firstName || 'Admin'}! Here's your wellness center overview.</p>
                </div>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#4CAF50' }}>
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>{users.length}</h3>
                  <p>Total Users</p>
                  <span className="stat-change positive">+12% this month</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#FF9800' }}>
                  <FaBoxOpen />
                </div>
                <div className="stat-content">
                  <h3>{products.length}</h3>
                  <p>Products</p>
                  <span className="stat-change positive">+5 new this week</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#2196F3' }}>
                  <FaShoppingCart />
                </div>
                <div className="stat-content">
                  <h3>24</h3>
                  <p>Orders Today</p>
                  <span className="stat-change positive">+8% from yesterday</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#9C27B0' }}>
                  <FaCalendarAlt />
                </div>
                <div className="stat-content">
                  <h3>12</h3>
                  <p>Bookings</p>
                  <span className="stat-change positive">+3 pending</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>🚀 Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={handleAddProduct}
                  style={{ backgroundColor: '#4CAF50' }}
                >
                  <FaBoxOpen /> Add Product
                </button>
                <button 
                  className="action-btn"
                  onClick={handleUserManagement}
                  style={{ backgroundColor: '#2196F3' }}
                >
                  <FaUsers /> Manage Users
                </button>
                <button 
                  className="action-btn"
                  onClick={handleGoToWebsite}
                  style={{ backgroundColor: '#FF9800' }}
                >
                  <FaExternalLinkAlt /> Visit Website
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/admin/payment-management")}
                  style={{ backgroundColor: '#FF5722' }}
                >
                  <FaMoneyBill /> Payment Management
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab("bookings")}
                  style={{ backgroundColor: '#9C27B0' }}
                >
                  <FaCalendarAlt /> Manage Bookings
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab("reviews")}
                  style={{ backgroundColor: '#FF9800' }}
                >
                  <FaStar /> Manage Reviews
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab("inquiries")}
                  style={{ backgroundColor: '#E91E63' }}
                >
                  <FaEnvelopeOpenText /> Manage Inquiries
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>📈 Recent Activity</h3>
              <div className="activity-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const IconComponent = activity.icon === 'FaBoxOpen' ? FaBoxOpen : 
                                        activity.icon === 'FaUsers' ? FaUsers : 
                                        activity.icon === 'FaShoppingCart' ? FaShoppingCart : FaBoxOpen;
                    
                    return (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon" style={{ backgroundColor: activity.color }}>
                          <IconComponent />
                        </div>
                        <div className="activity-content">
                          <p><strong>{activity.title}:</strong> {activity.description}</p>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="activity-item">
                    <div className="activity-icon" style={{ backgroundColor: '#9E9E9E' }}>
                      <FaBoxOpen />
                    </div>
                    <div className="activity-content">
                      <p><strong>No recent activity</strong></p>
                      <span>Start by adding products or users</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "users":
        if (userView === "edit") {
          return <AdminUpdateUser userId={editingUserId} onBack={handleBackToUsers} onUpdate={handleUpdateUser} />;
        } else {
          return <AdminUserManagement onBack={() => setActiveTab("dashboard")} />;
        }
      case "products":
        if (productView === "add") {
          return <AdminAddProduct onBack={handleProductAdded} />;
        } else if (productView === "edit") {
          return <AdminUpdateProduct productId={editingProductId} onBack={handleProductUpdated} />;
        } else {
          return <AdminProducts onAddProduct={handleAddProduct} onEditProduct={handleEditProduct} />;
        }
      case "bookings":
        return <AdminBookingManagement />;
      case "reviews":
        return <AdminReviewManagement />;
      case "inquiries":
        return <AdminInquiryManagement />;
      case "notifications":
        return <AdminNotificationManagement />;
      default:
        return <h2>Welcome Admin</h2>;
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <FaLeaf />
            </div>
            <div className="logo-text">
              <h2>Sath Villa</h2>
              <span>Ayurvedic Admin</span>
            </div>
          </div>
        </div>
        <ul className="sidebar-menu">
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaTachometerAlt /> Dashboard
          </li>
          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={handleUserManagement}
          >
            <FaUsers /> User Management
          </li>
          <li
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => setActiveTab("bookings")}
          >
            <FaCalendarAlt /> Booking Management
          </li>
          <li
            className={activeTab === "products" ? "active" : ""}
            onClick={handleProductManagement}
          >
            <FaBoxOpen /> Product Management
          </li>
          <li
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            <FaStar /> Review Management
          </li>
          <li
            className={activeTab === "payments" ? "active" : ""}
            onClick={() => navigate("/admin/payment-management")}
          >
            <FaMoneyBill /> Payment Management
          </li>
          <li
            className={activeTab === "inquiries" ? "active" : ""}
            onClick={() => setActiveTab("inquiries")}
          >
            <FaEnvelopeOpenText /> Inquiry Management
          </li>
          <li
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => setActiveTab("notifications")}
          >
            <FaEnvelopeOpenText /> Notification Management
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="admin-header">
          <div className="header-left">
            <h1>🌿 Sath Villa Ayurvedic</h1>
            <span className="header-subtitle">Wellness Management System</span>
          </div>
          <div className="header-right">
            <button
              onClick={handleGoToWebsite}
              className="website-btn"
            >
              <FaExternalLinkAlt /> Visit Website
            </button>
            <div className="admin-profile">
              {adminUser?.profilePicture ? (
                <img
                  src={`http://localhost:5000${adminUser.profilePicture}`}
                  alt="Admin"
                  className="profile-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                />
              ) : (
                <div className="admin-avatar">
                  {adminUser?.firstName ? adminUser.firstName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="profile-info">
                <span className="profile-name">{adminUser?.firstName || 'Admin'} {adminUser?.lastName || ''}</span>
                <span className="profile-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-body">{renderContent()}</section>
      </main>
    </div>
  );
}

export default AdminDashboard;
