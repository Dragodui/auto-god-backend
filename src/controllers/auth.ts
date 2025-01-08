import User from '../database/models/User';
import { hashPassword } from '../utils/hashPassword';
import jwt, { Secret } from 'jsonwebtoken';
import comparePasswords from '../utils/comparePasswords';
import { Request, Response } from 'express';
import { IUser } from '../interfaces';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

export const register = async (req: Request, res: Response) => {
  console.log('Registering new user...');
  try {
    const password = req.body.password;
    const passwordHash = await hashPassword(password);

    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      lastName: req.body.lastName,
      nickname: req.body.nickname,
      password: passwordHash,
    });

    await newUser.save();
    console.log('New user created!');

    const secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const token = jwt.sign({ id: newUser._id }, secret, {
      expiresIn: '30d',
    });

    res.status(200).send({ newUser, token });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
    }
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    let isMatch = null;
    isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      res.status(404).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id as string);
    const refreshToken = generateAccessToken(user._id as string);

    const userToSend = {
      id: user._id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      rank: user.rank,
      car: user.car,
      refreshToken: refreshToken,
      createdAt: user.createdAt,
      nickname: user.nickname,
    };

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 min
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
    });
    
    res.status(200).json({ userToSend });
    
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken; 

    const secret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const refreshSecret: Secret = process.env.REFRESH_TOKEN_SECRET as Secret;

    if (!accessToken && !refreshToken) {
      res.status(403).json({ message: 'Unauthorized: No tokens provided' });
      return;
    }

    let userId;

    if (accessToken) {
      try {
        const decodedToken = jwt.verify(accessToken, secret);
        userId = typeof decodedToken === 'string' ? decodedToken : decodedToken.id;
      } catch (error) {
        console.error('Access token invalid or expired:', error);
      }
    }

    if (!userId && refreshToken) {
      try {
        const decodedRefreshToken = jwt.verify(refreshToken, refreshSecret);
        userId = typeof decodedRefreshToken === 'string' ? decodedRefreshToken : decodedRefreshToken.id;

        const newAccessToken = generateAccessToken(userId);
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000, 
        });
      } catch (error) {
        console.error('Refresh token invalid or expired:', error);
        res.status(403).json({ message: 'Unauthorized: Invalid refresh token' });
        return;
      }
    }

    if (!userId) {
      res.status(403).json({ message: 'Unauthorized: Token verification failed' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const { password, ...sendUser } = user.toObject();
    
    res.status(200).json({ user: sendUser });
  } catch (e) {
    console.error('Server error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(400).json({ message: 'No refresh token provided' });
      return;
    }

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret);
    const user = await User.findById(typeof decodedToken === 'string' ? decodedToken : decodedToken.id);
    if (!user) {
      res.status(403).json({ message: 'User not found' });
      return;
    }

    const accessToken = generateAccessToken(user.id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });


    res.status(200).json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

