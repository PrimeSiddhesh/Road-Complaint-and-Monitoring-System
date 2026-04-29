import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      
      <nav className="sidebar-nav">
        <Link 
          to="/admin" 
          className={`sidebar-item ${isActive('/admin') ? 'active' : ''}`}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/admin/complaints" 
          className={`sidebar-item ${isActive('/admin/complaints') ? 'active' : ''}`}
        >
          📋 Complaints
        </Link>
        <Link 
          to="/admin/users" 
          className={`sidebar-item ${isActive('/admin/users') ? 'active' : ''}`}
        >
          👥 Users
        </Link>
        <Link 
          to="/admin/reports" 
          className={`sidebar-item ${isActive('/admin/reports') ? 'active' : ''}`}
        >
          📈 Reports
        </Link>
        <Link 
          to="/admin/settings" 
          className={`sidebar-item ${isActive('/admin/settings') ? 'active' : ''}`}
        >
          ⚙️ Settings
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
