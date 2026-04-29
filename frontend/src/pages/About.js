import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Us</h1>
        <p>Learn more about the Road Complaint & Monitoring System</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h1>Our Vision</h1>
          <p>Redefining community infrastructure through digital accountability and citizen action.</p>
        </section>

        <section className="about-section">
            <h3>Our Objective</h3>
            <p>We aim to modernize the grievance redressal process for road maintenance, providing a seamless digital bridge between residents and local authorities for faster and more transparent resolution.</p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon">📸</div>
              <h4>Visual Documentation</h4>
              <p>Easily upload photographs of road hazards, providing authorities with clear visual evidence for verification.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">🗺️</div>
              <h4>Precision Geolocation</h4>
              <p>Identify exact coordinates on an interactive map, ensuring maintenance teams can locate issues without confusion.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">📊</div>
              <h4>Real-time Status Tracking</h4>
              <p>Track your complaint from Pending → In Progress → Resolved with live status updates on your dashboard.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">🔐</div>
              <h4>Secured User Profiles</h4>
              <p>Our OTP-based registration ensures that only authenticated citizens can submit reports, maintaining system integrity.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">🏛️</div>
              <h4>Taluka-Level Admin System</h4>
              <p>Each Taluka has its own verified admin who can only view and manage complaints from their jurisdiction.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">📧</div>
              <h4>Automated Email Alerts</h4>
              <p>Admins receive automated email notifications when they are verified or when new complaints arrive.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>The Workflow</h2>
          <div className="about-steps">
            <div className="about-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Identity Setup</h4>
                <p>Register with your credentials and perform a quick email validation using a unique OTP code.</p>
              </div>
            </div>
            <div className="about-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Grievance Submission</h4>
                <p>Document the road defect with a photo, select your region, and mark the precise location on the live map.</p>
              </div>
            </div>
            <div className="about-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Official Validation</h4>
                <p>Localized Taluka Administrators review your submission and initiate the necessary field actions.</p>
              </div>
            </div>
            <div className="about-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Monitoring & Completion</h4>
                <p>Watch as your report moves toward completion. Receive notification once the road is successfully repaired.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Commitment</h2>
          <p>We are committed to building a reliable, secure, and efficient platform that genuinely addresses the road infrastructure needs of Indian citizens. Every complaint matters, and our system ensures that no grievance goes unnoticed. Together, we can build better roads and stronger communities.</p>
          <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
            <Link to="/register" className="btn btn-primary">Join Us — Register Now</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
