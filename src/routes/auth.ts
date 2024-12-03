import express, { Router } from 'express';
import { loginValidation, registerValidation } from '../validations/auth';
import checkAuth from '../utils/checkAuth';
import { getMe, login, register } from '../controllers/auth';
import { handleErrors } from '../utils/handleErrors';

const router: Router = express.Router();

router.post('/register', registerValidation, handleErrors, register);
router.post('/login', loginValidation, handleErrors, login);
router.get('/me', checkAuth, getMe);

export default router;
