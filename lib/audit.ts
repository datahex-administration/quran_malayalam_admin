import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

interface AuditLogEntry {
  contentType: string;
  contentId: string;
  action: 'create' | 'update' | 'delete' | 'verify';
  performedBy: string;
  role: 'creator' | 'verifier';
  details?: string;
  previousData?: object;
  newData?: object;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create(entry);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}
