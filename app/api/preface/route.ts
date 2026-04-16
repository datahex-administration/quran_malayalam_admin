import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Preface from '@/models/Preface';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET all prefaces
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const isVerifiedParam = searchParams.get('isVerified');
    const sortBy = searchParams.get('sortBy') || 'customId';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;

    const query: any = {};
    if (search) {
      query.$or = [
        { prefaceSubTitle: { $regex: search, $options: 'i' } },
        { prefaceText: { $regex: search, $options: 'i' } },
      ];
    }
    if (isVerifiedParam !== null && isVerifiedParam !== '') {
      query.isVerified = isVerifiedParam === 'true';
    }

    const sortObj: any = {};
    if (!isVerifiedParam) sortObj.isVerified = 1;
    sortObj[sortBy] = sortOrder;

    const total = await Preface.countDocuments(query);
    const prefaces = await Preface.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      prefaces,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching prefaces:', error);
    return NextResponse.json({ error: 'Failed to fetch prefaces' }, { status: 500 });
  }
}

// POST create new preface
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const preface = await Preface.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'Preface',
      contentId: preface._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: preface.toObject(),
    });

    return NextResponse.json(preface, { status: 201 });
  } catch (error: any) {
    console.error('Error creating preface:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create preface' },
      { status: 500 }
    );
  }
}
