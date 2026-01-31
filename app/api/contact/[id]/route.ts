import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactUs from '@/models/ContactUs';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET single contact us
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const item = await ContactUs.findById(id).lean();

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching contact us:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT update contact us
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

    const previousItem = await ContactUs.findById(id).lean();
    if (!previousItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await ContactUs.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      contentType: 'ContactUs',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousItem,
      newData: item?.toObject(),
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error updating contact us:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

// DELETE contact us
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

    const item = await ContactUs.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await ContactUs.findByIdAndDelete(id);

    await createAuditLog({
      contentType: 'ContactUs',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: item,
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact us:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
