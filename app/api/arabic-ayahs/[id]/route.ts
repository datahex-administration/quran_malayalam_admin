import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ArabicAyah from '@/models/ArabicAyah';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const ayah = await ArabicAyah.findById(id).lean();
    if (!ayah) return NextResponse.json({ error: 'Arabic ayah not found' }, { status: 404 });
    return NextResponse.json(ayah);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Arabic ayah' }, { status: 500 });
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
    const previous = await ArabicAyah.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Arabic ayah not found' }, { status: 404 });
    const ayah = await ArabicAyah.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    await createAuditLog({
      contentType: 'ArabicAyah',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: ayah?.toObject(),
    });
    return NextResponse.json(ayah);
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Failed to update Arabic ayah' }, { status: 500 });
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
    const ayah = await ArabicAyah.findById(id).lean();
    if (!ayah) return NextResponse.json({ error: 'Arabic ayah not found' }, { status: 404 });
    await ArabicAyah.findByIdAndDelete(id);
    await createAuditLog({
      contentType: 'ArabicAyah',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: ayah,
    });
    return NextResponse.json({ message: 'Arabic ayah deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete Arabic ayah' }, { status: 500 });
  }
}
