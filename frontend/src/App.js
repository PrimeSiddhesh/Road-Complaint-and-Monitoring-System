import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import MapView from './pages/MapView';
import Stats from './pages/Stats';
import About from './pages/About';
import Help from './pages/Help';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import ComplaintDetail from './pages/ComplaintDetail';

// Styles
import './styles/global.css';
import './styles/map.css';
import './styles/chat.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              {/* profile page shown immediately after login */}
              <Route path="/admin/profile" element={<ProtectedRoute adminOnly><AdminProfile /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <ChatWidget />
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
