import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHelp extends Document {
  title: string;
  description: string;
  icon?: string;
  order?: number;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HelpSchema = new Schema<IHelp>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    icon: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ['creator', 'verifier'],
      required: true,
    },
    verifiedBy: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Help: Model<IHelp> = mongoose.models.Help || mongoose.model<IHelp>('Help', HelpSchema);

export default Help;
