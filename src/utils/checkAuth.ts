import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';


const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const secret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const decoded = jwt.verify(token, secret);
    req.body.userId = typeof decoded === 'string' ? decoded : decoded.id;
    next();
  } catch (e) {
    res.status(403).json({ message: 'Unauthorized' });
  }
};

export default checkAuth;
