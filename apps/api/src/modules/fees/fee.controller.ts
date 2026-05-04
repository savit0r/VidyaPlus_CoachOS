import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const generateDuesSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

const recordPaymentSchema = z.object({
  feeRecordId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMode: z.enum(['cash', 'upi', 'bank', 'cheque']),
  referenceNo: z.string().optional(),
});

// ============================================
// Helpers
// ============================================
const getMonthName = (month: number) => {
  const d = new Date();
  d.setMonth(month - 1);
  return d.toLocaleString('en-US', { month: 'long' });
};

// ============================================
// Controllers
// ============================================
export const feeController = {
  // ---------- Generate Dues ----------
  async generateDues(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = generateDuesSchema.parse(req.body);
      const periodLabel = `${getMonthName(body.month)} ${body.year}`;
      
      // Calculate due date (e.g., 5th of the month)
      const defaultDueDay = 5; 
      const dueDate = new Date(body.year, body.month - 1, defaultDueDay);

      // Find all active enrollments with a fee plan
      const enrollments = await prisma.batchEnrollment.findMany({
        where: { instituteId, status: 'active', feePlanId: { not: null } },
        include: { feePlan: true },
      });

      let createdCount = 0;
      let skippedCount = 0;

      // For simplicity, we process one by one to avoid duplicate generation
      for (const enrollment of enrollments) {
        if (!enrollment.feePlan) continue;
        
        // Ensure no duplicate fee record for the same student, plan, and period
        const existing = await prisma.feeRecord.findFirst({
          where: {
            instituteId,
            studentId: enrollment.studentId,
            feePlanId: enrollment.feePlanId!,
            periodLabel,
          },
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // Generate the fee record
        await prisma.feeRecord.create({
          data: {
            instituteId,
            studentId: enrollment.studentId,
            feePlanId: enrollment.feePlanId!,
            amount: enrollment.feePlan.amount,
            dueDate,
            periodLabel,
            status: 'pending',
          },
        });
        createdCount++;
      }

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'fees.dues.generate',
          entityType: 'fee_records',
          afterJson: { periodLabel, createdCount, skippedCount },
          ipAddress: req.ip,
        },
      });

      logger.info(`Generated dues for ${periodLabel}: ${createdCount} created, ${skippedCount} skipped`);

      res.json({
        success: true,
        data: { periodLabel, createdCount, skippedCount },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to generate dues', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to generate dues' });
    }
  },

  // ---------- Record Payment ----------
  async recordPayment(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = recordPaymentSchema.parse(req.body);

      // Verify the fee record
      const feeRecord = await prisma.feeRecord.findFirst({
        where: { id: body.feeRecordId, instituteId },
      });

      if (!feeRecord) {
        res.status(404).json({ success: false, error: 'Fee record not found' });
        return;
      }

      if (feeRecord.status === 'paid') {
        res.status(400).json({ success: false, error: 'Fee record is already fully paid' });
        return;
      }

      // We perform payment and receipt generation in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the payment
        const payment = await tx.payment.create({
          data: {
            instituteId,
            feeRecordId: body.feeRecordId,
            amount: body.amount,
            paymentMode: body.paymentMode,
            referenceNo: body.referenceNo,
            recordedBy: req.user!.userId,
            status: 'completed',
          },
        });

        // 2. Update FeeRecord status
        // Check if fully paid
        const allPayments = await tx.payment.aggregate({
          where: { feeRecordId: body.feeRecordId, status: 'completed' },
          _sum: { amount: true },
        });
        
        const totalPaid = Number(allPayments._sum.amount || 0);
        const newStatus = totalPaid >= Number(feeRecord.amount) ? 'paid' : 'partial';

        await tx.feeRecord.update({
          where: { id: body.feeRecordId },
          data: { status: newStatus },
        });

        // 3. Generate Receipt Number
        // E.g., REC-2026-0001
        const receiptCount = await tx.receipt.count({ where: { instituteId } });
        const receiptNum = `REC-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(4, '0')}`;

        // 4. Create the Receipt
        const receipt = await tx.receipt.create({
          data: {
            instituteId,
            paymentId: payment.id,
            receiptNumber: receiptNum,
          },
        });

        return { payment, receipt, newStatus };
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'fees.payment.record',
          entityType: 'payment',
          entityId: result.payment.id,
          afterJson: { amount: body.amount, mode: body.paymentMode, newFeeStatus: result.newStatus },
          ipAddress: req.ip,
        },
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to record payment', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to record payment' });
    }
  },

  // ---------- Dashboard Summary ----------
  async getDashboardSummary(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const today = new Date();

      const [allFees, allPayments] = await Promise.all([
        prisma.feeRecord.findMany({ where: { instituteId } }),
        prisma.payment.aggregate({ where: { instituteId, status: 'completed' }, _sum: { amount: true } })
      ]);

      let totalDues = 0;
      let totalOverdueAmount = 0;
      let overdueRecordsCount = 0;

      allFees.forEach(f => {
        totalDues += Number(f.amount);
        if (f.status !== 'paid' && f.dueDate < today) {
          totalOverdueAmount += Number(f.amount); // Simplification: assuming full amount is overdue for simplicity, ideally it should be amount - paid
          overdueRecordsCount++;
        }
      });

      const totalCollected = Number(allPayments._sum.amount || 0);

      // Overdue List
      const overdueListRaw = await prisma.feeRecord.findMany({
        where: { instituteId, status: { not: 'paid' }, dueDate: { lt: today } },
        include: {
          student: { include: { user: { select: { name: true, phone: true } } } },
          feePlan: { select: { name: true } },
          payments: { where: { status: 'completed' }, select: { amount: true } }
        },
        take: 10,
        orderBy: { dueDate: 'asc' },
      });

      const overdueList = overdueListRaw.map(r => {
        const paid = r.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
          id: r.id,
          studentId: r.student.id,
          studentName: r.student.user.name,
          planName: r.feePlan.name,
          dueDate: r.dueDate.toISOString().split('T')[0],
          periodLabel: r.periodLabel,
          amount: Number(r.amount),
          balance: Number(r.amount) - paid,
        };
      });

      res.json({
        success: true,
        data: {
          kpis: {
            totalDues,
            totalCollected,
            totalOutstanding: totalDues - totalCollected,
            totalOverdueAmount,
            overdueRecordsCount,
          },
          overdueList,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get dashboard summary', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get dashboard summary' });
    }
  },

  // ---------- Student Ledger ----------
  async getStudentLedger(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { studentId } = req.params;

      const recordsRaw = await prisma.feeRecord.findMany({
        where: { instituteId, studentId },
        include: {
          feePlan: { select: { name: true, frequency: true } },
          payments: {
            where: { status: 'completed' },
            include: { receipt: { select: { receiptNumber: true } } },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: { dueDate: 'desc' },
      });

      let totalDues = 0;
      let totalPaid = 0;

      const records = recordsRaw.map(r => {
        const amount = Number(r.amount);
        const paid = r.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        totalDues += amount;
        totalPaid += paid;

        return {
          id: r.id,
          planName: r.feePlan.name,
          frequency: r.feePlan.frequency,
          periodLabel: r.periodLabel,
          dueDate: r.dueDate.toISOString().split('T')[0],
          amount,
          paid,
          balance: amount - paid,
          status: r.status,
          payments: r.payments.map(p => ({
            id: p.id,
            amount: Number(p.amount),
            date: p.paidAt.toISOString().split('T')[0],
            mode: p.paymentMode,
            receiptNumber: p.receipt?.receiptNumber,
          })),
        };
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalDues,
            totalPaid,
            balance: totalDues - totalPaid,
          },
          records,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get student ledger', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get student ledger' });
    }
  },

  // ---------- Get Receipt ----------
  async getReceipt(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { receiptNumber } = req.params;

      const receipt = await prisma.receipt.findFirst({
        where: { instituteId, receiptNumber },
        include: {
          institute: { select: { name: true, address: true, phone: true, email: true, logoUrl: true } },
          payment: {
            include: {
              feeRecord: {
                include: {
                  student: { include: { user: { select: { name: true, phone: true } } } },
                  feePlan: { select: { name: true } }
                }
              }
            }
          }
        }
      });

      if (!receipt) {
        res.status(404).json({ success: false, error: 'Receipt not found' });
        return;
      }

      res.json({ success: true, data: receipt });
    } catch (error: any) {
      logger.error('Failed to get receipt', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch receipt' });
    }
  },
};
