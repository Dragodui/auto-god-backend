import mongoose, { Model } from 'mongoose';
import { IUser } from '../../types';

const UserModel: mongoose.Schema<IUser> = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      unique: true,
      default: '',
    },
    avatar: {
      type: String,
    },
    car: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    rank: {
      type: String,
      default: 'beginner',
    },
    createdAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  { timestamps: true }
);

export default mongoose.model('users', UserModel);
