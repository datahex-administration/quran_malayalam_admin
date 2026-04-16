import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPreface extends Document {
  customId: number;
  prefaceSubTitle: string;
  prefaceText: string;
  suraId: number;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrefaceSchema = new Schema<IPreface>(
  {
    customId: {
      type: Number,
      required: [true, 'ID is required'],
      unique: true,
    },
    prefaceSubTitle: {
      type: String,
      required: [true, 'Preface subtitle is required'],
      trim: true,
    },
    prefaceText: {
      type: String,
      required: [true, 'Preface text is required'],
    },
    suraId: {
      type: Number,
      required: [true, 'Sura ID is required'],
      min: 1,
      max: 114,
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

PrefaceSchema.index({ suraId: 1 });

const Preface: Model<IPreface> =
  mongoose.models.Preface || mongoose.model<IPreface>('Preface', PrefaceSchema);

export default Preface;
