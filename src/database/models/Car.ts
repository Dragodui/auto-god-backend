import mongoose from 'mongoose';
import { ICar } from '../../interfaces';

const CarModel: mongoose.Schema<ICar> = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    make: {
      type: String,
      required: true,
    },
    carModel: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('cars', CarModel);
