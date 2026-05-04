import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { superAdminController } from './super-admin.controller';

const router = Router();

// All routes require super_admin role
router.use(authenticate);
router.use(requireRole('super_admin'));

// Platform KPIs
router.get('/kpis', superAdminController.getKpis);

// Institute CRUD
router.get('/institutes', superAdminController.listInstitutes);
router.get('/institutes/:id', superAdminController.getInstitute);
router.post('/institutes', superAdminController.createInstitute);
router.patch('/institutes/:id', superAdminController.updateInstitute);
router.delete('/institutes/:id', superAdminController.deleteInstitute);

// Plan management
router.get('/plans', superAdminController.listPlans);
router.post('/plans', superAdminController.createPlan);
router.patch('/plans/:id', superAdminController.updatePlan);

export default router;
