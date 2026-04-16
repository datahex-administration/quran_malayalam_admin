import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Preface from '@/models/Preface';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'verifier') {
      return NextResponse.json({ error: 'Only verifiers can verify content' }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    const previous = await Preface.findById(id).lean();
    if (!previous) {
      return NextResponse.json({ error: 'Preface not found' }, { status: 404 });
    }
    const preface = await Preface.findByIdAndUpdate(
      id,
      { isVerified: true, verifiedBy: session.loginCode, verifiedAt: new Date() },
      { new: true }
    );
    await createAuditLog({
      contentType: 'Preface',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: preface?.toObject(),
    });
    return NextResponse.json(preface);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify preface' }, { status: 500 });
  }
}
