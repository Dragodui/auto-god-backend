import jwt, { Secret } from 'jsonwebtoken';

export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET as Secret, {
      expiresIn: '15m', 
    });
  };
  
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET as Secret, {
      expiresIn: '30d',
    });
};

export const verifyAccessToken = (token: string): string | object => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret);
}

export const verifyRefreshToken = (token: string): string | object => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as Secret);
}