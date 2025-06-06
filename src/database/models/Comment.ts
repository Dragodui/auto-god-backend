import { IComment } from '../../types';

import mongoose from 'mongoose';

const CommentSchema: mongoose.Schema<IComment> = new mongoose.Schema({
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
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'users',
    default: [],
  },
});

export default mongoose.model('comments', CommentSchema);
