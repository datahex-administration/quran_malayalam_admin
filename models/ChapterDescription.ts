import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChapterDescription extends Document {
  customId: number;
  chapterNo: number;
  chapterNameMal: string;
  chapterNameArabic?: string;
  chapterDesMal?: string;
  chapterDesArabic?: string;
  position?: number;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterDescriptionSchema = new Schema<IChapterDescription>(
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
    chapterNameMal: {
      type: String,
      required: [true, 'Chapter name (Malayalam) is required'],
      trim: true,
    },
    chapterNameArabic: {
      type: String,
      trim: true,
    },
    chapterDesMal: {
      type: String,
    },
    chapterDesArabic: {
      type: String,
    },
    position: {
      type: Number,
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

ChapterDescriptionSchema.index({ chapterNo: 1 });

const ChapterDescription: Model<IChapterDescription> =
  mongoose.models.ChapterDescription ||
  mongoose.model<IChapterDescription>('ChapterDescription', ChapterDescriptionSchema);

export default ChapterDescription;
