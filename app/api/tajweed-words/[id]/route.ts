import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TajweedWord from '@/models/TajweedWord';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const word = await TajweedWord.findById(id).lean();
    if (!word) return NextResponse.json({ error: 'Tajweed word not found' }, { status: 404 });
    return NextResponse.json(word);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tajweed word' }, { status: 500 });
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
    const previous = await TajweedWord.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Tajweed word not found' }, { status: 404 });
    const word = await TajweedWord.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    await createAuditLog({
      contentType: 'TajweedWord',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: word?.toObject(),
    });
    return NextResponse.json(word);
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Failed to update tajweed word' }, { status: 500 });
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
    const word = await TajweedWord.findById(id).lean();
    if (!word) return NextResponse.json({ error: 'Tajweed word not found' }, { status: 404 });
    await TajweedWord.findByIdAndDelete(id);
    await createAuditLog({
      contentType: 'TajweedWord',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: word,
    });
    return NextResponse.json({ message: 'Tajweed word deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tajweed word' }, { status: 500 });
  }
}
