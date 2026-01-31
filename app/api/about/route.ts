import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AboutUs from '@/models/AboutUs';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET all about us entries
export async function GET() {
  try {
    await connectDB();
    const items = await AboutUs.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching about us:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST create new about us
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const item = await AboutUs.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'AboutUs',
      contentId: item._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: item.toObject(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating about us:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create' },
      { status: 500 }
    );
  }
}
