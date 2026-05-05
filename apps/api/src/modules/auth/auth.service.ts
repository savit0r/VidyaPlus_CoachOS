import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { DEFAULT_ROLE_PERMISSIONS, JwtPayload, Permission } from '@coachOS/shared';

const BCRYPT_ROUNDS = 12;

/**
 * Generate a 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate JWT access token (short-lived)
 */
function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
  });
}

/**
 * Generate JWT refresh token (long-lived)
 */
function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export const authService = {
  /**
   * Generate tokens for a user (used by login and impersonation)
   */
  async generateTokens(user: any) {
    const permissions = (user.permissionsJson as any[])?.length > 0
      ? (user.permissionsJson as any[])
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      role: user.role as any,
      permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },

  /**
   * Login with phone + password (for Owner, Staff, Teacher, Accountant)
   */
  async loginWithPassword(phone: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        phone,
        status: 'active',
        deletedAt: null,
        role: { notIn: ['student', 'parent'] },
      },
      include: { institute: true },
    });

    if (!user || !user.passwordHash) {
      throw Object.assign(new Error('Invalid phone number or password'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw Object.assign(new Error('Invalid phone number or password'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    // Check if institute is active (for non-super-admin)
    if (user.role !== 'super_admin' && user.institute && user.institute.status !== 'active') {
      throw Object.assign(new Error('Your institute account is suspended. Please contact support.'), {
        statusCode: 403,
        code: 'INSTITUTE_SUSPENDED',
      });
    }

    const permissions = (user.permissionsJson as Permission[]).length > 0
      ? (user.permissionsJson as Permission[])
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      role: user.role as any,
      permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();

    // Store refresh token in DB
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in: ${user.phone} (${user.role})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        instituteName: user.institute?.name || null,
        permissions,
      },
    };
  },

  /**
   * Login with email + password (for Super Admin)
   */
  async loginSuperAdmin(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { email, role: 'super_admin', status: 'active' },
    });

    if (!user || !user.passwordHash) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: null,
      role: 'super_admin',
      permissions: [],
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`Super Admin logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  /**
   * Send OTP to phone (for Student/Parent login)
   */
  async sendOtp(phone: string) {
    // Check for lockout
    const recentAttempts = await prisma.otpStore.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        attempts: { gte: 3 },
      },
    });

    if (recentAttempts > 0) {
      throw Object.assign(new Error('Too many OTP attempts. Try again after 30 minutes.'), {
        statusCode: 429,
        code: 'OTP_LOCKOUT',
      });
    }

    // Check user exists with this phone
    const user = await prisma.user.findFirst({
      where: {
        phone,
        role: { in: ['student', 'parent'] },
        status: 'active',
      },
    });

    if (!user) {
      throw Object.assign(new Error('No account found with this phone number'), {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');

    // Store OTP
    await prisma.otpStore.create({
      data: {
        phone,
        otp,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      },
    });

    // In development, log OTP to console
    logger.info(`[DEV] OTP for ${phone}: ${otp}`);

    // TODO: In production, send via SMS (Twilio)

    return { message: 'OTP sent successfully', expiresInMinutes: expiryMinutes };
  },

  /**
   * Verify OTP and return tokens
   */
  async verifyOtp(phone: string, otp: string) {
    const otpRecord = await prisma.otpStore.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw Object.assign(new Error('OTP expired or not found. Request a new one.'), {
        statusCode: 400,
        code: 'OTP_EXPIRED',
      });
    }

    if (otpRecord.attempts >= 3) {
      throw Object.assign(new Error('Too many failed attempts. Request a new OTP.'), {
        statusCode: 429,
        code: 'OTP_MAX_ATTEMPTS',
      });
    }

    if (otpRecord.otp !== otp) {
      // Increment attempts
      await prisma.otpStore.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw Object.assign(new Error('Invalid OTP'), { statusCode: 400, code: 'INVALID_OTP' });
    }

    // Mark as verified
    await prisma.otpStore.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Find user
    const user = await prisma.user.findFirst({
      where: { phone, role: { in: ['student', 'parent'] }, status: 'active' },
      include: { institute: true },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
    }

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      role: user.role as any,
      permissions: [],
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        instituteId: user.instituteId,
        instituteName: user.institute?.name || null,
      },
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    const tokenRecords = await prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
      include: { user: { include: { institute: true } } },
    });

    // Find matching token
    let matchedRecord = null;
    for (const record of tokenRecords) {
      const isMatch = await bcrypt.compare(refreshToken, record.tokenHash);
      if (isMatch) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
    }

    const user = matchedRecord.user;
    const permissions = (user.permissionsJson as Permission[]).length > 0
      ? (user.permissionsJson as Permission[])
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      role: user.role as any,
      permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);

    return { accessToken };
  },

  /**
   * Logout — revoke refresh token
   */
  async logout(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info(`User logged out: ${userId}`);
  },

  /**
   * Hash a password (used during user creation)
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },
};
