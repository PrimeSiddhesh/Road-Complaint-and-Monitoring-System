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
          <h2>Our Mission</h2>
          <p>To empower citizens across India by providing a transparent, digital platform where they can report road infrastructure issues directly to the concerned Taluka authorities. We believe that better roads lead to safer communities, stronger economies, and an enhanced quality of life for every citizen.</p>
        </section>

        <section className="about-section">
          <h2>Our Vision</h2>
          <p>To become India's most trusted citizen-government bridge for road infrastructure grievances — connecting every village, taluka, and district through a single, unified digital portal that ensures accountability, speed, and transparency in road maintenance.</p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon">📸</div>
              <h4>Photo Evidence Upload</h4>
              <p>Citizens can upload photos of damaged roads as proof, making complaints verifiable and actionable.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">🗺️</div>
              <h4>Interactive Map Marking</h4>
              <p>Pinpoint the exact road location on an interactive map so authorities know precisely where the issue is.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">📊</div>
              <h4>Real-time Status Tracking</h4>
              <p>Track your complaint from Pending → In Progress → Resolved with live status updates on your dashboard.</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon">🔐</div>
              <h4>OTP-Verified Registration</h4>
              <p>Secure user registration with email OTP verification ensures only genuine citizens can submit complaints.</p>
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
          <h2>How It Works</h2>
          <div className="about-steps">
            <div className="about-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Register & Verify</h4>
                <p>Create your account with your name, mobile number, and email. Verify your email via OTP to activate your account.</p>
              </div>
            </div>
            <div className="about-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Submit a Complaint</h4>
                <p>Upload a photo of the road issue, select your State → District → Taluka, describe the problem, mark the location on the map, and submit.</p>
              </div>
            </div>
            <div className="about-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Admin Reviews</h4>
                <p>The verified Taluka Admin receives the complaint, reviews the photo and location, and takes action on the ground.</p>
              </div>
            </div>
            <div className="about-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Resolution & Tracking</h4>
                <p>Once the road is repaired, the admin marks the complaint as Resolved. Citizens can track every status change on their dashboard.</p>
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
