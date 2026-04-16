import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Preface from '@/models/Preface';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const preface = await Preface.findById(id).lean();
    if (!preface) {
      return NextResponse.json({ error: 'Preface not found' }, { status: 404 });
    }
    return NextResponse.json(preface);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preface' }, { status: 500 });
  }
}

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
    const previous = await Preface.findById(id).lean();
    if (!previous) {
      return NextResponse.json({ error: 'Preface not found' }, { status: 404 });
    }
    const preface = await Preface.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    await createAuditLog({
      contentType: 'Preface',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: preface?.toObject(),
    });
    return NextResponse.json(preface);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update preface' },
      { status: 500 }
    );
  }
}

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
    const preface = await Preface.findById(id).lean();
    if (!preface) {
      return NextResponse.json({ error: 'Preface not found' }, { status: 404 });
    }
    await Preface.findByIdAndDelete(id);
    await createAuditLog({
      contentType: 'Preface',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: preface,
    });
    return NextResponse.json({ message: 'Preface deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete preface' }, { status: 500 });
  }
}
