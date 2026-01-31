import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuthor extends Document {
  htmlContent: string;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    htmlContent: {
      type: String,
      required: [true, 'HTML content is required'],
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

const Author: Model<IAuthor> =
  mongoose.models.Author || mongoose.model<IAuthor>('Author', AuthorSchema);

export default Author;
