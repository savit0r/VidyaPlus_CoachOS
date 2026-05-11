import nodemailer from 'nodemailer';
import logger from './logger';

// Load SMTP config from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an OTP email to the specified address.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"CoachOS" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your CoachOS verification code',
    text: `Your verification code is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Welcome to CoachOS</h2>
        <p>Use the following code to complete your registration:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4f46e5; background: #f5f3ff; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`[MAIL] OTP sent to ${email}`);
  } catch (err) {
    logger.error('[MAIL] Failed to send OTP email', { error: err });
    throw Object.assign(new Error('Failed to send OTP email'), { statusCode: 500, code: 'MAIL_SEND_FAILURE' });
  }
}
