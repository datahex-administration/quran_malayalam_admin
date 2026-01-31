import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISura extends Document {
  suraNumber: number;
  name: string;
  arabicName?: string;
  description?: string;
  ayathCount: number;
  place: 'Mecca' | 'Medina';
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SuraSchema = new Schema<ISura>(
  {
    suraNumber: {
      type: Number,
      required: [true, 'Sura number is required'],
      unique: true,
      min: 1,
      max: 114,
    },
    name: {
      type: String,
      required: [true, 'Sura name is required'],
      trim: true,
    },
    arabicName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ayathCount: {
      type: Number,
      required: [true, 'Ayath count is required'],
      min: 1,
    },
    place: {
      type: String,
      enum: ['Mecca', 'Medina'],
      required: [true, 'Place of revelation is required'],
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

const Sura: Model<ISura> = mongoose.models.Sura || mongoose.model<ISura>('Sura', SuraSchema);

export default Sura;
