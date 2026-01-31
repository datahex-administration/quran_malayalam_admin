import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactUs extends Document {
  mobile?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  remarks?: string;
  createdBy: string;
  createdByRole: 'creator' | 'verifier';
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactUsSchema = new Schema<IContactUs>(
  {
    mobile: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
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

const ContactUs: Model<IContactUs> =
  mongoose.models.ContactUs || mongoose.model<IContactUs>('ContactUs', ContactUsSchema);

export default ContactUs;
