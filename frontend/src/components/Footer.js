import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>About Portal</h4>
          <a href="/about">About Us</a>
          <a href="/">Portal Features</a>
          <a href="/">How It Works</a>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
          <a href="/map">View Map</a>
          <a href="/dashboard">Dashboard</a>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <a href="/help">Help & FAQ</a>
          <a href="/contact">Contact Us</a>
          <a href="/">Report Issue</a>
        </div>
        <div className="footer-section">
          <h4>Government</h4>
          <a href="/">Official Website</a>
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
          <a href="/">Feedback</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} National Road Complaint System | Ministry of Road Transport & Highways</p>
        <p>Designed & Developed by <strong>Siddhesh</strong></p>
      </div>
    </footer>
  );
};

export default Footer;
