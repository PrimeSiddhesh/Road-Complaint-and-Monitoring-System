const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// System prompt that gives the AI full context about this specific project
const SYSTEM_PROMPT = `You are an AI assistant for the "Road Complaint & Monitoring System" — an Indian government-style web portal where citizens report road infrastructure problems.

Here is everything you know about this system:

WHAT THIS SYSTEM DOES:
- Citizens register with their name, mobile, village, and email (verified via OTP).
- After login, they can submit road complaints with: a photo of the issue, location (State → District → Taluka), description, severity level, and exact GPS coordinates marked on an interactive map.
- Each complaint gets a status: Pending → In Progress → Resolved.
- Citizens track all their complaints on their Dashboard.

ADMIN SYSTEM (2-tier):
- Taluka Admin: Each Taluka has one admin who can ONLY see complaints from their Taluka. They can Resolve or Delete complaints.
- Super Admin (Main Admin): Approves or declines Taluka Admin registrations. Can see ALL complaints across India.
- When a Taluka Admin is approved/declined, they receive an automated email notification.

KEY FEATURES:
- OTP-verified email registration
- Photo evidence upload
- Interactive map for marking exact road location
- State → District → Taluka cascading dropdowns
- Real-time status tracking
- Forgot password via OTP
- Contact Us form (messages sent to admin's email)
- CSV export of complaints for admins

NAVIGATION:
- Home page: /
- Register/Login: /register or /login
- Submit Complaint: /upload (requires login)
- Dashboard: /dashboard (requires login)
- View Map: /map
- Statistics: /stats
- Profile: /profile
- Admin Login: /admin/login
- Admin Register: /admin/register
- About Us: /about
- Help & Support: /help
- Contact Us: /contact

RULES FOR YOUR RESPONSES:
1. Keep answers short, helpful, and friendly (2-4 sentences max).
2. Always answer in the context of THIS specific road complaint system.
3. If someone asks something unrelated to this system, politely redirect them.
4. Use emojis sparingly to be friendly.
5. If they ask how to do something, give step-by-step instructions.`;

// Initialize Gemini (lazy — only when first message arrives)
let chatModel = null;

const getModel = () => {
  if (chatModel) return chatModel;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  return chatModel;
};

// Fallback keyword-based responses if Gemini is unavailable
const getFallbackReply = (text) => {
  const lower = text.toLowerCase();

  if (lower.includes("register") || lower.includes("sign up")) {
    return "To register, click 'Register / Login' in the navbar. Fill in your name, mobile, village, email, and password. You'll receive an OTP on your email — verify it and you're done! ✅";
  }
  if (lower.includes("complaint") || lower.includes("report") || lower.includes("upload")) {
    return "To submit a complaint: Login → click 'Submit Complaint' → upload a photo → select State/District/Taluka → mark the location on the map → describe the issue → choose severity → Submit! 📋";
  }
  if (lower.includes("status") || lower.includes("track")) {
    return "Check your complaint status on your Dashboard. Each complaint shows its current status: Pending (yellow), In Progress (blue), or Resolved (green). 📊";
  }
  if (lower.includes("admin")) {
    return "There are two admin types: Taluka Admin (manages one Taluka's complaints) and Super Admin (approves Taluka Admins). Admin login is at /admin/login. 🏛️";
  }
  if (lower.includes("password") || lower.includes("forgot")) {
    return "Click 'Forgot Password' on the login page. Enter your email, receive an OTP, then set your new password. 🔐";
  }
  if (lower.includes("contact") || lower.includes("support")) {
    return "Go to the 'Contact Us' page from the navbar. Fill in the form and your message will be emailed directly to the admin team. 📧";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! 👋 Welcome to the Road Complaint System assistant. I can help you with registration, submitting complaints, tracking status, and more. What do you need help with?";
  }

  return "I can help you with registration, submitting complaints, tracking status, admin workflows, and more. Try asking something like 'How do I register?' or 'How to submit a complaint?' 😊";
};

// Chat endpoint
router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = getModel();

    // If Gemini is available, use real AI
    if (model) {
      try {
        const result = await model.generateContent([
          { text: SYSTEM_PROMPT },
          { text: `User question: ${message}` }
        ]);
        const reply = result.response.text();
        return res.json({ success: true, reply });
      } catch (aiError) {
        console.error("[CHAT] Gemini API error:", aiError.message);
        // Fall through to keyword fallback
      }
    }

    // Fallback: keyword-based responses
    const reply = getFallbackReply(message);
    res.json({ success: true, reply });
  } catch (err) {
    console.error("[CHAT] Error:", err);
    res.status(400).json({ error: "Failed to process message" });
  }
});

// Health check
router.get("/ping", (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  res.json({ message: "Chat service is alive", aiEnabled: hasGemini });
});

module.exports = router;
