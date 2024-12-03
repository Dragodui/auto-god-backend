import mongoose, { Model } from 'mongoose';
import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  nickname?: string;
  name: string;
  lastName: string;
  rank: string;
  car?: string;
  password: string;
  role: string;
  createdAt: Date;
}

export interface IPost {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  likes: number;
  views: number;
  topic: mongoose.Types.ObjectId;
}

export interface ITopic {
  title: string;
}
