import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITajweedRule extends Document {
  title: string;
  description: string;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TajweedRuleSchema = new Schema<ITajweedRule>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
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

TajweedRuleSchema.index({ title: 1 });
TajweedRuleSchema.index({ isVerified: 1 });

const TajweedRule: Model<ITajweedRule> =
  mongoose.models.TajweedRule ||
  mongoose.model<ITajweedRule>('TajweedRule', TajweedRuleSchema);

export default TajweedRule;
