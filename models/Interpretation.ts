import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterpretation extends Document {
  suraNumber: number;
  ayaRangeStart: number;
  ayaRangeEnd: number;
  interpretationNumber: number;
  language: string;
  interpretationText: string;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InterpretationSchema = new Schema<IInterpretation>(
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
    interpretationNumber: {
      type: Number,
      required: [true, 'Interpretation number is required'],
      min: 1,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      default: 'Malayalam',
    },
    interpretationText: {
      type: String,
      required: [true, 'Interpretation text is required'],
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
InterpretationSchema.index({ suraNumber: 1, interpretationNumber: 1, language: 1 });

const Interpretation: Model<IInterpretation> =
  mongoose.models.Interpretation ||
  mongoose.model<IInterpretation>('Interpretation', InterpretationSchema);

export default Interpretation;
