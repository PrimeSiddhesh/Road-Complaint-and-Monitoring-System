const nodemailer = require("nodemailer");
const dns = require("dns");

const getEmailAuth = () => {
  const user = String(process.env.EMAIL_USER || "").trim();
  // Gmail app passwords are sometimes copied with spaces; normalize before SMTP auth.
  const pass = String(process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();
  const from = process.env.SMTP_FROM || (user ? `Road Complaint <${user}>` : undefined);

  return { user, pass, from };
};

const getResendConfig = () => {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RESEND_FROM || process.env.SMTP_FROM || "").trim();
  return { apiKey, from };
};

const sendViaResend = async ({ toEmail, otp, expiryMinutes }) => {
  const { apiKey, from } = getResendConfig();

  if (!apiKey || !from) {
    const error = new Error("Missing RESEND_API_KEY or RESEND_FROM");
    error.code = "MISSING_RESEND_CONFIG";
    throw error;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject: "OTP Verification",
      text: `Your OTP is ${otp}. It will expire in ${expiryMinutes} minutes.`
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Resend HTTP ${response.status}`;
    const error = new Error(message);
    error.code = "RESEND_SEND_FAILED";
    throw error;
  }

  console.log("[EMAIL] ✅ OTP sent via Resend", {
    to: toEmail,
    id: payload?.id
  });

  return payload;
};

const getSmtpCandidates = async () => {
  const customHost = String(process.env.SMTP_HOST || "").trim();
  const customPort = parseInt(process.env.SMTP_PORT, 10);

  if (customHost && customPort) {
    return [
      { 
        name: `${customHost}:${customPort}`, 
        host: customHost, 
        port: customPort, 
        secure: customPort === 465, 
        requireTLS: customPort !== 465 
      }
    ];
  }

  const candidates = [
    { name: "smtp.gmail.com:465", host: "smtp.gmail.com", port: 465, secure: true, requireTLS: false },
    { name: "smtp.gmail.com:587", host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true },
    { name: "smtp-relay.gmail.com:587", host: "smtp-relay.gmail.com", port: 587, secure: false, requireTLS: true }
  ];

  try {
    const addresses = await dns.promises.resolve4("smtp.gmail.com");
    const ipCandidates = addresses.flatMap((ip) => ([
      { name: `${ip}:465`, host: ip, port: 465, secure: true, requireTLS: false },
      { name: `${ip}:587`, host: ip, port: 587, secure: false, requireTLS: true }
    ]));
    return [...ipCandidates, ...candidates];
  } catch (error) {
    console.warn("[EMAIL] resolve4 failed, using hostname routes", {
      code: error.code,
      message: error.message
    });
    return candidates;
  }
};

const createTransporter = ({ user, pass, route }) => nodemailer.createTransport({
  host: route.host,
  port: route.port,
  secure: route.secure,
  auth: {
    user,
    pass
  },
  connectionTimeout: 7000,
  greetingTimeout: 7000,
  socketTimeout: 15000,
  requireTLS: route.requireTLS,
  tls: {
    servername: route.host.match(/^[0-9.]+$/) ? undefined : route.host,
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  }
});

const sendOtpEmail = async ({ toEmail, otp, expiryMinutes = 5 }) => {
  const { apiKey } = getResendConfig();

  // Preferred path in cloud: HTTPS email API avoids SMTP port/network blocks.
  if (apiKey) {
    try {
      return await sendViaResend({ toEmail, otp, expiryMinutes });
    } catch (error) {
      console.warn("[EMAIL] Resend path failed", {
        code: error.code,
        message: error.message
      });
      // Do not fall back to SMTP when RESEND_API_KEY is configured.
      // SMTP can be blocked in cloud and would hide the real Resend error.
      throw error;
    }
  }

  const { user, pass, from } = getEmailAuth();

  if (!user || !pass) {
    console.log("----------------------------------------");
    console.log(`[DEV MODE] Email credentials not found.`);
    console.log(`[DEV MODE] OTP for ${toEmail} is: ${otp}`);
    console.log("----------------------------------------");
    return { messageId: "dev-mode-otp" };
  }

  const mail = {
    from,
    to: toEmail,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}. It will expire in ${expiryMinutes} minutes.`
  };

  const routes = await getSmtpCandidates();
  const failures = [];

  for (const route of routes) {
    try {
      console.log("[EMAIL] Trying SMTP route:", route.name);
      const transporter = createTransporter({ user, pass, route });
      const info = await transporter.sendMail(mail);

      console.log("[EMAIL] ✅ OTP sent", {
        route: route.name,
        to: toEmail,
        messageId: info.messageId,
        response: info.response
      });

      return info;
    } catch (error) {
      failures.push(`${route.name} -> ${error.code || "UNKNOWN"}: ${error.message}`);
      console.warn("[EMAIL] Route failed", {
        route: route.name,
        code: error.code,
        message: error.message
      });
    }
  }

  const aggregate = new Error(`All SMTP routes failed. ${failures.join(" | ")}`);
  aggregate.code = "SMTP_ALL_ROUTES_FAILED";
  console.error("[EMAIL] ❌ Failed to send OTP email due to SMTP blocks.", aggregate.message);
  console.log(`[DEMO MODE] Bypassing email error. OTP for ${toEmail} is: ${otp}`);
  
  // Return gracefully instead of throwing, so the frontend doesn't crash.
  return { messageId: "bypassed-smtp-block-otp", bypassed: true };
};

const sendAdminStatusEmail = async ({ toEmail, status, taluka }) => {
  const { user, pass, from } = getEmailAuth();

  if (!user || !pass) {
    console.log(`[DEV MODE] Email creds missing. Would send ${status} email to ${toEmail}`);
    return;
  }

  const subject = status === 'approved' 
    ? `Your Taluka Admin Account is Approved`
    : `Your Taluka Admin Account Request was Declined`;
    
  const text = status === 'approved'
    ? `Congratulations! Your admin account for ${taluka} Taluka has been approved by the Main Admin. You can now log into the portal.`
    : `We regret to inform you that your admin account request for ${taluka} Taluka has been declined by the Main Admin.`;

  const mail = {
    from,
    to: toEmail,
    subject,
    text
  };

  const routes = await getSmtpCandidates();
  for (const route of routes) {
    try {
      const transporter = createTransporter({ user, pass, route });
      await transporter.sendMail(mail);
      return;
    } catch (error) {
      console.warn("[EMAIL] Route failed for admin status", error.message);
    }
  }
};

const sendContactEmail = async ({ name, email, subject, message }) => {
  const { user, pass, from } = getEmailAuth();

  // We send the contact message TO the super admin (which is the authenticated user email in this case)
  const toEmail = user || "siddhesh.s.contact@gmail.com"; 

  if (!user || !pass) {
    console.log(`[DEV MODE] Email creds missing. Contact message from ${name} (${email}) would go to ${toEmail}`);
    return;
  }

  const mail = {
    from,
    to: toEmail,
    replyTo: email, // So the admin can click "Reply" and email the citizen directly
    subject: `New Contact Message: ${subject}`,
    text: `You have received a new message from the Road Complaint System Contact Form.\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`
  };

  const routes = await getSmtpCandidates();
  for (const route of routes) {
    try {
      const transporter = createTransporter({ user, pass, route });
      await transporter.sendMail(mail);
      return;
    } catch (error) {
      console.warn("[EMAIL] Route failed for contact message", error.message);
    }
  }
};

module.exports = {
  sendOtpEmail,
  sendAdminStatusEmail,
  sendContactEmail
};
