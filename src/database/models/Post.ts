import { IPost } from './../../interfaces';

import mongoose, { Model } from 'mongoose';

const PostModel: mongoose.Schema<IPost> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('posts', PostModel);
