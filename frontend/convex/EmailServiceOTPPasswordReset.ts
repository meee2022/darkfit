// convex/EmailServiceOTPPasswordReset.ts

function randomNumericCode(length = 6) {
  const digits = "0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += digits[Math.floor(Math.random() * digits.length)];
  return out;
}

async function sendViaNetlify(payload: { email: string; code: string }) {
  const token = process.env.EMAIL_SERVICE_TOKEN || "";

  const res = await fetch("https://email.mohamedapp.online/.netlify/functions/send-reset", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      email: payload.email,
      code: payload.code,
      appName: "DarkFit",
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Netlify function failed: ${res.status} ${txt}`);
  }
}

/**
 * ✅ Custom email provider for password reset using custom Netlify Endpoint
 */
export const EmailServiceOTPPasswordReset = {
  id: "email-service-reset",
  type: "email" as const,
  name: "Email Service Reset",

  async generateVerificationToken() {
    return randomNumericCode(6);
  },

  async sendVerificationRequest({ identifier: email, token }: any) {
    console.log(`📧 Sending reset code to ${email}`);
    await sendViaNetlify({ email, code: token });
    console.log(`✅ Reset code sent to ${email}`);
  },
};
