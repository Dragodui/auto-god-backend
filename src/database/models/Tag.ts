import { ITag } from '../../types';

import mongoose from 'mongoose';

const TagSchema: mongoose.Schema<ITag> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

export default mongoose.model('tags', TagSchema);
