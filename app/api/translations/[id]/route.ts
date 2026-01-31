import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET single translation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const translation = await Translation.findById(id).lean();

    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error fetching translation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translation' },
      { status: 500 }
    );
  }
}

// PUT update translation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();

    const previousTranslation = await Translation.findById(id).lean();
    if (!previousTranslation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }

    const translation = await Translation.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      contentType: 'Translation',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousTranslation,
      newData: translation?.toObject(),
    });

    return NextResponse.json(translation);
  } catch (error: any) {
    console.error('Error updating translation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update translation' },
      { status: 500 }
    );
  }
}

// DELETE translation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const translation = await Translation.findById(id).lean();
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }

    await Translation.findByIdAndDelete(id);

    await createAuditLog({
      contentType: 'Translation',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: translation,
    });

    return NextResponse.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { error: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}
