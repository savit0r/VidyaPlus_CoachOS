import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const createStudentSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
  dob: z.string().optional(),          // YYYY-MM-DD
  address: z.string().optional(),
  parentName: z.string().min(2).max(255).optional(),
  parentPhone: z.string().min(10).max(15).optional(),
  batchIds: z.array(z.string().uuid()).optional(),     // Enroll into batches immediately
  feePlanId: z.string().uuid().optional(),              // Assign fee plan
});

const updateStudentSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().min(2).max(255).optional(),
  parentPhone: z.string().min(10).max(15).optional(),
  status: z.enum(['active', 'inactive', 'alumni']).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  batchId: z.string().uuid().optional(),
});

// Auto-generate student code: VP-{year}-{sequence}
async function generateStudentCode(instituteId: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await prisma.studentProfile.count({ where: { instituteId } });
  const sequence = (count + 1).toString().padStart(4, '0');
  return `VP-${year}-${sequence}`;
}

// ============================================
// Controllers
// ============================================
export const studentController = {

  // ---------- List Students ----------
  async list(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const query = listQuerySchema.parse(req.query);
      const skip = (query.page - 1) * query.limit;

      const where: any = {
        instituteId,
        role: 'student',
        deletedAt: null,
      };

      if (query.status) where.status = query.status;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { studentProfile: { studentCode: { contains: query.search, mode: 'insensitive' } } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            studentProfile: {
              select: {
                id: true,
                studentCode: true,
                parentName: true,
                parentPhone: true,
                enrolledAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: query.limit,
        }),
        prisma.user.count({ where }),
      ]);

      // If filtering by batch, do a second query
      let filteredUsers = users;
      if (query.batchId) {
        const enrolledStudentIds = await prisma.batchEnrollment.findMany({
          where: { batchId: query.batchId, status: 'active', instituteId },
          select: { studentId: true },
        });
        const enrolledSet = new Set(enrolledStudentIds.map(e => e.studentId));
        filteredUsers = users.filter(u => u.studentProfile && enrolledSet.has(u.studentProfile.id));
      }

      // Get batch enrollments for each student
      const profileIds = filteredUsers.map(u => u.studentProfile?.id).filter(Boolean) as string[];
      const enrollments = await prisma.batchEnrollment.findMany({
        where: { studentId: { in: profileIds }, status: 'active', instituteId },
        include: { batch: { select: { id: true, name: true, subject: true } } },
      });
      const enrollmentMap = new Map<string, typeof enrollments>();
      enrollments.forEach(e => {
        const list = enrollmentMap.get(e.studentId) || [];
        list.push(e);
        enrollmentMap.set(e.studentId, list);
      });

      const data = filteredUsers.map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        dob: u.dob,
        photoUrl: u.photoUrl,
        status: u.status,
        createdAt: u.createdAt,
        profile: u.studentProfile,
        batches: u.studentProfile ? (enrollmentMap.get(u.studentProfile.id) || []).map(e => e.batch) : [],
      }));

      res.json({
        success: true,
        data,
        meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
      });
    } catch (error: any) {
      logger.error('Failed to list students', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list students' });
    }
  },

  // ---------- Get Single Student ----------
  async get(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;

      const user = await prisma.user.findFirst({
        where: { id, instituteId, role: 'student', deletedAt: null },
        include: {
          studentProfile: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'Student not found', code: 'NOT_FOUND' });
        return;
      }

      // Get batch enrollments
      const enrollments = user.studentProfile
        ? await prisma.batchEnrollment.findMany({
            where: { studentId: user.studentProfile.id, instituteId },
            include: {
              batch: { select: { id: true, name: true, subject: true, startTime: true, endTime: true, daysJson: true, status: true } },
              feePlan: { select: { id: true, name: true, amount: true, frequency: true } },
            },
          })
        : [];

      // Get fee records summary
      const feeRecords = user.studentProfile
        ? await prisma.feeRecord.findMany({
            where: { studentId: user.studentProfile.id, instituteId },
            include: { feePlan: { select: { name: true } } },
            orderBy: { dueDate: 'desc' },
            take: 10,
          })
        : [];

      // Get attendance summary (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const attendanceSummary = await prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { studentId: id, instituteId, date: { gte: thirtyDaysAgo } },
        _count: { status: true },
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          dob: user.dob,
          address: user.address,
          photoUrl: user.photoUrl,
          status: user.status,
          createdAt: user.createdAt,
          profile: user.studentProfile,
          enrollments,
          recentFeeRecords: feeRecords,
          attendanceSummary: Object.fromEntries(attendanceSummary.map(a => [a.status, a._count.status])),
        },
      });
    } catch (error: any) {
      logger.error('Failed to get student', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get student' });
    }
  },

  // ---------- Create Student ----------
  async create(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = createStudentSchema.parse(req.body);

      // Check duplicate phone within institute
      const existing = await prisma.user.findFirst({
        where: { instituteId, phone: body.phone, role: 'student', deletedAt: null },
      });
      if (existing) {
        res.status(409).json({ success: false, error: 'Student with this phone already exists', code: 'DUPLICATE_PHONE' });
        return;
      }

      // Check plan limits
      const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        include: { plan: true, _count: { select: { studentProfiles: true } } },
      });
      if (institute?.plan && institute._count.studentProfiles >= institute.plan.maxStudents) {
        res.status(403).json({
          success: false,
          error: `Student limit reached (${institute.plan.maxStudents}). Upgrade your plan.`,
          code: 'PLAN_LIMIT',
        });
        return;
      }

      const studentCode = await generateStudentCode(instituteId);

      const result = await prisma.$transaction(async (tx) => {
        // Create User
        const user = await tx.user.create({
          data: {
            instituteId,
            name: body.name,
            phone: body.phone,
            email: body.email,
            dob: body.dob ? new Date(body.dob) : null,
            address: body.address,
            role: 'student',
            permissionsJson: [],
            status: 'active',
          },
        });

        // Create Student Profile
        const profile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            instituteId,
            studentCode,
            parentName: body.parentName,
            parentPhone: body.parentPhone,
          },
        });

        // Enroll into batches if provided
        const enrollments = [];
        if (body.batchIds && body.batchIds.length > 0) {
          for (const batchId of body.batchIds) {
            // Verify batch exists and check capacity
            const batch = await tx.batch.findFirst({
              where: { id: batchId, instituteId, deletedAt: null },
              include: { _count: { select: { enrollments: { where: { status: 'active' } } } } },
            });
            if (!batch) continue;
            if (batch._count.enrollments >= batch.capacity) continue;

            const enrollment = await tx.batchEnrollment.create({
              data: {
                instituteId,
                studentId: profile.id,
                batchId,
                feePlanId: body.feePlanId || null,
                status: 'active',
              },
            });
            enrollments.push(enrollment);
          }
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            instituteId,
            userId: req.user!.userId,
            action: 'student.create',
            entityType: 'student',
            entityId: user.id,
            afterJson: { name: user.name, phone: user.phone, studentCode, batchCount: enrollments.length },
            ipAddress: req.ip,
          },
        });

        return { user, profile, enrollments };
      });

      logger.info(`Student created: ${result.user.name} (${result.profile.studentCode})`);

      res.status(201).json({
        success: true,
        data: {
          id: result.user.id,
          name: result.user.name,
          phone: result.user.phone,
          studentCode: result.profile.studentCode,
          batchesEnrolled: result.enrollments.length,
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to create student', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to create student' });
    }
  },

  // ---------- Update Student ----------
  async update(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;
      const body = updateStudentSchema.parse(req.body);

      const existing = await prisma.user.findFirst({
        where: { id, instituteId, role: 'student', deletedAt: null },
        include: { studentProfile: true },
      });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Student not found', code: 'NOT_FOUND' });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id },
          data: {
            name: body.name,
            phone: body.phone,
            email: body.email,
            dob: body.dob ? new Date(body.dob) : undefined,
            address: body.address,
            status: body.status,
          },
        });

        if (existing.studentProfile && (body.parentName || body.parentPhone)) {
          await tx.studentProfile.update({
            where: { id: existing.studentProfile.id },
            data: {
              parentName: body.parentName,
              parentPhone: body.parentPhone,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            instituteId,
            userId: req.user!.userId,
            action: 'student.update',
            entityType: 'student',
            entityId: id,
            afterJson: body,
            ipAddress: req.ip,
          },
        });
      });

      res.json({ success: true, message: 'Student updated' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update student', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update student' });
    }
  },

  // ---------- Delete Student (Soft) ----------
  async delete(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;

      const existing = await prisma.user.findFirst({
        where: { id, instituteId, role: 'student', deletedAt: null },
      });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Student not found', code: 'NOT_FOUND' });
        return;
      }

      await prisma.$transaction([
        prisma.user.update({ where: { id }, data: { status: 'inactive', deletedAt: new Date() } }),
        prisma.auditLog.create({
          data: {
            instituteId,
            userId: req.user!.userId,
            action: 'student.delete',
            entityType: 'student',
            entityId: id,
            beforeJson: { name: existing.name },
            ipAddress: req.ip,
          },
        }),
      ]);

      res.json({ success: true, message: 'Student deleted' });
    } catch (error: any) {
      logger.error('Failed to delete student', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to delete student' });
    }
  },
};
