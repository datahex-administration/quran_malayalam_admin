import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hizb from '@/models/Hizb';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'verifier') {
      return NextResponse.json({ error: 'Only verifiers can verify content' }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    const previous = await Hizb.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Hizb record not found' }, { status: 404 });
    const hizb = await Hizb.findByIdAndUpdate(
      id,
      { isVerified: true, verifiedBy: session.loginCode, verifiedAt: new Date() },
      { new: true }
    );
    await createAuditLog({
      contentType: 'Hizb',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: hizb?.toObject(),
    });
    return NextResponse.json(hizb);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify hizb record' }, { status: 500 });
  }
}
