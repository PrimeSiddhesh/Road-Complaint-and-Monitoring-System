import React from 'react';
import { Link } from 'react-router-dom';
import roadBrokenImg from '../assets/icons/roadbroken.png';
import screenshot1 from '../assets/icons/Screenshot_2025-12-26_212822.png';
import screenshot2 from '../assets/icons/Screenshot_2025-12-26_212943.png';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-wrapper">
          <div className="hero-content">
            <h1>DIGITAL ROAD VIGILANCE</h1>
            <h2>Empowering Communities through Transparent Governance</h2>
            <p>A smart infrastructure monitoring portal designed for citizens to report road grievances directly to local authorities. Utilize precise geolocation and photographic evidence to ensure accountability and track the progress of road repairs in your neighborhood.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Register / Login</Link>
              <Link to="/map" className="btn btn-secondary">View Status</Link>
            </div>
          </div>
          <div className="hero-images-container">
            <img 
              src={roadBrokenImg} 
              alt="Road Issue Report" 
              style={{width: '100%', maxWidth: '500px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'}}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Comprehensive solutions for road infrastructure management</p>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3>Get Started</h3>
              <p>Securely register your account to begin documenting road infrastructure concerns and tracking resolution updates.</p>
              <Link to="/register" className="btn btn-primary" style={{marginTop: '1rem'}}>Get Started</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📍</div>
              <h3>Live Monitoring</h3>
              <p>Stay informed with real-time updates on your submitted reports through our interactive status-tracking map.</p>
              <Link to="/map" className="btn btn-primary" style={{marginTop: '1rem'}}>View Map</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📞</div>
              <h3>Contact Us</h3>
              <p>Have questions? Our support team is here to assist you with any inquiries.</p>
              <Link to="/contact" className="btn btn-primary" style={{marginTop: '1rem'}}>Get Help</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Why Use This Portal?</h2>
          <p className="section-subtitle">Empowering citizens through technology</p>
          <div className="info-items">
            <div className="info-item">
              <h4>Easy Reporting</h4>
              <p>Submit road complaints with photos and location details in just a few simple steps.</p>
            </div>
            <div className="info-item">
              <h4>Transparent Tracking</h4>
              <p>Monitor complaint status in real-time and receive updates directly.</p>
            </div>
            <div className="info-item">
              <h4>Community Impact</h4>
              <p>Your reports contribute directly to community infrastructure development.</p>
            </div>
            <div className="info-item">
              <h4>Efficient Processing</h4>
              <p>Automated systems ensure your grievance is processed promptly.</p>
            </div>
            <div className="info-item">
              <h4>Data-Driven Action</h4>
              <p>Comprehensive data collection enables better planning and resource allocation.</p>
            </div>
            <div className="info-item">
              <h4>Citizen Empowerment</h4>
              <p>Direct participation in governance ensures citizen voices are heard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">A simple 4-step process to get your issues resolved</p>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">1️⃣</div>
              <h3>Create Account</h3>
              <p>Register with your email and mobile number to create a secure account on the portal.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">2️⃣</div>
              <h3>Submit Complaint</h3>
              <p>Upload photos and provide location details with detailed description of the road issue.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">3️⃣</div>
              <h3>Track Progress</h3>
              <p>Monitor your complaint status and receive notifications about actions taken by authorities.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">4️⃣</div>
              <h3>Resolution</h3>
              <p>Get updates when your complaint is resolved and infrastructure improvements are completed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Screenshots Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Platform Features</h2>
          <p className="section-subtitle">Explore our user-friendly interface and powerful features</p>
          
          <div className="screenshots-grid">
            <div className="screenshot-card">
              <img src={screenshot1} alt="Dashboard View" className="screenshot-img" />
              <div className="screenshot-info">
                <h4>Dashboard</h4>
                <p>View all your reported complaints at a glance</p>
              </div>
            </div>
            <div className="screenshot-card">
              <img src={screenshot2} alt="Map View" className="screenshot-img" />
              <div className="screenshot-info">
                <h4>Location Tracking</h4>
                <p>See all road issues on an interactive map</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
