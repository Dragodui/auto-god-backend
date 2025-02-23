import express, { Router } from 'express';
import {
  loginValidation,
  registerValidation,
} from '../validations/authValidation';
import {
  login,
  register,
  logout,
  getMyInfo,
} from '../controllers/authController';
import { handleErrors } from '../utils/handleErrors';
import { authenticateToken } from '../utils/authenticateToken';

const router: Router = express.Router();

router.post('/register', registerValidation, handleErrors, register);
router.post('/login', loginValidation, handleErrors, login);
router.get('/me', authenticateToken, getMyInfo);
router.post('/logout', authenticateToken, logout);

export default router;
