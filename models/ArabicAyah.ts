import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArabicAyah extends Document {
  customId: number;
  chapterNo: number;
  verseFrom: number;
  verseTo: number;
  dataArabic: string;
  position: number;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArabicAyahSchema = new Schema<IArabicAyah>(
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
    verseFrom: {
      type: Number,
      required: [true, 'Verse from is required'],
      min: 1,
    },
    verseTo: {
      type: Number,
      required: [true, 'Verse to is required'],
      min: 1,
    },
    dataArabic: {
      type: String,
      required: [true, 'Arabic data is required'],
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

ArabicAyahSchema.index({ chapterNo: 1, verseFrom: 1 });

const ArabicAyah: Model<IArabicAyah> =
  mongoose.models.ArabicAyah || mongoose.model<IArabicAyah>('ArabicAyah', ArabicAyahSchema);

export default ArabicAyah;
