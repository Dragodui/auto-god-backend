import { Router } from 'express';
import upload from '../utils/multerConfig';
import {
  getUserById,
  getUserLastActivity,
  updateUserAvatar,
  updateUserData,
} from '../controllers/userController';
import { authenticateToken } from '../utils/authenticateToken';

const router = Router();

router.post(
  '/avatar',
  authenticateToken,
  upload.single('avatar'),
  updateUserAvatar
);
router.put('/data', authenticateToken, updateUserData);
router.get('/activity', authenticateToken, getUserLastActivity);
router.get('/:id', getUserById)

export default router;
