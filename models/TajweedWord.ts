import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITajweedWord extends Document {
  customId: number;
  surahNo: number;
  ayahNo: number;
  wordPos: number;
  wordText?: string;
  imageUrl: string;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TajweedWordSchema = new Schema<ITajweedWord>(
  {
    customId: {
      type: Number,
      required: [true, 'ID is required'],
      unique: true,
    },
    surahNo: {
      type: Number,
      required: [true, 'Surah number is required'],
      min: 1,
      max: 114,
    },
    ayahNo: {
      type: Number,
      required: [true, 'Ayah number is required'],
      min: 1,
    },
    wordPos: {
      type: Number,
      required: [true, 'Word position is required'],
      min: 1,
    },
    wordText: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
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

TajweedWordSchema.index({ surahNo: 1, ayahNo: 1 });

const TajweedWord: Model<ITajweedWord> =
  mongoose.models.TajweedWord || mongoose.model<ITajweedWord>('TajweedWord', TajweedWordSchema);

export default TajweedWord;
