import { body } from 'express-validator';

export const registerValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

export const loginValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];
