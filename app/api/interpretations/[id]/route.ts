import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Interpretation from '@/models/Interpretation';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET single interpretation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const interpretation = await Interpretation.findById(id).lean();

    if (!interpretation) {
      return NextResponse.json({ error: 'Interpretation not found' }, { status: 404 });
    }

    return NextResponse.json(interpretation);
  } catch (error) {
    console.error('Error fetching interpretation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interpretation' },
      { status: 500 }
    );
  }
}

// PUT update interpretation
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

    const previousInterpretation = await Interpretation.findById(id).lean();
    if (!previousInterpretation) {
      return NextResponse.json({ error: 'Interpretation not found' }, { status: 404 });
    }

    const interpretation = await Interpretation.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      contentType: 'Interpretation',
      contentId: id,
      action: 'update',
      performedBy: session.loginCode,
      role: session.role,
      previousData: previousInterpretation,
      newData: interpretation?.toObject(),
    });

    return NextResponse.json(interpretation);
  } catch (error: any) {
    console.error('Error updating interpretation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update interpretation' },
      { status: 500 }
    );
  }
}

// DELETE interpretation
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

    const interpretation = await Interpretation.findById(id).lean();
    if (!interpretation) {
      return NextResponse.json({ error: 'Interpretation not found' }, { status: 404 });
    }

    await Interpretation.findByIdAndDelete(id);

    await createAuditLog({
      contentType: 'Interpretation',
      contentId: id,
      action: 'delete',
      performedBy: session.loginCode,
      role: session.role,
      previousData: interpretation,
    });

    return NextResponse.json({ message: 'Interpretation deleted successfully' });
  } catch (error) {
    console.error('Error deleting interpretation:', error);
    return NextResponse.json(
      { error: 'Failed to delete interpretation' },
      { status: 500 }
    );
  }
}
