import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminUser = Boolean(user && ['admin', 'superadmin'].includes(user.role));

  // determine if current route is an admin page
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header-container">
        <div className="header-logo">
          <div className="emblem">🛣️</div>
          <div className="header-text">
            <h1>Road Complaint System</h1>
            <p>National Portal for Road Infrastructure Grievances</p>
          </div>
        </div>
        <div className="portal-badge">NATIONAL PORTAL</div>
      </header>

      <nav className="navbar">
        <div className="nav-brand">
          {/* Show Home only when NOT authenticated */}
          {!isAuthenticated && <Link to="/">Home</Link>}
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
          {!isAuthenticated ? (
            // NOT LOGGED IN
            <>
              <li><Link to="/register">Register / Login</Link></li>
              <li><Link to="/map">View Status</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/help">Help & Support</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/admin/login">Admin Login</Link></li>
            </>
          ) : user?.role === 'superadmin' ? (
            // SUPER ADMIN
            <>
              <li><Link to="/admin">Main Admin Panel</Link></li>
              <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
            </>
          ) : user?.role === 'admin' ? (
            // TALUKA ADMIN
            <>
              <li><Link to="/admin">Taluka Admin Panel</Link></li>
              <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
            </>
          ) : (
            // REGULAR USER
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/upload">Submit Complaint</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/map">View Map</Link></li>
              <li><Link to="/stats">Statistics</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
