import { IComment } from '../../types';

import mongoose from 'mongoose';

const CommentModel: mongoose.Schema<IComment> = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'posts',
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comments',
    default: null,
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
});

export default mongoose.model('comments', CommentModel);
