import jwt, { Secret } from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_TOKEN_SECRET as Secret, {
    expiresIn: '30d',
  });
};

export const verifyToken = (token: string): string | object => {
  return jwt.verify(token, process.env.JWT_TOKEN_SECRET as Secret);
};
