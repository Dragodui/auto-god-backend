import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from '../../types';

const UserSchema = new Schema<IUser>(
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
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpiry: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('users', UserSchema);
