import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPageEntry {
  surahNumber: number;
  ayahFrom: number;
  ayahTo: number;
  blockFrom: number;
  blockTo: number;
}

export interface IPageHandler extends Document {
  pageNo: number;
  entries: IPageEntry[];
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PageEntrySchema = new Schema<IPageEntry>(
  {
    surahNumber: {
      type: Number,
      required: [true, 'Surah number is required'],
      min: 1,
      max: 114,
    },
    ayahFrom: {
      type: Number,
      required: [true, 'Ayah range start is required'],
      min: 1,
    },
    ayahTo: {
      type: Number,
      required: [true, 'Ayah range end is required'],
      min: 1,
    },
    blockFrom: {
      type: Number,
      required: [true, 'Block range start is required'],
      min: 1,
    },
    blockTo: {
      type: Number,
      required: [true, 'Block range end is required'],
      min: 1,
    },
  },
  { _id: false }
);

const PageHandlerSchema = new Schema<IPageHandler>(
  {
    pageNo: {
      type: Number,
      required: [true, 'Page number is required'],
      unique: true,
      min: 1,
    },
    entries: {
      type: [PageEntrySchema],
      required: [true, 'At least one entry is required'],
      validate: {
        validator: function (v: IPageEntry[]) {
          return v && v.length > 0;
        },
        message: 'At least one surah entry is required',
      },
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

PageHandlerSchema.index({ pageNo: 1 });

const PageHandler: Model<IPageHandler> =
  mongoose.models.PageHandler || mongoose.model<IPageHandler>('PageHandler', PageHandlerSchema);

export default PageHandler;
