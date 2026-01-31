import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sura from '@/models/Sura';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET single sura
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const sura = await Sura.findById(id).lean();

    if (!sura) {
      return NextResponse.json({ error: 'Sura not found' }, { status: 404 });
    }

    return NextResponse.json(sura);
  } catch (error) {
    console.error('Error fetching sura:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sura' },
      { status: 500 }
    );
  }
}

// PUT update sura
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

    const previousSura = await Sura.findById(id).lean();
    if (!previousSura) {
      return NextResponse.json({ error: 'Sura not found' }, { status: 404 });
    }

    const sura = await Sura.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      contentType: 'Sura',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousSura,
      newData: sura?.toObject(),
    });

    return NextResponse.json(sura);
  } catch (error: any) {
    console.error('Error updating sura:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Sura number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update sura' },
      { status: 500 }
    );
  }
}

// DELETE sura
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

    const sura = await Sura.findById(id).lean();
    if (!sura) {
      return NextResponse.json({ error: 'Sura not found' }, { status: 404 });
    }

    await Sura.findByIdAndDelete(id);

    await createAuditLog({
      contentType: 'Sura',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: sura,
    });

    return NextResponse.json({ message: 'Sura deleted successfully' });
  } catch (error) {
    console.error('Error deleting sura:', error);
    return NextResponse.json(
      { error: 'Failed to delete sura' },
      { status: 500 }
    );
  }
}
