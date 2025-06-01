import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  lastName: string;
  nickname: string;
  avatar?: string;
  car: string;
  password: string;
  rank: string;
  role: 'user' | 'admin';
  createdAt: Date;
  isBanned: boolean;
}

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
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('users', UserSchema);
