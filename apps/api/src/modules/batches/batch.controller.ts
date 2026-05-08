import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';
import { DAYS_OF_WEEK } from '@coachos/shared';

// ============================================
// Validation Schemas
// ============================================
const createBatchSchema = z.object({
  name: z.string().min(2).max(255),
  subject: z.string().min(1).max(100).optional(),
  teacherId: z.string().uuid().optional(),
  room: z.string().max(100).optional(),
  daysJson: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:mm'),
  capacity: z.number().int().positive().default(30),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateBatchSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  subject: z.string().min(1).max(100).optional(),
  teacherId: z.string().uuid().nullable().optional(),
  room: z.string().max(100).optional(),
  daysJson: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).min(1).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  capacity: z.number().int().positive().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const enrollSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1),
  feePlanId: z.string().uuid().optional(),
});

// ============================================
// Conflict Detection Helper
// ============================================
function timeOverlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && s2 < e1;
}

async function detectConflicts(instituteId: string, daysJson: string[], startTime: string, endTime: string, room?: string, teacherId?: string, excludeBatchId?: string) {
  const conflicts: string[] = [];
  const existingBatches = await prisma.batch.findMany({
    where: { instituteId, status: 'active', deletedAt: null, id: excludeBatchId ? { not: excludeBatchId } : undefined },
    include: { teacher: { select: { name: true } } },
  });

  for (const batch of existingBatches) {
    const batchDays = batch.daysJson as string[];
    const commonDays = daysJson.filter(d => batchDays.includes(d));
    if (commonDays.length === 0) continue;
    if (!timeOverlaps(startTime, endTime, batch.startTime, batch.endTime)) continue;

    if (room && batch.room === room) {
      conflicts.push(`Room "${room}" conflict with batch "${batch.name}" on ${commonDays.join(', ')}`);
    }
    if (teacherId && batch.teacherId === teacherId) {
      conflicts.push(`Teacher "${batch.teacher?.name}" conflict with batch "${batch.name}" on ${commonDays.join(', ')}`);
    }
  }
  return conflicts;
}

// ============================================
// Controllers
// ============================================
export const batchController = {

  // ---------- List Batches ----------
  async list(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const where: any = { instituteId, deletedAt: null };
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
        ];
      }

      const batches = await prisma.batch.findMany({
        where,
        include: {
          teacher: { select: { id: true, name: true } },
          _count: { select: { enrollments: { where: { status: 'active' } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = batches.map(b => ({
        ...b,
        enrolledStudents: b._count.enrollments,
        _count: undefined,
      }));

      res.json({ success: true, data });
    } catch (error: any) {
      logger.error('Failed to list batches', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list batches' });
    }
  },

  // ---------- Get Single Batch ----------
  async get(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;

      const batch = await prisma.batch.findFirst({
        where: { id, instituteId, deletedAt: null },
        include: {
          teacher: { select: { id: true, name: true, phone: true } },
          enrollments: {
            where: { status: 'active' },
            include: {
              feePlan: { select: { id: true, name: true, amount: true, frequency: true } },
            },
          },
        },
      });

      if (!batch) {
        res.status(404).json({ success: false, error: 'Batch not found', code: 'NOT_FOUND' });
        return;
      }

      // Get student details for enrollments
      const studentIds = batch.enrollments.map(e => e.studentId);
      const studentProfiles = await prisma.studentProfile.findMany({
        where: { id: { in: studentIds } },
        include: { user: { select: { id: true, name: true, phone: true, status: true } } },
      });
      const profileMap = new Map(studentProfiles.map(p => [p.id, p]));

      const students = batch.enrollments.map(e => {
        const profile = profileMap.get(e.studentId);
        return {
          enrollmentId: e.id,
          studentProfileId: e.studentId,
          userId: profile?.user.id,
          name: profile?.user.name,
          phone: profile?.user.phone,
          studentCode: profile?.studentCode,
          status: profile?.user.status,
          feePlan: e.feePlan,
          enrolledAt: e.enrolledAt,
        };
      });

      res.json({
        success: true,
        data: {
          id: batch.id,
          name: batch.name,
          subject: batch.subject,
          teacher: batch.teacher,
          room: batch.room,
          daysJson: batch.daysJson,
          startTime: batch.startTime,
          endTime: batch.endTime,
          capacity: batch.capacity,
          startDate: batch.startDate,
          endDate: batch.endDate,
          status: batch.status,
          createdAt: batch.createdAt,
          students,
          enrolledCount: students.length,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get batch', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get batch' });
    }
  },

  // ---------- Create Batch ----------
  async create(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = createBatchSchema.parse(req.body);

      // Check batch limit
      const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        include: {
          plan: true,
          _count: { select: { batches: { where: { deletedAt: null } } } },
        },
      });

      if (institute?.plan && institute._count.batches >= institute.plan.maxBatches) {
        res.status(403).json({
          success: false,
          error: `Batch limit reached (${institute.plan.maxBatches}). Upgrade your plan.`,
          code: 'LIMIT_REACHED',
        });
        return;
      }

      // Detect conflicts
      const conflicts = await detectConflicts(
        instituteId, body.daysJson, body.startTime, body.endTime,
        body.room || undefined, body.teacherId,
      );
      if (conflicts.length > 0) {
        res.status(409).json({
          success: false,
          error: 'Scheduling conflict detected',
          code: 'CONFLICT',
          details: conflicts,
        });
        return;
      }

      const batch = await prisma.batch.create({
        data: {
          instituteId,
          name: body.name,
          subject: body.subject,
          teacherId: body.teacherId || null,
          room: body.room || null,
          daysJson: body.daysJson,
          startTime: body.startTime,
          endTime: body.endTime,
          capacity: body.capacity,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'batch.create',
          entityType: 'batch',
          entityId: batch.id,
          afterJson: { name: batch.name, subject: batch.subject },
          ipAddress: req.ip,
        },
      });

      logger.info(`Batch created: ${batch.name}`);
      res.status(201).json({ success: true, data: batch });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to create batch', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to create batch' });
    }
  },

  // ---------- Update Batch ----------
  async update(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;
      const body = updateBatchSchema.parse(req.body);

      const existing = await prisma.batch.findFirst({ where: { id, instituteId, deletedAt: null } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Batch not found', code: 'NOT_FOUND' });
        return;
      }

      // Check conflicts if schedule changed
      if (body.daysJson || body.startTime || body.endTime || body.room || body.teacherId !== undefined) {
        const conflicts = await detectConflicts(
          instituteId,
          (body.daysJson || existing.daysJson) as string[],
          body.startTime || existing.startTime,
          body.endTime || existing.endTime,
          body.room ?? existing.room ?? undefined,
          (body.teacherId !== undefined ? body.teacherId : existing.teacherId) ?? undefined,
          id,
        );
        if (conflicts.length > 0) {
          res.status(409).json({ success: false, error: 'Scheduling conflict', code: 'CONFLICT', details: conflicts });
          return;
        }
      }

      const batch = await prisma.batch.update({
        where: { id },
        data: {
          ...body,
          startDate: body.startDate ? new Date(body.startDate) : body.startDate === null ? null : undefined,
          endDate: body.endDate ? new Date(body.endDate) : body.endDate === null ? null : undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'batch.update',
          entityType: 'batch',
          entityId: id,
          afterJson: body,
          ipAddress: req.ip,
        },
      });

      res.json({ success: true, data: batch });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update batch', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update batch' });
    }
  },

  // ---------- Delete Batch (Soft) ----------
  async delete(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;

      const existing = await prisma.batch.findFirst({ where: { id, instituteId, deletedAt: null } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Batch not found', code: 'NOT_FOUND' });
        return;
      }

      await prisma.$transaction([
        prisma.batch.update({ where: { id }, data: { status: 'inactive', deletedAt: new Date() } }),
        prisma.batchEnrollment.updateMany({ where: { batchId: id }, data: { status: 'inactive' } }),
        prisma.auditLog.create({
          data: { instituteId, userId: req.user!.userId, action: 'batch.delete', entityType: 'batch', entityId: id, beforeJson: { name: existing.name }, ipAddress: req.ip },
        }),
      ]);

      res.json({ success: true, message: 'Batch deleted' });
    } catch (error: any) {
      logger.error('Failed to delete batch', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to delete batch' });
    }
  },

  // ---------- Enroll Students into Batch ----------
  async enroll(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id: batchId } = req.params;
      const body = enrollSchema.parse(req.body);

      // Verify batch
      const batch = await prisma.batch.findFirst({
        where: { id: batchId, instituteId, deletedAt: null },
        include: { _count: { select: { enrollments: { where: { status: 'active' } } } } },
      });
      if (!batch) {
        res.status(404).json({ success: false, error: 'Batch not found', code: 'NOT_FOUND' });
        return;
      }

      const availableSlots = batch.capacity - batch._count.enrollments;
      if (body.studentIds.length > availableSlots) {
        res.status(409).json({
          success: false,
          error: `Only ${availableSlots} slots available in this batch`,
          code: 'CAPACITY_EXCEEDED',
        });
        return;
      }

      // Create enrollments
      const enrolled = [];
      const skipped = [];

      for (const studentId of body.studentIds) {
        // Check if already enrolled
        const existing = await prisma.batchEnrollment.findUnique({
          where: { studentId_batchId: { studentId, batchId } },
        });
        if (existing && existing.status === 'active') {
          skipped.push(studentId);
          continue;
        }

        if (existing) {
          // Re-activate
          await prisma.batchEnrollment.update({
            where: { id: existing.id },
            data: { status: 'active', feePlanId: body.feePlanId || null },
          });
        } else {
          await prisma.batchEnrollment.create({
            data: {
              instituteId,
              studentId,
              batchId,
              feePlanId: body.feePlanId || null,
              status: 'active',
            },
          });
        }
        enrolled.push(studentId);
      }

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'batch.enroll',
          entityType: 'batch_enrollment',
          entityId: batchId,
          afterJson: { enrolled: enrolled.length, skipped: skipped.length },
          ipAddress: req.ip,
        },
      });

      res.json({
        success: true,
        data: { enrolled: enrolled.length, skipped: skipped.length },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to enroll students', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to enroll students' });
    }
  },

  // ---------- Remove Student from Batch ----------
  async unenroll(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id: batchId, studentId } = req.params;

      const enrollment = await prisma.batchEnrollment.findUnique({
        where: { studentId_batchId: { studentId, batchId } },
      });
      if (!enrollment || enrollment.instituteId !== instituteId) {
        res.status(404).json({ success: false, error: 'Enrollment not found', code: 'NOT_FOUND' });
        return;
      }

      await prisma.batchEnrollment.update({
        where: { id: enrollment.id },
        data: { status: 'inactive' },
      });

      res.json({ success: true, message: 'Student removed from batch' });
    } catch (error: any) {
      logger.error('Failed to unenroll student', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to unenroll student' });
    }
  },
};
