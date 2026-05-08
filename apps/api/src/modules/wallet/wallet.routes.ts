import { Router } from 'express';
import { walletController } from './wallet.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// All wallet routes require authentication
router.use(authenticate);

// Only owners and accountants can view/manage wallet
router.get('/', requireRole('owner', 'accountant'), walletController.getWallet);
router.post('/top-up', requireRole('owner'), walletController.topUp);

export default router;
