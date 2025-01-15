import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (!token) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const secret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') {
      req.body.userId = decoded;
    } else {
      req.body.userId = decoded.id;
    }
    next();
  } catch (e) {
    res.status(403).json({ message: 'Unauthorized' });
  }
};

export default checkAuth;
