# 🛣️ Road Complaint & Monitoring System

**Live Demo:** [https://road-complaint-and-monitoring-syste.vercel.app/](https://road-complaint-and-monitoring-syste.vercel.app/)

A comprehensive full-stack solution designed to bridge the gap between citizens and local government authorities for road infrastructure maintenance. This platform allows citizens to report road issues with photographic evidence and precise geolocation, while providing a structured administrative workflow for verification and resolution.

---

## 🌟 Motivation & Problem Statement

### The "Why" Behind This Project
In many developing regions, especially in India, the process of reporting a broken road or a hazardous pothole is often opaque and frustrating. Citizens usually don't know which department to contact, and even when they do, there is no way to track if their complaint is being processed. 

**I built this project to solve three core problems:**
1.  **Lack of Transparency**: Citizens often feel their voices aren't heard. This system provides a public map and a personal dashboard to show that "Action is being taken."
2.  **Geographic Mismanagement**: Authorities often get vague descriptions like "road near the temple." By integrating **Leaflet Maps**, we provide exact GPS coordinates, ensuring the repair crew knows exactly where to go.
3.  **Administrative Bottlenecks**: By implementing a **2-Tier Admin System**, we ensure that local (Taluka) issues are handled by local officials, while the Super Admin can monitor efficiency across the entire state.

### Real-World Impact
This project transforms a passive citizen into an active participant in governance. It promotes accountability and ensures that infrastructure budget is spent on the most critical, highly-reported issues first.

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

## 🚀 Key Features & Working Flow

1.  **Citizen Reporting**: Users register and verify their accounts via OTP. They submit complaints by uploading a photo, selecting their location (State → District → Taluka), and pinpointing the exact spot on an interactive map.
2.  **Administrative Verification**: Complaints are automatically routed to the respective **Taluka Admin**. 
3.  **Role-Based Management**: 
    *   **Taluka Admins** can only see and manage complaints within their assigned jurisdiction.
    *   **Super Admin** (Main Admin) oversees the entire system and approves new officials.
4.  **AI Assistance**: A Gemini-powered AI chatbot guides users 24/7.
5.  **Resolution Tracking**: Citizens witness the transition from "Pending" to "Resolved" in real-time.

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

## ⚙️ Maintenance & Configuration (Personal Reference)
*   **Google Gemini API Key**: Managed via `dabangraja178@gmail.com`
*   **MongoDB Atlas**: Hosted on `siddhesh.s.contact@gmail.com`
*   **Cloudinary Storage**: Hosted on `siddhesh.s.contact@gmail.com`
*   **Nodemailer (SMTP)**: Configured using `siddheshpawar1196@gmail.com`

---

## 🏗️ Project Structure

```text
├── backend/               # Standalone API Server (Render)
│   ├── config/            # DB, Email & AI configurations
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints (Auth, Admin, Chat, Complaints)
│   └── server.js          # Entry point
├── frontend/              # Standalone React App (Vercel)
│   ├── src/components/    # Reusable UI (ChatWidget, LocationPicker)
│   ├── src/pages/         # Main views (Home, Dashboard, Stats)
│   ├── src/services/      # API communication layer
│   └── vercel.json        # SPA routing config
└── README.md
```

**Developed by Siddhesh Pawar** 🚀
