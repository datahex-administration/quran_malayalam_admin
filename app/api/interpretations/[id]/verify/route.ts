import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Interpretation from '@/models/Interpretation';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// POST verify interpretation
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
      return NextResponse.json(
        { error: 'Only verifiers can verify content' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const previousInterpretation = await Interpretation.findById(id).lean();
    if (!previousInterpretation) {
      return NextResponse.json({ error: 'Interpretation not found' }, { status: 404 });
    }

    const interpretation = await Interpretation.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        verifiedBy: session.loginCode,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    await createAuditLog({
      contentType: 'Interpretation',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousInterpretation,
      newData: interpretation?.toObject(),
    });

    return NextResponse.json(interpretation);
  } catch (error) {
    console.error('Error verifying interpretation:', error);
    return NextResponse.json(
      { error: 'Failed to verify interpretation' },
      { status: 500 }
    );
  }
}
