import React, { useState } from 'react';
import { contactService } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitted(false);

    try {
      await contactService.sendMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>Have questions? We'd love to hear from you</p>
      </div>

      <div className="contact-container">
        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          {submitted && <div className="alert alert-success">✅ Message sent successfully! We will get back to you soon.</div>}
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is your message about?"
                required
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Type your message here..."
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="contact-info-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <h3>📧 Email</h3>
            <p><a href="mailto:support@roadcomplaintsystem.gov.in">support@roadcomplaintsystem.gov.in</a></p>
          </div>

          <div className="contact-info">
            <h3>📞 Phone</h3>
            <p><a href="tel:+91-11-23059088">+91-11-23059088</a></p>
            <p><a href="tel:1800-11-6374">1800-11-6374 (Toll Free)</a></p>
          </div>

          <div className="contact-info">
            <h3>🏢 Address</h3>
            <p>Ministry of Road Transport & Highways<br/>
            Government of India<br/>
            New Delhi</p>
          </div>

          <div className="contact-info">
            <h3>⏰ Office Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM<br/>
            Saturday: 9:00 AM - 1:00 PM<br/>
            Sunday & Holidays: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
