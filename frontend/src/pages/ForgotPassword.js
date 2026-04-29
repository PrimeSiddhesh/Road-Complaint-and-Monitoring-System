import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.forgotPassword(email);
      setMessage({ type: 'success', text: 'OTP sent to your email. Please check your inbox.' });
      setStep(2);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(email, otp, newPassword);
      setMessage({ type: 'success', text: 'Password reset successfully! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>{step === 1 ? 'Enter your email to receive a reset OTP' : 'Enter the OTP and your new password'}</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
              <p className="help-text">We'll send an OTP to reset your password.</p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>OTP Code *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit OTP"
                required
                maxLength="6"
              />
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength="6"
              />
              <p className="help-text">Minimum 6 characters.</p>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength="6"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div style={{textAlign: 'center', marginTop: '1rem'}}>
              <button type="button" onClick={() => { setStep(1); setMessage({type:'', text:''}); }} className="btn btn-secondary" style={{fontSize: '0.9rem'}}>
                ← Back to Email
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p><a href="/login">Back to Login</a></p>
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
