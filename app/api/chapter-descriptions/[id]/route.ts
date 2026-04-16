import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChapterDescription from '@/models/ChapterDescription';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const description = await ChapterDescription.findById(id).lean();
    if (!description) return NextResponse.json({ error: 'Chapter description not found' }, { status: 404 });
    return NextResponse.json(description);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapter description' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const data = await request.json();
    const previous = await ChapterDescription.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Chapter description not found' }, { status: 404 });
    const description = await ChapterDescription.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    await createAuditLog({
      contentType: 'ChapterDescription',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: description?.toObject(),
    });
    return NextResponse.json(description);
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Failed to update chapter description' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const description = await ChapterDescription.findById(id).lean();
    if (!description) return NextResponse.json({ error: 'Chapter description not found' }, { status: 404 });
    await ChapterDescription.findByIdAndDelete(id);
    await createAuditLog({
      contentType: 'ChapterDescription',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: description,
    });
    return NextResponse.json({ message: 'Chapter description deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete chapter description' }, { status: 500 });
  }
}
