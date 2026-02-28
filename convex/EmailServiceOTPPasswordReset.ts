// convex/EmailServiceOTPPasswordReset.ts

function randomNumericCode(length = 6) {
  const digits = "0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += digits[Math.floor(Math.random() * digits.length)];
  return out;
}

async function callEmailService(payload: { email: string; code: string }) {
  const baseUrl = process.env.EMAIL_SERVICE_URL;
  const token = process.env.EMAIL_SERVICE_TOKEN;

  if (!baseUrl) {
    console.warn("EMAIL_SERVICE_URL not configured, skipping email");
    return;
  }
  if (!token) {
    console.warn("EMAIL_SERVICE_TOKEN not configured, skipping email");
    return;
  }

  const url = `${baseUrl.replace(/\/$/, "")}/.netlify/functions/send-reset`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Email service failed: ${res.status} ${txt}`);
  }
}

/**
 * ✅ Custom email provider for password reset
 */
export const EmailServiceOTPPasswordReset = {
  id: "email-service-reset",
  type: "email" as const,
  name: "Email Service Reset",
  
  async generateVerificationToken() {
    return randomNumericCode(6);
  },
  
  async sendVerificationRequest({ identifier: email, token }: any) {
    console.log(`Reset code for ${email}: ${token}`);
    await callEmailService({ email, code: token });
  },
};
