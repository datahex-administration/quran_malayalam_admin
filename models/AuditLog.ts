import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  contentType: string;
  contentId: string;
  action: 'create' | 'update' | 'delete' | 'verify';
  performedBy: string;
  role: 'creator' | 'verifier';
  details?: string;
  previousData?: object;
  newData?: object;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    contentType: {
      type: String,
      required: true,
      enum: ['Sura', 'Translation', 'Interpretation', 'AboutUs', 'Author', 'ContactUs', 'Help'],
    },
    contentId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'verify'],
      required: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['creator', 'verifier'],
      required: true,
    },
    details: {
      type: String,
    },
    previousData: {
      type: Schema.Types.Mixed,
    },
    newData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for efficient queries
AuditLogSchema.index({ contentType: 1, contentId: 1 });
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
