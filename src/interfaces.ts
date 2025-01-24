import mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  nickname?: string;
  name: string;
  lastName: string;
  rank: string;
  car?: string;
  password: string;
  role: string;
  refreshToken?: string;
  createdAt: Date;
}

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  likes: number;
  views: number;
  topicId: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
}

export interface IComment extends Document {
  authorId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  replyTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  likes: number;
}

export interface ITag extends Document {
  title: string;
}

export interface ITopic extends Document {
  title: string;
}
