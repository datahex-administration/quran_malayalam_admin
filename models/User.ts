import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  loginCode: string;
  role: 'creator' | 'verifier';
  lastLogin?: Date;
  loginCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    loginCode: {
      type: String,
      required: [true, 'Login code is required'],
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['creator', 'verifier'],
      required: true,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
