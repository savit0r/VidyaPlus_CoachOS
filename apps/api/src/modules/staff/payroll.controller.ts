import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const recordPayrollSchema = z.object({
  staffId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMode: z.enum(['cash', 'upi', 'bank']),
  referenceNo: z.string().optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

// ============================================
// Controllers
// ============================================
export const payrollController = {
  // ---------- Record Salary Payment ----------
  async recordSalaryPayment(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = recordPayrollSchema.parse(req.body);

      // Verify the staff user exists in this institute
      const staff = await prisma.user.findFirst({
        where: { id: body.staffId, instituteId, role: { notIn: ['owner', 'student'] }, deletedAt: null }
      });

      if (!staff) {
        res.status(404).json({ success: false, error: 'Staff member not found' });
        return;
      }

      // Check if duplicate payroll record for the same month and year exists
      const existing = await prisma.payrollRecord.findFirst({
        where: {
          instituteId,
          staffId: body.staffId,
          month: body.month,
          year: body.year,
        },
      });

      if (existing) {
        res.status(409).json({ success: false, error: 'Salary payment has already been recorded for this month and year' });
        return;
      }

      // Record the payroll
      const payroll = await prisma.payrollRecord.create({
        data: {
          instituteId,
          staffId: body.staffId,
          amount: body.amount,
          paymentMode: body.paymentMode,
          referenceNo: body.referenceNo,
          month: body.month,
          year: body.year,
        },
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'payroll.record',
          entityType: 'payroll_record',
          entityId: payroll.id,
          afterJson: { amount: body.amount, month: body.month, year: body.year },
          ipAddress: req.ip,
        }
      });

      logger.info(`Recorded salary payment of ₹${body.amount} for ${staff.name} for ${body.month}/${body.year}`);
      res.status(201).json({ success: true, data: payroll });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to record salary payment', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to record salary payment' });
    }
  },

  // ---------- Get Payroll History ----------
  async getPayrollHistory(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { staffId } = req.query;

      const where: any = { instituteId };
      if (staffId && typeof staffId === 'string') {
        where.staffId = staffId;
      }

      const history = await prisma.payrollRecord.findMany({
        where,
        include: {
          staff: { select: { name: true, phone: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalPaid = history.reduce((sum, p) => sum + Number(p.amount), 0);

      res.json({
        success: true,
        data: {
          totalPaid,
          history: history.map(p => ({
            id: p.id,
            staffName: p.staff.name,
            staffPhone: p.staff.phone,
            role: p.staff.role,
            amount: Number(p.amount),
            paymentMode: p.paymentMode,
            referenceNo: p.referenceNo,
            period: `${p.month}/${p.year}`,
            paymentDate: p.paymentDate.toISOString().split('T')[0],
          })),
        }
      });
    } catch (error: any) {
      logger.error('Failed to get payroll history', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch payroll history' });
    }
  },
};
