import express, { Request, Response, Router } from 'express';
import { loginValidation, registerValidation } from '../validations/auth';
import { login, register, logout } from '../controllers/auth';
import { handleErrors } from '../utils/handleErrors'

const router: Router = express.Router();

router.post('/register', registerValidation, handleErrors, register);
router.post('/login', handleErrors, login);
router.post('/logout', logout);

export default router;
