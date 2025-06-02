import { Router } from 'express';
import upload from '../utils/multerConfig';
import {
  changePassword,
  getUserById,
  getUserLastActivity,
  updateUserAvatar,
  updateUserData,
} from '../controllers/userController';
import { authenticateToken } from '../utils/authenticateToken';
import { changePasswordValidation } from '../validations/authValidation';
import { handleErrors } from '../utils/handleErrors';

const router = Router();

router.post(
  '/avatar',
  authenticateToken,
  upload.single('avatar'),
  updateUserAvatar
);
router.put('/data', authenticateToken, updateUserData);
router.get('/activity', authenticateToken, getUserLastActivity);
router.get('/:id', getUserById);
router.patch('/changePassword', changePasswordValidation, handleErrors, authenticateToken, changePassword);

export default router;
