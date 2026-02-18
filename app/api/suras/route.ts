import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sura from '@/models/Sura';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// GET all suras
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const isVerifiedParam = searchParams.get('isVerified');

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { arabicName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isVerifiedParam !== null && isVerifiedParam !== '') {
      query.isVerified = isVerifiedParam === 'true';
    }

    const total = await Sura.countDocuments(query);
    const suras = await Sura.find(query)
      .sort({ isVerified: 1, suraNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      suras,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching suras:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suras' },
      { status: 500 }
    );
  }
}

// POST create new sura
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const sura = await Sura.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'Sura',
      contentId: sura._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: sura.toObject(),
    });

    return NextResponse.json(sura, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sura:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Sura number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create sura' },
      { status: 500 }
    );
  }
}
