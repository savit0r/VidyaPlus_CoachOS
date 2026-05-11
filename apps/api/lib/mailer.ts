import nodemailer from 'nodemailer';
import logger from './logger';

// Load SMTP config from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an OTP email to the specified address.
 * @param email Recipient email address
 * @param otp   6‑digit OTP code (string)
 */
export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"CoachOS" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your CoachOS verification code',
    text: `Your verification code is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes.`,
    html: `<p>Your verification code is <b>${otp}</b>. It expires in <b>${process.env.OTP_EXPIRY_MINUTES || '10'} minutes</b>.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`[MAIL] OTP sent to ${email}`);
  } catch (err) {
    logger.error('[MAIL] Failed to send OTP email', { error: err });
    throw Object.assign(new Error('Failed to send OTP email'), { statusCode: 500, code: 'MAIL_SEND_FAILURE' });
  }
}
