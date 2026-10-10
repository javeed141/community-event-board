import mongoose, { Schema } from 'mongoose';
import '@/lib/db';

const CardDesignSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    theme: {
      type: String,
      default: 'default',
    },
    stickers: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// One saved card design per user per event
CardDesignSchema.index({ user: 1, event: 1 }, { unique: true });

export const CardDesign =
  mongoose.models.CardDesign || mongoose.model('CardDesign', CardDesignSchema);
export default CardDesign;

