import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

const verificationEmailHtml = (email: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;border:1px solid rgba(139,92,246,0.2);overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:32px 40px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">📚</div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">BookVault</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Your Personal Reading Companion</p>
      </td></tr>
      <tr><td style="padding:40px;">
        <h2 style="margin:0 0 12px;color:#f0f0ff;font-size:22px;font-weight:600;">Verify your email address</h2>
        <p style="margin:0 0 24px;color:#a0a0c0;font-size:15px;line-height:1.6;">
          Welcome to BookVault! Enter the 6-digit verification code below to activate your account.
          This code is valid for <strong style="color:#8b5cf6;">10 minutes</strong>.
        </p>
        <div style="background:rgba(139,92,246,0.08);border:2px solid rgba(139,92,246,0.35);border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
          <p style="margin:0 0 8px;color:#a0a0c0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Verification Code</p>
          <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#8b5cf6;font-family:'Courier New',monospace;">${otp}</div>
        </div>
        <p style="margin:0 0 24px;color:#a0a0c0;font-size:14px;line-height:1.6;">
          Didn't create a BookVault account? You can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 24px;"/>
        <p style="margin:0;color:#606080;font-size:12px;text-align:center;">
          Sent to <strong style="color:#8b5cf6;">${email}</strong> &nbsp;&bull;&nbsp; &copy; 2025 BookVault
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

const passwordResetEmailHtml = (email: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;border:1px solid rgba(239,68,68,0.2);overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:32px 40px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">🔐</div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">BookVault</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Password Reset Request</p>
      </td></tr>
      <tr><td style="padding:40px;">
        <h2 style="margin:0 0 12px;color:#f0f0ff;font-size:22px;font-weight:600;">Reset your password</h2>
        <p style="margin:0 0 24px;color:#a0a0c0;font-size:15px;line-height:1.6;">
          We received a request to reset your password. Enter the code below.
          Valid for <strong style="color:#ef4444;">15 minutes</strong>.
        </p>
        <div style="background:rgba(239,68,68,0.08);border:2px solid rgba(239,68,68,0.35);border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
          <p style="margin:0 0 8px;color:#a0a0c0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Reset Code</p>
          <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#ef4444;font-family:'Courier New',monospace;">${otp}</div>
        </div>
        <p style="margin:0 0 24px;color:#a0a0c0;font-size:14px;line-height:1.6;">
          Didn't request this? Ignore this email — your password stays unchanged.
        </p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 24px;"/>
        <p style="margin:0;color:#606080;font-size:12px;text-align:center;">
          Sent to <strong style="color:#ef4444;">${email}</strong> &nbsp;&bull;&nbsp; &copy; 2025 BookVault
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

export class EmailService {
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const transporter = createTransporter();
    try {
      await transporter.sendMail({
        from: `"BookVault" <${env.FROM_EMAIL}>`,
        to: email,
        subject: `${otp} is your BookVault verification code`,
        html: verificationEmailHtml(email, otp),
        text: `Your BookVault verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
      });
      logger.info(`✉️  Verification OTP sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}: ${error}`);
      logger.warn(`📋 [DEV FALLBACK] Verification OTP for ${email}: ${otp}`);
    }
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    const transporter = createTransporter();
    try {
      await transporter.sendMail({
        from: `"BookVault" <${env.FROM_EMAIL}>`,
        to: email,
        subject: `${otp} is your BookVault password reset code`,
        html: passwordResetEmailHtml(email, otp),
        text: `Your BookVault password reset code is: ${otp}\n\nThis code expires in 15 minutes.`,
      });
      logger.info(`✉️  Password reset OTP sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}: ${error}`);
      logger.warn(`📋 [DEV FALLBACK] Password reset OTP for ${email}: ${otp}`);
    }
  }
}
