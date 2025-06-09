import { IEvent } from '../../types';

import mongoose from 'mongoose';

const EventSchema: mongoose.Schema<IEvent> = new mongoose.Schema({
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

  tags: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'tags',
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  date: {
    type: Date,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  isAccepted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model('events', EventSchema);
