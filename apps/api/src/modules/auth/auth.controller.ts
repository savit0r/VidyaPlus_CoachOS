import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const superAdminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8),
});

const otpSendSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
});

const otpVerifySchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export const authController = {
  /**
   * POST /api/v1/auth/login
   * Login with phone + password (Owner, Staff, Teacher, Accountant)
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.loginWithPassword(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/staff/login
   * Login for Staff/Teacher/Accountant with email + password
   */
  async staffLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.loginStaff(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/student/login
   * Login for Student with email + password
   */
  async studentLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.loginStudent(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/super-admin/login
   * Login for Super Admin with email + password
   */
  async superAdminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = superAdminLoginSchema.parse(req.body);
      const result = await authService.loginSuperAdmin(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/otp/send
   * Send OTP to student/parent phone
   */
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = otpSendSchema.parse(req.body);
      const result = await authService.sendOtp(phone);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/otp/verify
   * Verify OTP and return tokens
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = otpVerifySchema.parse(req.body);
      const result = await authService.verifyOtp(phone, otp);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const result = await authService.refreshAccessToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/logout
   * Logout and revoke refresh token
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { default: prisma } = await import('../../lib/prisma');
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          instituteId: true,
          photoUrl: true,
          permissionsJson: true,
          institute: { select: { id: true, name: true, subdomain: true, status: true, setupCompleted: true } },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
        return;
      }

      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  },
};
