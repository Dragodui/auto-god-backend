import { validationResult } from 'express-validator';
import User from '../database/models/User';
import { hashPassword } from '../utils/hashPassword';
import jwt, { Secret } from 'jsonwebtoken';
import comparePasswords from '../utils/comparePasswords';
import { Request, Response } from 'express';
import { IUser } from '../interfaces';

export const register = async (req: Request, res: Response) => {
  console.log('Registering new user...');
  try {
    const password = req.body.password;
    const passwordHash = await hashPassword(password);

    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      lastName: req.body.lastName,
      password: passwordHash,
    });

    await newUser.save();
    console.log('New user created!');

    const secret = process.env.JWT_TOKEN_SECRET as Secret;
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
    isMatch = comparePasswords(password, user.password);

    if (!isMatch) {
      res.status(404).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_TOKEN_SECRET as Secret,
      { expiresIn: '30d' }
    );

    const userToSend = {
      id: user._id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      rank: user.rank,
      car: user.car,
      createdAt: user.createdAt,
      nickname: user.nickname,
    };
    console.log(user._id);
    req.session.id = userToSend.id as string;
    res.status(200).json({ userToSend, token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server error' });
  }
};
