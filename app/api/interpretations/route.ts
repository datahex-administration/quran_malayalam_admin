import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Interpretation from '@/models/Interpretation';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET all interpretations
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const suraNumber = searchParams.get('suraNumber');
    const language = searchParams.get('language');

    const isVerifiedParam = searchParams.get('isVerified');

    const query: any = {};
    if (suraNumber) query.suraNumber = parseInt(suraNumber);
    if (language) query.language = language;
    if (isVerifiedParam !== null && isVerifiedParam !== '') {
      query.isVerified = isVerifiedParam === 'true';
    }

    const total = await Interpretation.countDocuments(query);
    const interpretations = await Interpretation.find(query)
      .sort({ isVerified: 1, suraNumber: 1, interpretationNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      interpretations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching interpretations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interpretations' },
      { status: 500 }
    );
  }
}

// POST create new interpretation
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const interpretation = await Interpretation.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'Interpretation',
      contentId: interpretation._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: interpretation.toObject(),
    });

    return NextResponse.json(interpretation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating interpretation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create interpretation' },
      { status: 500 }
    );
  }
}
