import mongoose, { Schema } from 'mongoose';
import '@/lib/db';

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Music', 'Workshop', 'Food', 'Sports', 'Kids'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes for fast querying & sorting:
// 1. For active upcoming events sorted by date nearest first
EventSchema.index({ isActive: 1, dateTime: 1 });

// 2. For category & city filters
EventSchema.index({ isActive: 1, category: 1, city: 1, dateTime: 1 });

// 3. For keyword text search
EventSchema.index({ title: 'text', description: 'text' });

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
export default Event;

