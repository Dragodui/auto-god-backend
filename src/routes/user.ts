import { Router } from 'express';
import upload from '../utils/multerConfig';
import {
  getUserLastActivity,
  updateUserAvatar,
  updateUserData,
} from '../controllers/user';
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

export default router;
