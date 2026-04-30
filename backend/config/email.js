/**
 * Email Service — uses Brevo HTTP API (no SMTP ports needed).
 *
 * Cloud platforms like Render block SMTP ports (465, 587, 2525).
 * This module sends emails via Brevo's REST API over standard HTTPS (port 443),
 * which is NEVER blocked by any cloud provider.
 *
 * Required env vars:
 *   BREVO_API_KEY   — Your Brevo v3 API key (starts with "xkeysib-...")
 *   SMTP_FROM       — Verified sender email (e.g. "siddheshpawar1196@gmail.com")
 */

// ─── Brevo HTTP API (Primary — works everywhere) ─────────────────────────────

const sendViaBrevo = async ({ to, subject, textContent, htmlContent }) => {
  const apiKey = String(process.env.BREVO_API_KEY || "").trim();
  const senderEmail = String(process.env.SMTP_FROM || process.env.EMAIL_USER || "").trim();

  if (!apiKey) {
    const err = new Error("BREVO_API_KEY is not set in environment variables");
    err.code = "MISSING_BREVO_KEY";
    throw err;
  }

  if (!senderEmail) {
    const err = new Error("SMTP_FROM (sender email) is not set in environment variables");
    err.code = "MISSING_SENDER";
    throw err;
  }

  const body = {
    sender: { name: "Road Complaint System", email: senderEmail },
    to: [{ email: to }],
    subject,
    textContent: textContent || undefined,
    htmlContent: htmlContent || undefined
  };

  console.log("[EMAIL] Sending via Brevo HTTP API to:", to);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[EMAIL] ❌ Brevo API error:", payload);
    const message = payload?.message || payload?.error || `Brevo HTTP ${response.status}`;
    const err = new Error(message);
    err.code = "BREVO_SEND_FAILED";
    throw err;
  }

  console.log("[EMAIL] ✅ Email sent via Brevo", { to, messageId: payload?.messageId });
  return payload;
};

// ─── Public Functions ─────────────────────────────────────────────────────────

const sendOtpEmail = async ({ toEmail, otp, expiryMinutes = 5 }) => {
  // If no Brevo key is configured, log the OTP for local development
  const apiKey = String(process.env.BREVO_API_KEY || "").trim();

  if (!apiKey) {
    console.log("════════════════════════════════════════");
    console.log(`[DEV MODE] BREVO_API_KEY not found.`);
    console.log(`[DEV MODE] OTP for ${toEmail} is: ${otp}`);
    console.log("════════════════════════════════════════");
    return { messageId: "dev-mode-otp" };
  }

  return await sendViaBrevo({
    to: toEmail,
    subject: "Your OTP Verification Code",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2d6a4f;">Road Complaint System</h2>
        <p>Your One-Time Password (OTP) for email verification is:</p>
        <div style="background: #f0f7f4; border: 2px solid #2d6a4f; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d6a4f;">${otp}</span>
        </div>
        <p style="color: #666;">This code will expire in <strong>${expiryMinutes} minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    textContent: `Your OTP is ${otp}. It will expire in ${expiryMinutes} minutes.`
  });
};

const sendAdminStatusEmail = async ({ toEmail, status, taluka }) => {
  const apiKey = String(process.env.BREVO_API_KEY || "").trim();

  if (!apiKey) {
    console.log(`[DEV MODE] Would send ${status} email to ${toEmail}`);
    return;
  }

  const subject = status === "approved"
    ? "Your Taluka Admin Account is Approved"
    : "Your Taluka Admin Account Request was Declined";

  const text = status === "approved"
    ? `Congratulations! Your admin account for ${taluka} Taluka has been approved by the Main Admin. You can now log into the portal.`
    : `We regret to inform you that your admin account request for ${taluka} Taluka has been declined by the Main Admin.`;

  try {
    await sendViaBrevo({ to: toEmail, subject, textContent: text });
  } catch (error) {
    console.warn("[EMAIL] Failed to send admin status email:", error.message);
  }
};

const sendContactEmail = async ({ name, email, subject, message }) => {
  const apiKey = String(process.env.BREVO_API_KEY || "").trim();
  const adminEmail = String(process.env.SMTP_FROM || process.env.EMAIL_USER || "siddhesh.s.contact@gmail.com").trim();

  if (!apiKey) {
    console.log(`[DEV MODE] Contact message from ${name} (${email}) would go to ${adminEmail}`);
    return;
  }

  try {
    await sendViaBrevo({
      to: adminEmail,
      subject: `New Contact Message: ${subject}`,
      textContent: `You have received a new message from the Road Complaint System Contact Form.\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`
    });
  } catch (error) {
    console.warn("[EMAIL] Failed to send contact email:", error.message);
  }
};

module.exports = {
  sendOtpEmail,
  sendAdminStatusEmail,
  sendContactEmail
};
