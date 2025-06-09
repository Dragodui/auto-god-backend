import mongoose, { Types } from 'mongoose';
import { Document } from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    file?: {
      path: string;
    };
  }
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
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
  resetPasswordToken: string | undefined;
  resetPasswordExpiry: Date | undefined;
  isBanned: boolean;
}

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  likes: mongoose.Types.ObjectId[];
  views: mongoose.Types.ObjectId[];
  topicId: mongoose.Types.ObjectId;
  image: string;
  tags: mongoose.Types.ObjectId[];
}

export interface IComment extends Document {
  author?: IUser;
  authorId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  replyTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  likes: mongoose.Types.ObjectId[];
}

export interface IEvent extends Document {
  author?: IUser;
  authorId: mongoose.Types.ObjectId;
  date: Date;
  title: string;
  place: string;
  content: string;
  createdAt: Date;
  likes: mongoose.Types.ObjectId[];
  views: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  image: string;
  isAccepted: boolean;
}

export interface ITag extends Document {
  title: string;
}

export interface ITopic extends Document {
  title: string;
  cover: string;
}

export interface INews extends IPost {
  isMarkDown: boolean;
}

export interface ICar extends Document {
  ownerId: mongoose.Types.ObjectId;
  make: string;
  carModel: string;
  year: number;
  description: string;
}
