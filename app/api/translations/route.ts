import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET all translations
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const suraNumber = searchParams.get('suraNumber');
    const language = searchParams.get('language');

    const query: any = {};
    if (suraNumber) query.suraNumber = parseInt(suraNumber);
    if (language) query.language = language;

    const total = await Translation.countDocuments(query);
    const translations = await Translation.find(query)
      .sort({ suraNumber: 1, ayaRangeStart: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      translations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

// POST create new translation
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const translation = await Translation.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'Translation',
      contentId: translation._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: translation.toObject(),
    });

    return NextResponse.json(translation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating translation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create translation' },
      { status: 500 }
    );
  }
}
