import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TajweedRule from '@/models/TajweedRule';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  _request: NextRequest,
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

    const previous = await TajweedRule.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Tajweed rule not found' }, { status: 404 });

    const rule = await TajweedRule.findByIdAndUpdate(
      id,
      { isVerified: true, verifiedBy: session.loginCode, verifiedAt: new Date() },
      { new: true }
    );

    await createAuditLog({
      contentType: 'TajweedRule',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: rule?.toObject(),
    });

    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: 'Failed to verify tajweed rule' }, { status: 500 });
  }
}
