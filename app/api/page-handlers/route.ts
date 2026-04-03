import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PageHandler from '@/models/PageHandler';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET all page handlers
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        query.$or = [
          { pageNo: searchNum },
          { 'entries.surahNumber': searchNum },
        ];
      }
    }

    const total = await PageHandler.countDocuments(query);
    const pageHandlers = await PageHandler.find(query)
      .sort({ pageNo: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      pageHandlers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching page handlers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page handlers' },
      { status: 500 }
    );
  }
}

// POST create new page handler
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const pageHandler = await PageHandler.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'PageHandler',
      contentId: pageHandler._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: pageHandler.toObject(),
    });

    return NextResponse.json(pageHandler, { status: 201 });
  } catch (error: any) {
    console.error('Error creating page handler:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Page number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create page handler' },
      { status: 500 }
    );
  }
}
