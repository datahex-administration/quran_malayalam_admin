import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITranslation extends Document {
  suraNumber: number;
  ayaRangeStart: number;
  ayaRangeEnd: number;
  language: string;
  translationText: string;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new Schema<ITranslation>(
  {
    suraNumber: {
      type: Number,
      required: [true, 'Sura number is required'],
      min: 1,
      max: 114,
    },
    ayaRangeStart: {
      type: Number,
      required: [true, 'Aya range start is required'],
      min: 1,
    },
    ayaRangeEnd: {
      type: Number,
      required: [true, 'Aya range end is required'],
      min: 1,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      default: 'Malayalam',
    },
    translationText: {
      type: String,
      required: [true, 'Translation text is required'],
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

// Index for efficient queries
TranslationSchema.index({ suraNumber: 1, ayaRangeStart: 1, language: 1 });

const Translation: Model<ITranslation> =
  mongoose.models.Translation || mongoose.model<ITranslation>('Translation', TranslationSchema);

export default Translation;
