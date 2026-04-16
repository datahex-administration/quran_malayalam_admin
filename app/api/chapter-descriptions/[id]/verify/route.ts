import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChapterDescription from '@/models/ChapterDescription';
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
    const previous = await ChapterDescription.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Chapter description not found' }, { status: 404 });
    const description = await ChapterDescription.findByIdAndUpdate(
      id,
      { isVerified: true, verifiedBy: session.loginCode, verifiedAt: new Date() },
      { new: true }
    );
    await createAuditLog({
      contentType: 'ChapterDescription',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: description?.toObject(),
    });
    return NextResponse.json(description);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify chapter description' }, { status: 500 });
  }
}
