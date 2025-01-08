import { refreshToken } from './../controllers/auth';
import express, { Request, Response, Router } from 'express';
import { loginValidation, registerValidation } from '../validations/auth';
import checkAuth from '../utils/checkAuth';
import { getMe, login, register, logout } from '../controllers/auth';
import { handleErrors } from '../utils/handleErrors';

const router: Router = express.Router();

router.post('/register', registerValidation, handleErrors, register);
router.post('/login', loginValidation, handleErrors, login);
router.get('/me', checkAuth, getMe);
router.get('/verify', checkAuth, (req: Request, res: Response): void => {
    res.status(200).json({ message: 'User is authenticated' });
});
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
