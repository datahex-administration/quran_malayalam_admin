import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// POST verify translation
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

    const previousTranslation = await Translation.findById(id).lean();
    if (!previousTranslation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }

    const translation = await Translation.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        verifiedBy: session.loginCode,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    await createAuditLog({
      contentType: 'Translation',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousTranslation,
      newData: translation?.toObject(),
    });

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error verifying translation:', error);
    return NextResponse.json(
      { error: 'Failed to verify translation' },
      { status: 500 }
    );
  }
}
