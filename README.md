# 🛣️ Road Complaint & Monitoring System

**Live Demo:** [https://road-complaint-and-monitoring-syste.vercel.app/](https://road-complaint-and-monitoring-syste.vercel.app/)

A comprehensive full-stack solution designed to bridge the gap between citizens and local government authorities for road infrastructure maintenance. This platform allows citizens to report road issues with photographic evidence and precise geolocation, while providing a structured administrative workflow for verification and resolution.

---

## 📋 Project Summary (Pointwise)

### 🔹 What is this Project?
*   **National Road Grievance Portal**: A unified platform for citizens to report road-related infrastructure issues.
*   **Two-Tier Governance Model**: A system that divides administrative power between **Taluka Admins** (local management) and a **Super Admin** (global oversight).
*   **Interactive Monitoring System**: A public-facing dashboard and live map where the status of every reported issue is visible to everyone, promoting transparency.
*   **Verified Citizen Platform**: A secure space where only verified users (via OTP) can submit grievances to prevent spam and fake reports.

### 🔹 How does it solve the problem?
*   **Eliminates Vague Locations**: By using **GPS-based Map Pinning**, it provides repair teams with exact coordinates instead of confusing verbal descriptions.
*   **Real-Time Status Updates**: It removes the "Black Box" of government processing. Citizens can see exactly when their complaint moves from *Pending* to *In Progress* to *Resolved*.
*   **Automated Routing**: Complaints are automatically filtered and sent to the correct Taluka official based on the user's location, reducing manual paperwork.
*   **Evidence-Based Reporting**: Mandatory photo uploads ensure that officials have visual proof of the severity before deploying resources.

### 🔹 Role of Technology
*   **Google Gemini AI**: Acts as an 24/7 intelligent guide, helping users understand how to use the portal and resolving common queries instantly.
*   **MERN Stack (MongoDB, Express, React, Node)**: Provides a robust, high-performance architecture capable of handling real-time data updates and thousands of concurrent users.
*   **Leaflet Maps & OSRM**: Bridges the gap between digital reports and physical locations by providing high-accuracy geographic visualization.
*   **JWT & Bcrypt**: Ensures industry-standard security for user data and administrative actions.
*   **Cloudinary & Multer**: Efficiently handles large image uploads and optimized storage of evidence photos.

---

## 🌟 Motivation & Problem Statement

### The "Why" Behind This Project
In many regions, the process of reporting a hazardous pothole is often opaque. Citizens don't know who to contact, and there's no way to track progress.

**I built this to solve:**
1.  **Transparency**: Public maps show that "Action is being taken."
2.  **Accuracy**: GPS coordinates ensure repair crews find the exact spot.
3.  **Efficiency**: Role-based access ensures local issues are handled by local officials.

---

## 🛠️ Tech Stack & Rationale

| Technology | Purpose | Why We Used It |
| :--- | :--- | :--- |
| **React.js** | Frontend | Smooth Single Page Application (SPA) experience. |
| **Node.js & Express** | Backend | Scalable API handling and business logic. |
| **MongoDB Atlas** | Database | Flexible NoSQL for complex geographic coordinates. |
| **Google Gemini AI** | Smart Assistant | Intelligent, human-like responses for 24/7 support. |
| **Leaflet & OSRM** | Maps & Routing | Precise location picking and data visualization. |
| **Nodemailer** | Email Service | Secure OTP delivery and admin notifications. |

---

## 🔐 Test Credentials
> [!NOTE]
> If the password **123** does not work for any account, please try **123456**.

### 👤 User Accounts
*   **Pune City User**: `dabangraja178@gmail.com` | Pass: `123`
*   **Satara City User**: `siddheshpawar129@gmail.com` | Pass: `123`

### 👮 Admin Accounts
*   **Super Admin (Main)**: `siddhesh.s.contact@gmail.com` | Pass: `123`
*   **Pune Taluka Admin**: `heysid560@gmail.com` | Pass: `123`
*   **Satara Taluka Admin**: `siddheshpawar785@gmail.com` | Pass: `123`

---

## 🏗️ Project Structure
```text
├── backend/               # Standalone API Server (Render)
├── frontend/              # Standalone React App (Vercel)
└── README.md
```

**Developed by Siddhesh Pawar** 🚀
