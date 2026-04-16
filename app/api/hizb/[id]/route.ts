import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hizb from '@/models/Hizb';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const hizb = await Hizb.findById(id).lean();
    if (!hizb) return NextResponse.json({ error: 'Hizb record not found' }, { status: 404 });
    return NextResponse.json(hizb);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hizb record' }, { status: 500 });
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
    const previous = await Hizb.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Hizb record not found' }, { status: 404 });
    const hizb = await Hizb.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    await createAuditLog({
      contentType: 'Hizb',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: hizb?.toObject(),
    });
    return NextResponse.json(hizb);
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Failed to update hizb record' }, { status: 500 });
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
    const hizb = await Hizb.findById(id).lean();
    if (!hizb) return NextResponse.json({ error: 'Hizb record not found' }, { status: 404 });
    await Hizb.findByIdAndDelete(id);
    await createAuditLog({
      contentType: 'Hizb',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: hizb,
    });
    return NextResponse.json({ message: 'Hizb record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete hizb record' }, { status: 500 });
  }
}
