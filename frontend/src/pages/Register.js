import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import { validateForm } from '../utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (otpCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'email') {
      setOtp('');
      setOtpSent(false);
      setIsOtpVerified(false);
      setOtpMessage('');
      setOtpCooldown(0);
    }
  };

  const validateEmailBeforeOtp = () => {
    const email = String(formData.email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email before sending OTP' }));
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    setServerError('');
    setOtpMessage('');

    if (!validateEmailBeforeOtp()) {
      return;
    }

    setOtpLoading(true);
    try {
      const response = await authService.sendOtp(formData.email.trim());
      setOtpSent(true);
      setIsOtpVerified(false);
      setOtp('');
      setOtpCooldown(60);
      setOtpMessage(response.message || 'OTP sent to your email');
    } catch (error) {
      setServerError(error.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setServerError('');
    setOtpMessage('');

    if (!otp || otp.trim().length !== 6) {
      setServerError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await authService.verifyOtp(formData.email.trim(), otp.trim());
      if (response?.isVerified) {
        setIsOtpVerified(true);
        setOtpMessage('Email verified successfully. You can now complete registration.');
      }
    } catch (error) {
      setIsOtpVerified(false);
      setServerError(error.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const payload = {
      name: String(formData.name || '').trim(),
      mobile: String(formData.mobile || '').trim(),
      village: String(formData.village || '').trim(),
      email: String(formData.email || '').trim().toLowerCase(),
      password: String(formData.password || '')
    };

    const missingFields = Object.entries(payload)
      .filter(([key, value]) => key !== 'password' ? !value : !String(value).trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      setServerError(`Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      setServerError('Please enter a valid email address');
      return;
    }
    
    const rules = {
      name: { required: true, label: 'Full Name' },
      mobile: { required: true, type: 'phone', label: 'Mobile Number' },
      village: { required: true, label: 'Village / Area' },
      email: { required: true, type: 'email', label: 'Email' },
      password: { required: true, minLength: 6, label: 'Password' }
    };

    const { isValid, errors: validationErrors } = validateForm(payload, rules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    if (!isOtpVerified) {
      setServerError('Please verify your email OTP before registration');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(payload);
      if (response.token && response.user) {
        login(response.user, response.token);
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Your Account</h1>
          <p>Join the citizen complaint system today</p>
        </div>

        {serverError && <div className="alert alert-error">{serverError}</div>}
        {otpMessage && <div className="alert alert-success">{otpMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
              {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Village / Area *</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              placeholder="Your village or area name"
              required
            />
            {errors.village && <span className="error">{errors.village}</span>}
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSendOtp}
                disabled={otpLoading || !formData.email.trim() || (otpSent && otpCooldown > 0)}
              >
                {otpLoading ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Send OTP')}
              </button>
            </div>
            {errors.email && <span className="error">{errors.email}</span>}
            {otpSent && !isOtpVerified && (
              <p className="help-text" style={{ marginTop: '0.4rem' }}>
                {otpCooldown > 0 ? `You can resend OTP in ${otpCooldown}s` : 'You can resend OTP now'}
              </p>
            )}
          </div>

          {otpSent && (
            <div className="form-group">
              <label>Enter 6-digit OTP *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter OTP"
                maxLength={6}
                disabled={isOtpVerified}
              />
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || isOtpVerified || otp.length !== 6}
                >
                  {otpLoading ? 'Verifying...' : (isOtpVerified ? 'Verified' : 'Verify OTP')}
                </button>
                {isOtpVerified && (
                  <span style={{ color: '#2e7d32', fontWeight: 600 }}>Email verified</span>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" disabled={loading || !isOtpVerified} className="btn btn-primary">
            {loading ? 'Registering...' : 'Register'}
          </button>
          {!isOtpVerified && (
            <p className="help-text" style={{ marginTop: '0.5rem' }}>
              Verify your email OTP to enable registration.
            </p>
          )}
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
