import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.hostinger.com",
  port: Number(process.env.EMAIL_SERVER_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER || "",
    pass: process.env.EMAIL_SERVER_PASSWORD || "",
  },
});

export async function sendOtpEmail(to: string, otp: string, actionLink: string) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "winning@realitypicks.net";

  await transporter.sendMail({
    from: `RealityPicks <${from}>`,
    to,
    subject: "Your RealityPicks sign-in code",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0a0a0f; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 24px; margin: 0; color: #22d3ee;">RealityPicks</h1>
          <p style="color: #888; font-size: 14px; margin-top: 4px;">The 333 Community</p>
        </div>

        <div style="background: #111118; border: 1px solid #222; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
          <p style="color: #aaa; font-size: 14px; margin: 0 0 12px;">Your sign-in code</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #22d3ee; font-family: monospace; padding: 12px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 12px;">This code expires in 1 hour.</p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${actionLink}" style="display: inline-block; background: #22d3ee; color: #000; font-weight: bold; font-size: 14px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
            Or click to sign in
          </a>
        </div>

        <p style="color: #555; font-size: 11px; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Your RealityPicks sign-in code is: ${otp}\n\nOr sign in via this link: ${actionLink}\n\nThis code expires in 1 hour.`,
  });
}
