import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Help from '@/models/Help';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET all help entries
export async function GET() {
  try {
    await connectDB();
    const items = await Help.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching help:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST create new help
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const item = await Help.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'Help',
      contentId: item._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: item.toObject(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating help:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create' },
      { status: 500 }
    );
  }
}
