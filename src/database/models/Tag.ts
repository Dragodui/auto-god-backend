import { ITag } from '../../types';

import mongoose from 'mongoose';

const TagModel: mongoose.Schema<ITag> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

export default mongoose.model('tags', TagModel);
