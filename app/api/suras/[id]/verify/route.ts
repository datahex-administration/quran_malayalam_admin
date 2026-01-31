import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sura from '@/models/Sura';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// POST verify sura
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

    const previousSura = await Sura.findById(id).lean();
    if (!previousSura) {
      return NextResponse.json({ error: 'Sura not found' }, { status: 404 });
    }

    const sura = await Sura.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        verifiedBy: session.loginCode,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    await createAuditLog({
      contentType: 'Sura',
      contentId: id,
      action: 'verify',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousSura,
      newData: sura?.toObject(),
    });

    return NextResponse.json(sura);
  } catch (error) {
    console.error('Error verifying sura:', error);
    return NextResponse.json(
      { error: 'Failed to verify sura' },
      { status: 500 }
    );
  }
}
