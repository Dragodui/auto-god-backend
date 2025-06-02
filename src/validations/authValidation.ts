import { body } from 'express-validator';

export const registerValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

export const loginValidation = [
  body('login')
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) return true;

      const nicknameRegex = /^[a-zA-Z0-9_]{3,}$/;
      if (nicknameRegex.test(value)) return true;

      throw new Error(
        'Login must be a valid email or a nickname (at least 3 characters, letters/numbers/_)'
      );
    })
    .notEmpty()
    .withMessage('Login is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const changePasswordValidation = [
  body('oldPassword')
    .isLength({ min: 6 })
    .withMessage('Old password must be at least 6 characters long'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
]