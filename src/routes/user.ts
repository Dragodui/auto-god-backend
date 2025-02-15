// src/routes/users.ts
import { Router } from 'express';
import upload from '../utils/multerConfig';
import { updateUserAvatar } from '../controllers/user';
import { authenticateToken } from '../utils/authenticateToken';

const router = Router();

router.post(
  '/avatar',
  authenticateToken,
  upload.single('avatar'),
  updateUserAvatar
);

export default router;
