import React from "react";
import "../Footer/Footer.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaGlobe } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-section">
          <h3>🌿 Sath Villa Naadi Ayurveda Resort</h3>
          <p>
            Experience holistic wellness, rejuvenating therapies, and natural
            healing in a serene environment.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/ayurveda">Ayurveda</Link></li>
            <li><Link to="/bookings">Bookings</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>📍 Moragalla, Sri Lanka</p>
          <p>📞 +94 25 642 7875</p>
          <p>✉ info@sathvilla.com</p>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#"><FaGlobe /></a>
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Serenity Ayurvedic Retreat | All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;
