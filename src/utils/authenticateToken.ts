import { NextFunction, Response, Request } from 'express';
import { verifyToken } from './generateToken';
import redisClient from '../database/redis';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const decoded = verifyToken(token);
  try {
    const userId = typeof decoded === 'string' ? decoded : decoded.id;
    const sessionUserId = await redisClient.get(`token:${token}`);
    if (!sessionUserId) {
      res
        .status(401)
        .json({ error: 'Unauthorized: Invalid or expired session' });
      return;
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
};
