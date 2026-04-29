# 🛣️ Road Complaint & Monitoring System

**Live Demo:** [https://road-complaint-and-monitoring-syste.vercel.app/](https://road-complaint-and-monitoring-syste.vercel.app/)

A comprehensive full-stack solution designed to bridge the gap between citizens and local government authorities for road infrastructure maintenance. This platform allows citizens to report road issues with photographic evidence and precise geolocation, while providing a structured administrative workflow for verification and resolution.

---

## 🚀 Project Overview

The **Road Complaint & Monitoring System** is a digital governance initiative that simplifies the process of reporting road-related grievances. It replaces slow, manual reporting with a real-time, transparent system where every complaint is tracked from submission to resolution.

### Key Working Flow:
1.  **Citizen Reporting**: Users register and verify their accounts via OTP. They submit complaints by uploading a photo, selecting their location (State → District → Taluka), and pinpointing the exact spot on an interactive map.
2.  **Administrative Verification**: Complaints are automatically routed to the respective **Taluka Admin**. 
3.  **Role-Based Management**: 
    *   **Taluka Admins** can only see and manage complaints within their assigned jurisdiction. They update the status (Pending → In Progress → Resolved).
    *   **Super Admin** (Main Admin) oversees the entire system, approves new Taluka Admin registrations, and manages global analytics.
4.  **AI Assistance**: A Gemini-powered AI chatbot is available 24/7 to guide users through the process and answer questions about the system.
5.  **Resolution Tracking**: Citizens can monitor the progress of their complaints via a personal dashboard and a public live map.

---

## 🛠️ Tech Stack & Rationale

| Technology | Purpose | Why We Used It |
| :--- | :--- | :--- |
| **React.js** | Frontend | Enables a dynamic, responsive, and fast user interface with a smooth Single Page Application (SPA) experience. |
| **Node.js & Express** | Backend | Provides a scalable and efficient environment for handling API requests and managing business logic. |
| **MongoDB Atlas** | Database | A flexible NoSQL database that easily handles complex complaint data and geographic coordinates. |
| **Google Gemini AI** | Smart Assistant | Integrated to provide intelligent, human-like responses to user queries, making the portal more accessible. |
| **Leaflet & OSRM** | Maps & Routing | Used for precise location picking and visualizing complaint density across regions. |
| **Nodemailer** | Email Service | Handles secure OTP delivery for registration and automated notifications for admin approvals. |
| **JWT** | Authentication | Ensures secure, token-based access control for users and administrators. |

---

## 🔐 Test Credentials

For evaluation purposes, use the following accounts:

### 👤 User Accounts
*   **Pune City User**: `dabangraja178@gmail.com` | Pass: `123`
*   **Satara City User**: `siddheshpawar129@gmail.com` | Pass: `123`

### 👮 Admin Accounts
*   **Super Admin (Main)**: `siddhesh.s.contact@gmail.com` | Pass: `123`
*   **Pune Taluka Admin**: `heysid560@gmail.com` | Pass: `123`
*   **Satara Taluka Admin**: `siddheshpawar785@gmail.com` | Pass: `123`

---

## ⚙️ Maintenance & Configuration (Personal Reference)

This section contains the accounts used for managing the external services integrated into this project:

*   **Google Gemini API Key**: Managed via `dabangraja178@gmail.com`
*   **MongoDB Atlas**: Hosted on `siddhesh.s.contact@gmail.com`
*   **Cloudinary Storage**: Hosted on `siddhesh.s.contact@gmail.com`
*   **Nodemailer (SMTP)**: Configured using `siddheshpawar1196@gmail.com`

---

## 📦 Local Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/PrimeSiddhesh/Road-Complaint-and-Monitoring-System.git
    ```
2.  **Setup Backend**:
    *   Navigate to `/backend`
    *   `npm install`
    *   Create `.env` based on `.env.example`
    *   `npm run dev`
3.  **Setup Frontend**:
    *   Navigate to `/frontend`
    *   `npm install`
    *   `npm start`

---

## 🏗️ Project Structure

```text
├── backend/               # Express API & Server Logic
│   ├── config/            # DB & Service configurations
│   ├── models/            # Mongoose schemas (User, Complaint, Admin)
│   ├── routes/            # API endpoints (Auth, Admin, Chat)
│   └── server.js          # Entry point
├── frontend/              # React Application
│   ├── src/components/    # Reusable UI elements (Chat, Map, Navbar)
│   ├── src/pages/         # Main views (Dashboard, Upload, Admin)
│   ├── src/services/      # API integration layer
│   └── vercel.json        # Deployment configuration
└── README.md
```

**Developed by Siddhesh Pawar** 🚀
