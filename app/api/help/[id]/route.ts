import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Help from '@/models/Help';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET single help
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const item = await Help.findById(id).lean();

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching help:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT update help
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

    const previousItem = await Help.findById(id).lean();
    if (!previousItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await Help.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      contentType: 'Help',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousItem,
      newData: item?.toObject(),
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error updating help:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

// DELETE help
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

    const item = await Help.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await Help.findByIdAndDelete(id);

    await createAuditLog({
      contentType: 'Help',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: item,
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting help:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
