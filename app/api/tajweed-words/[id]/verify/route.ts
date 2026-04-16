import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TajweedWord from '@/models/TajweedWord';
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
    const previous = await TajweedWord.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Tajweed word not found' }, { status: 404 });
    const word = await TajweedWord.findByIdAndUpdate(
      id,
      { isVerified: true, verifiedBy: session.loginCode, verifiedAt: new Date() },
      { new: true }
    );
    await createAuditLog({
      contentType: 'TajweedWord',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: word?.toObject(),
    });
    return NextResponse.json(word);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify tajweed word' }, { status: 500 });
  }
}
