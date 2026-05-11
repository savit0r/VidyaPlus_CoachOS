import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { staffController } from './staff.controller';
import { payrollController } from './payroll.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

// Staff management
router.get('/', requirePermission('settings.manage'), staffController.listStaff);
router.post('/', requirePermission('settings.manage'), staffController.createStaff);
router.patch('/:id', requirePermission('settings.manage'), staffController.updateStaff);
router.delete('/:id', requirePermission('settings.manage'), staffController.deleteStaff);

// Payroll management
router.post('/payroll', requirePermission('settings.manage'), payrollController.recordSalaryPayment);
router.get('/payroll', requirePermission('settings.manage'), payrollController.getPayrollHistory);
router.get('/payroll/suggestion', requirePermission('settings.manage'), payrollController.getSalarySuggestion);

// Attendance management
import { staffAttendanceController } from './staff-attendance.controller';
router.post('/attendance/mark', requirePermission('settings.manage'), staffAttendanceController.markAttendance);
router.get('/attendance/daily', requirePermission('settings.manage'), staffAttendanceController.getDailySummary);
router.get('/attendance/summary', requirePermission('settings.manage'), staffAttendanceController.getMonthlySummary);

export default router;
