import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// ============================================
// Validation Schemas
// ============================================
const createStaffSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().nullable(),
  role: z.enum(['teacher', 'accountant', 'admin', 'custom']),
  baseSalary: z.number().nonnegative().optional().default(0),
  permissions: z.array(z.string()).optional(),
  password: z.string().min(6).optional().default('Staff@123'),
});

const updateStaffSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional().nullable(),
  role: z.enum(['teacher', 'accountant', 'admin', 'custom']).optional(),
  baseSalary: z.number().nonnegative().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ============================================
// Default Permissions
// ============================================
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  teacher: [
    'attendance.mark',
    'attendance.view',
    'batches.view',
  ],
  accountant: [
    'fees.view',
    'fees.collect',
    'fees.edit',
  ],
  admin: [
    'students.view', 'students.add', 'students.edit', 'students.delete',
    'batches.view', 'batches.edit', 'batches.delete',
    'attendance.mark', 'attendance.view', 'attendance.edit',
    'fees.view', 'fees.collect', 'fees.edit', 'fees.delete',
    'settings.manage'
  ]
};

// ============================================
// Controllers
// ============================================
export const staffController = {
  // ---------- List Staff ----------
  async listStaff(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      
      const staff = await prisma.user.findMany({
        where: {
          instituteId,
          role: { notIn: ['owner', 'student'] },
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: staff.map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          email: s.email,
          role: s.role,
          baseSalary: Number(s.baseSalary),
          permissions: s.permissionsJson,
          status: s.status,
          createdAt: s.createdAt,
        })),
      });
    } catch (error: any) {
      logger.error('Failed to list staff', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list staff' });
    }
  },

  // ---------- Create Staff ----------
  async createStaff(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = createStaffSchema.parse(req.body);

      // Check if phone or email already exists for this institute + role
      const existing = await prisma.user.findFirst({
        where: {
          instituteId,
          phone: body.phone,
          role: body.role,
          deletedAt: null,
        }
      });

      if (existing) {
        res.status(409).json({ success: false, error: 'A staff member with this phone number and role already exists.' });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(body.password, 10);

      // Build permissions based on role
      let permissions = body.permissions || [];
      if (body.role !== 'custom') {
        permissions = DEFAULT_PERMISSIONS[body.role] || [];
      }

      const staff = await prisma.user.create({
        data: {
          instituteId,
          name: body.name,
          phone: body.phone,
          email: body.email,
          passwordHash,
          role: body.role,
          baseSalary: body.baseSalary,
          permissionsJson: permissions,
          status: 'active',
        }
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'staff.create',
          entityType: 'user',
          entityId: staff.id,
          afterJson: { name: staff.name, role: staff.role },
          ipAddress: req.ip,
        }
      });

      logger.info(`Created staff: ${staff.name} as ${staff.role}`);
      res.status(201).json({
        success: true,
        data: {
          id: staff.id,
          name: staff.name,
          phone: staff.phone,
          role: staff.role,
          baseSalary: Number(staff.baseSalary),
          permissions: staff.permissionsJson,
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to create staff', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to create staff' });
    }
  },

  // ---------- Update Staff ----------
  async updateStaff(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;
      const body = updateStaffSchema.parse(req.body);

      const existing = await prisma.user.findFirst({
        where: { id, instituteId, role: { notIn: ['owner', 'student'] }, deletedAt: null }
      });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Staff member not found' });
        return;
      }

      // If updating role or permissions
      let permissions = existing.permissionsJson as string[];
      if (body.role && body.role !== existing.role) {
        if (body.role !== 'custom') {
          permissions = DEFAULT_PERMISSIONS[body.role] || [];
        } else {
          permissions = body.permissions || permissions;
        }
      } else if (body.permissions) {
        permissions = body.permissions;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          name: body.name,
          phone: body.phone,
          email: body.email,
          role: body.role,
          baseSalary: body.baseSalary,
          permissionsJson: permissions,
          status: body.status,
        }
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'staff.update',
          entityType: 'user',
          entityId: updated.id,
          afterJson: { name: updated.name, role: updated.role },
          ipAddress: req.ip,
        }
      });

      res.json({
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          phone: updated.phone,
          role: updated.role,
          baseSalary: Number(updated.baseSalary),
          permissions: updated.permissionsJson,
          status: updated.status,
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update staff', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update staff' });
    }
  },

  // ---------- Delete Staff ----------
  async deleteStaff(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;

      const existing = await prisma.user.findFirst({
        where: { id, instituteId, role: { notIn: ['owner', 'student'] }, deletedAt: null }
      });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Staff member not found' });
        return;
      }

      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'staff.delete',
          entityType: 'user',
          entityId: id,
          ipAddress: req.ip,
        }
      });

      res.json({ success: true, message: 'Staff member successfully deleted' });
    } catch (error: any) {
      logger.error('Failed to delete staff', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to delete staff' });
    }
  },
};
