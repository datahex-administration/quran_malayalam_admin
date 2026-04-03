import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PageHandler from '@/models/PageHandler';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET single page handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const pageHandler = await PageHandler.findById(id).lean();

    if (!pageHandler) {
      return NextResponse.json({ error: 'Page handler not found' }, { status: 404 });
    }

    return NextResponse.json(pageHandler);
  } catch (error) {
    console.error('Error fetching page handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page handler' },
      { status: 500 }
    );
  }
}

// PUT update page handler
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

    const previousPageHandler = await PageHandler.findById(id).lean();
    if (!previousPageHandler) {
      return NextResponse.json({ error: 'Page handler not found' }, { status: 404 });
    }

    const pageHandler = await PageHandler.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      contentType: 'PageHandler',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousPageHandler,
      newData: pageHandler?.toObject(),
    });

    return NextResponse.json(pageHandler);
  } catch (error: any) {
    console.error('Error updating page handler:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Page number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update page handler' },
      { status: 500 }
    );
  }
}

// DELETE page handler
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

    const pageHandler = await PageHandler.findById(id).lean();
    if (!pageHandler) {
      return NextResponse.json({ error: 'Page handler not found' }, { status: 404 });
    }

    await PageHandler.findByIdAndDelete(id);

    await createAuditLog({
      contentType: 'PageHandler',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: pageHandler,
    });

    return NextResponse.json({ message: 'Page handler deleted successfully' });
  } catch (error) {
    console.error('Error deleting page handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete page handler' },
      { status: 500 }
    );
  }
}
