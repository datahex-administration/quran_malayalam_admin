import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TajweedRule from '@/models/TajweedRule';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const rule = await TajweedRule.findById(id).lean();
    if (!rule) return NextResponse.json({ error: 'Tajweed rule not found' }, { status: 404 });
    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tajweed rule' }, { status: 500 });
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

    const previous = await TajweedRule.findById(id).lean();
    if (!previous) return NextResponse.json({ error: 'Tajweed rule not found' }, { status: 404 });

    const rule = await TajweedRule.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      contentType: 'TajweedRule',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previous,
      newData: rule?.toObject(),
    });

    return NextResponse.json(rule);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update tajweed rule';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const rule = await TajweedRule.findById(id).lean();
    if (!rule) return NextResponse.json({ error: 'Tajweed rule not found' }, { status: 404 });

    await TajweedRule.findByIdAndDelete(id);

    await createAuditLog({
      contentType: 'TajweedRule',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: rule,
    });

    return NextResponse.json({ message: 'Tajweed rule deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete tajweed rule' }, { status: 500 });
  }
}
