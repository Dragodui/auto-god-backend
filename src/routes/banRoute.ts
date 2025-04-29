import { Router } from 'express';
import { authenticateToken } from '../utils/authenticateToken';
import { checkAdmin } from '../utils/checkAdmin';
import { banUser, unbanUser, getBannedUsers } from '../controllers/banController';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(checkAdmin);

// Ban a user
router.post('/', banUser);

// Unban a user
router.delete('/:userId', unbanUser);

// Get all banned users
router.get('/', getBannedUsers);

export default router; 