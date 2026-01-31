import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAboutUs extends Document {
  title: string;
  description: string;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AboutUsSchema = new Schema<IAboutUs>(
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

const AboutUs: Model<IAboutUs> =
  mongoose.models.AboutUs || mongoose.model<IAboutUs>('AboutUs', AboutUsSchema);

export default AboutUs;
