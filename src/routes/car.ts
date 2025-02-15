import express, { Router } from 'express';
import { authenticateToken } from '../utils/authenticateToken';
import { addCar, changeCar } from '../controllers/car';

const router: Router = express.Router();

router.post('/', authenticateToken, addCar);
router.put('/', authenticateToken, changeCar);

export default router;
