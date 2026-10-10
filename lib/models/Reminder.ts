import mongoose, { Schema } from 'mongoose';
import '@/lib/db';

const ReminderSchema = new Schema(
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
  },
  { timestamps: true }
);

// One reminder per user per event
ReminderSchema.index({ user: 1, event: 1 }, { unique: true });

export const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
export default Reminder;

