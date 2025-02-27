import { IPost } from '../../types';

import mongoose from 'mongoose';

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
  image: {
    type: String,
  },
  tags: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'tags',
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'topics',
  },
});

export default mongoose.model('posts', PostModel);
