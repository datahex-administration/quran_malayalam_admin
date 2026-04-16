import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJuzz extends Document {
  customId: number;
  chapterNo: number;
  verseNo: number;
  position: number;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JuzzSchema = new Schema<IJuzz>(
  {
    customId: {
      type: Number,
      required: [true, 'ID is required'],
      unique: true,
    },
    chapterNo: {
      type: Number,
      required: [true, 'Chapter number is required'],
      min: 1,
      max: 114,
    },
    verseNo: {
      type: Number,
      required: [true, 'Verse number is required'],
      min: 1,
    },
    position: {
      type: Number,
      required: [true, 'Position is required'],
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

JuzzSchema.index({ chapterNo: 1, verseNo: 1 });

const Juzz: Model<IJuzz> =
  mongoose.models.Juzz || mongoose.model<IJuzz>('Juzz', JuzzSchema);

export default Juzz;
