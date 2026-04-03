import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PageHandler from '@/models/PageHandler';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// POST verify page handler
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

    const previousPageHandler = await PageHandler.findById(id).lean();
    if (!previousPageHandler) {
      return NextResponse.json({ error: 'Page handler not found' }, { status: 404 });
    }

    const pageHandler = await PageHandler.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        verifiedBy: session.loginCode,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    await createAuditLog({
      contentType: 'PageHandler',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousPageHandler,
      newData: pageHandler?.toObject(),
    });

    return NextResponse.json(pageHandler);
  } catch (error) {
    console.error('Error verifying page handler:', error);
    return NextResponse.json(
      { error: 'Failed to verify page handler' },
      { status: 500 }
    );
  }
}
