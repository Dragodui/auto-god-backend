import User from '../database/models/User';
import { hashPassword } from '../utils/hashPassword';
import jwt, { Secret } from 'jsonwebtoken';
import comparePasswords from '../utils/comparePasswords';
import { Request, Response } from 'express';
import { IUser } from '../interfaces';
import { generateToken } from '../utils/generateToken';

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

    res.status(200).send({ message: 'User created' });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
    }
    const user: IUser | null = await User.findOne({
      $or: [{ email: login }, { nickname: login }],
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      res.status(404).json({ message: 'Invalid email/nickname or password' });
    }
    const token = generateToken(user._id as unknown as string);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(200).json({ message: 'Logged in successfully' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
