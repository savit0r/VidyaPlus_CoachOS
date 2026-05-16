import prisma from '../src/lib/prisma';
import logger from '../src/lib/logger';

async function cleanupOrphans() {
  logger.info('Starting database cleanup for orphan/dangling records...');

  try {
    // 1. Cleanup StudentProfile without User
    const profiles = await prisma.studentProfile.findMany({
      include: { user: true }
    });
    const danglingProfiles = profiles.filter(p => !p.user);
    if (danglingProfiles.length > 0) {
      logger.warn(`Found ${danglingProfiles.length} dangling StudentProfiles. Deleting...`);
      await prisma.studentProfile.deleteMany({
        where: { id: { in: danglingProfiles.map(p => p.id) } }
      });
    }

    // 2. Cleanup BatchEnrollment without Batch or StudentProfile
    const enrollments = await prisma.batchEnrollment.findMany({
      include: { batch: true, student: true }
    });
    const danglingEnrollments = enrollments.filter(e => !e.batch || !e.student);
    if (danglingEnrollments.length > 0) {
      logger.warn(`Found ${danglingEnrollments.length} dangling BatchEnrollments. Deleting...`);
      await prisma.batchEnrollment.deleteMany({
        where: { id: { in: danglingEnrollments.map(e => e.id) } }
      });
    }

    // 3. Cleanup FeeRecord without StudentProfile or Batch
    const feeRecords = await prisma.feeRecord.findMany({
      include: { student: true, batch: true }
    });
    const danglingFees = feeRecords.filter(f => !f.student || !f.batch);
    if (danglingFees.length > 0) {
      logger.warn(`Found ${danglingFees.length} dangling FeeRecords. Deleting...`);
      await prisma.feeRecord.deleteMany({
        where: { id: { in: danglingFees.map(f => f.id) } }
      });
    }

    // 4. Cleanup Payment without FeeRecord
    const payments = await prisma.payment.findMany({
      include: { feeRecord: true }
    });
    const danglingPayments = payments.filter(p => !p.feeRecord);
    if (danglingPayments.length > 0) {
      logger.warn(`Found ${danglingPayments.length} dangling Payments. Deleting...`);
      await prisma.payment.deleteMany({
        where: { id: { in: danglingPayments.map(p => p.id) } }
      });
    }

    // 5. Cleanup Receipt without Payment
    const receipts = await prisma.receipt.findMany({
      include: { payment: true }
    });
    const danglingReceipts = receipts.filter(r => !r.payment);
    if (danglingReceipts.length > 0) {
      logger.warn(`Found ${danglingReceipts.length} dangling Receipts. Deleting...`);
      await prisma.receipt.deleteMany({
        where: { id: { in: danglingReceipts.map(r => r.id) } }
      });
    }

    // 6. Cleanup Orphan FeePlans (Default fees without a batch)
    const feePlans = await prisma.feePlan.findMany({
      where: { name: { contains: 'Default Fee' } },
      include: { batches: true }
    });
    const orphanFeePlans = feePlans.filter(fp => fp.batches.length === 0);
    if (orphanFeePlans.length > 0) {
      logger.warn(`Found ${orphanFeePlans.length} orphan FeePlans (Default fees). Deleting...`);
      await prisma.feePlan.deleteMany({
        where: { id: { in: orphanFeePlans.map(fp => fp.id) } }
      });
    }

    logger.info('Database cleanup completed successfully.');
  } catch (error: any) {
    logger.error('Cleanup failed', { error: error.message });
    process.exit(1);
  }
}

cleanupOrphans();
