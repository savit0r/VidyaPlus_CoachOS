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

export default router;
