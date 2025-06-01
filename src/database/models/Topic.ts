import { ITopic } from '../../types';

import mongoose from 'mongoose';

const TopicSchema: mongoose.Schema<ITopic> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  cover: {
    type: String,
    required: true,
  },
});

export default mongoose.model('topics', TopicSchema);
