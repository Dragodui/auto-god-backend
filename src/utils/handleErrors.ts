import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import logger from './logger';

export const handleErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors: ${JSON.stringify(errors.array())}`);
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};
