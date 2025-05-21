import mongoose, { Document, Schema } from 'mongoose';

export interface IBan extends Document {
  userId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

const BanSchema = new Schema<IBan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model<IBan>('Ban', BanSchema);
