import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaUser, FaSignOutAlt, FaBars, FaTimes, FaCalendarAlt, FaShoppingCart, FaBell } from "react-icons/fa";
import "./Nav.css";
import logo from "../Nav/Sath.png"; // update path if needed

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for logged-in user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load cart items and listen for changes
  useEffect(() => {
    const loadCartItems = () => {
      if (user) {
        // Load user-specific cart
        const userCartKey = `cart_${user.id}`;
        const cart = JSON.parse(localStorage.getItem(userCartKey)) || [];
        setCartItems(cart);
      } else {
        // Clear cart when user logs out
        setCartItems([]);
      }
    };

    // Load cart on mount and when user changes
    loadCartItems();

    // Listen for storage changes (when cart is updated from other tabs/components)
    const handleStorageChange = (e) => {
      if (user && e.key === `cart_${user.id}`) {
        loadCartItems();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom cart update events
    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [user]);

  // Load notifications for user and compute unread count
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (!user || !(user._id || user.id)) {
          setNotificationCount(0);
          setNotifications([]);
          return;
        }
        const uid = user._id || user.id;
        const res = await fetch(`${API_BASE}/notifications/user/${uid}`);
        if (!res.ok) {
          setNotificationCount(0);
          setNotifications([]);
          return;
        }
        const data = await res.json();
        const list = data.notifications || [];
        setNotifications(list);
        const unread = list.filter(n => !n.read).length;
        setNotificationCount(unread);
      } catch (e) {
        setNotificationCount(0);
        setNotifications([]);
      }
    };

    loadNotifications();

    const handleInquiriesUpdated = () => loadNotifications();
    const handleNotificationsUpdated = () => loadNotifications();
    window.addEventListener('inquiriesUpdated', handleInquiriesUpdated);
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);

    // periodic refresh
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      window.removeEventListener('inquiriesUpdated', handleInquiriesUpdated);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
      clearInterval(interval);
    };
  }, [user]);

  const handleToggleNotif = () => {
    setShowNotif(prev => !prev);
  };

  const handleMarkRead = async (id) => {
    try {
      const uid = user && (user._id || user.id);
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid }) });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setNotificationCount(prev => Math.max(prev - 1, 0));
      }
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  // Calculate total cart items
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <div className="logo-wrapper">
            <img src={logo} alt="Sath Villa Logo" className="logo-img" />
            
          </div>
          <div className="brand-text">
            <h3>Sath Villa</h3>
            <span>Ayurvedic Wellness Resort</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li>
            <Link to="/home" onClick={() => setIsOpen(false)} className="nav-link">
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/ayurveda" onClick={() => setIsOpen(false)} className="nav-link">
              <span>Ayurveda</span>
            </Link>
          </li>
          <li>
            <Link to="/products" onClick={() => setIsOpen(false)} className="nav-link">
              <span>Products</span>
            </Link>
          </li>
          <li>
            <Link to="/inquire" onClick={() => setIsOpen(false)} className="nav-link">
              <span>Inquire</span>
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setIsOpen(false)} className="nav-link">
              <span>About Us</span>
            </Link>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          <Link to="/add_booking" className="btn btn-primary btn-book">
            
            Book Your Stay
          </Link>
          
          {user ? (
            <div className="user-profile">
              {/* User Action Icons */}
              <div className="user-actions">
                {/* Notifications */}
                <button type="button" onClick={handleToggleNotif} className="nav-icon-btn notif-btn" title="Notifications">
                  <FaBell />
                  {notificationCount > 0 && (
                    <span className="notif-badge">{notificationCount > 9 ? '9+' : notificationCount}</span>
                  )}
                </button>
                {showNotif && (
                  <div className="notif-dropdown">
                    <div className="notif-header">Notifications</div>
                    <div className="notif-list">
                      {notifications.length === 0 && (
                        <div className="notif-empty">No notifications</div>
                      )}
                      {notifications.map(n => (
                        <div key={n._id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-meta">
                            <span>{new Date(n.createdAt).toLocaleString()}</span>
                            {!n.read && (
                              <button className="notif-mark" onClick={() => handleMarkRead(n._id)}>Mark as read</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="notif-footer">
                      <Link to="/notifications" onClick={() => setShowNotif(false)}>View all</Link>
                    </div>
                  </div>
                )}
                {/* Cart Button - Only visible when logged in */}
                <Link to="/cart" className="nav-icon-btn cart-btn" title="Shopping Cart">
                  <FaShoppingCart />
                  {totalCartItems > 0 && (
                    <span className="cart-badge">{totalCartItems}</span>
                  )}
                </Link>
                
                {/* My Bookings Button - Only visible when logged in */}
                <Link to="/bookings" className="nav-icon-btn" title="My Bookings">
                  <FaCalendarAlt />
                </Link>
              </div>
              
              <Link to="/profile" className="profile-avatar">
                {user.profilePicture ? (
                  <img 
                    src={`http://localhost:5000${user.profilePicture}`} 
                    alt="Profile" 
                    className="profile-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="default-avatar" style={{ display: user.profilePicture ? 'none' : 'flex' }}>
                  <FaUser />
                </div>
              </Link>
              <div className="user-info">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/signin" className="btn btn-outline btn-login">
              <FaUser />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
