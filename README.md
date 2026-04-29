# 🛣️ Road Complaint & Monitoring System

A full-stack web application that empowers Indian citizens to report road infrastructure issues to their local Taluka authorities and track resolution in real-time.

## Features

- **OTP-Verified Registration** — Secure email verification for citizen accounts
- **Photo Evidence Upload** — Upload images of damaged roads as proof
- **Interactive Map Marking** — Pinpoint exact road location on Leaflet maps
- **State → District → Taluka** — Cascading dropdowns covering all of India
- **Real-time Status Tracking** — Pending → In Progress → Resolved
- **2-Tier Admin System** — Taluka Admins + Super Admin with role-based access
- **AI Chat Assistant** — Google Gemini-powered chatbot for user guidance
- **Automated Email Alerts** — Nodemailer notifications for admin verification
- **Forgot Password** — OTP-based password reset
- **Contact Form** — Messages emailed directly to the admin
- **Responsive Design** — Mobile-friendly with premium green theme

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, CSS3, Leaflet Maps |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + OTP Email Verification |
| AI | Google Gemini 2.0 Flash |
| Email | Nodemailer (Gmail SMTP) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Gmail App Password
- Google Gemini API Key (free at https://aistudio.google.com/apikey)

### Setup

1. Clone the repository
2. Copy `backend/.env.example` to `backend/.env` and fill in your credentials
3. Install & run:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

4. Open `http://localhost:3000`

---

## Deployment

### Architecture
```
[Vercel] ← Frontend (React)
    ↕ API calls
[Render] ← Backend (Express + MongoDB)
```

### Step 1: Deploy Backend on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add these **Environment Variables** in the Render dashboard:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any strong random string |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password |
| `SUPER_ADMIN_EMAIL` | Super admin email |
| `SUPER_ADMIN_PASSWORD` | Super admin password |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `FRONTEND_URL` | Your Vercel URL (e.g. `https://your-app.vercel.app`) |
| `NODE_ENV` | `production` |

6. Deploy → Note your Render URL (e.g. `https://road-complaint-api.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add this **Environment Variable**:

| Key | Value |
|-----|-------|
| `REACT_APP_API_BASE_URL` | `https://your-render-url.onrender.com/api` |

5. Deploy!

### Step 3: Update CORS

After both are deployed, go back to Render dashboard and set:
- `FRONTEND_URL` = `https://your-app.vercel.app`

---

## Default Super Admin

On first startup, the system auto-creates a Super Admin:
- **Username**: `main_admin`
- **Password**: Set via `SUPER_ADMIN_PASSWORD` env var

## Project Structure

```
├── backend/               ← Deployed on Render
│   ├── config/            # DB connection, email config
│   ├── middleware/         # JWT auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes (auth, admin, complaints, chat)
│   ├── uploads/           # Local image storage
│   ├── .env.example       # Environment template
│   └── server.js          # Express entry point
├── frontend/              ← Deployed on Vercel
│   ├── src/
│   │   ├── components/    # Navbar, Footer, ChatWidget
│   │   ├── pages/         # All page components
│   │   ├── services/      # API service layer
│   │   ├── styles/        # Global CSS + theme
│   │   └── utils/         # Location data, formatters
│   ├── vercel.json        # Vercel SPA routing config
│   └── .env.example       # Environment template
├── .gitignore
└── README.md
```
