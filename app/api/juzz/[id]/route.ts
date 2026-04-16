import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Juzz from '@/models/Juzz';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const juzz = await Juzz.findById(id).lean();
    if (!juzz) return NextResponse.json({ error: 'Juzz record not found' }, { status: 404 });
    return NextResponse.json(juzz);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch juzz record' }, { status: 500 });
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
    const previous = await Juzz.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Juzz record not found' }, { status: 404 });
    const juzz = await Juzz.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    await createAuditLog({
      contentType: 'Juzz',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: juzz?.toObject(),
    });
    return NextResponse.json(juzz);
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Failed to update juzz record' }, { status: 500 });
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
    const juzz = await Juzz.findById(id).lean();
    if (!juzz) return NextResponse.json({ error: 'Juzz record not found' }, { status: 404 });
    await Juzz.findByIdAndDelete(id);
    await createAuditLog({
      contentType: 'Juzz',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: juzz,
    });
    return NextResponse.json({ message: 'Juzz record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete juzz record' }, { status: 500 });
  }
}
