import express, { Router } from 'express';
import {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation
} from '../validations/authValidation';
import {
  login,
  register,
  logout,
  getMyInfo,
  testEmail,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { handleErrors } from '../utils/handleErrors';
import { authenticateToken } from '../utils/authenticateToken';

const router: Router = express.Router();

router.post('/register', registerValidation, handleErrors, register);
router.post('/login', loginValidation, handleErrors, login);
router.get('/me', authenticateToken, getMyInfo);
router.post('/logout', authenticateToken, logout);
router.post('/forgot-password', forgotPasswordValidation, handleErrors, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, handleErrors, resetPassword);
router.post('/test-email', testEmail);

export default router;
