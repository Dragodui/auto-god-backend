import { INews } from '../../types';

import mongoose from 'mongoose';

const NewsSchema: mongoose.Schema<INews> = new mongoose.Schema({
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
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'users',
    default: [],
  },
  views: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'users',
    default: [],
  },
  image: {
    type: String,
  },
  tags: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'tags',
  },
  isMarkDown: {
    type: Boolean,
    required: true,
    default: false,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'topics',
  },
});

export default mongoose.model('news', NewsSchema);
