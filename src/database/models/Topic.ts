import { ITopic } from './../../interfaces';

import mongoose from 'mongoose';

const TopicModel: mongoose.Schema<ITopic> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

export default mongoose.model('topics', TopicModel);
