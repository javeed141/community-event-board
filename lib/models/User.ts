import mongoose, { Schema } from 'mongoose';
import '@/lib/db';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    favoriteCategories: {
      type: [String],
      enum: ['Music', 'Workshop', 'Food', 'Sports', 'Kids'],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent re-compiling model in Next.js hot reload
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;

