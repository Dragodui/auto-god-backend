import { NextFunction, Response, Request } from 'express';
import { verifyToken } from './generateToken';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction 
) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const decoded = verifyToken(token) as { userId: string };
  try {
    req.userId = decoded.userId;
    next();
    return;
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
};
