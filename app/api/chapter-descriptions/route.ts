import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChapterDescription from '@/models/ChapterDescription';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isVerifiedParam = searchParams.get('isVerified');
    const sortBy = searchParams.get('sortBy') || 'chapterNo';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { chapterNameMal: { $regex: search, $options: 'i' } },
        { chapterNameArabic: { $regex: search, $options: 'i' } },
        { chapterDesMal: { $regex: search, $options: 'i' } },
      ];
    }
    if (isVerifiedParam !== null && isVerifiedParam !== '') {
      query.isVerified = isVerifiedParam === 'true';
    }

    const sortObj: any = {};
    if (!isVerifiedParam) sortObj.isVerified = 1;
    sortObj[sortBy] = sortOrder;

    const total = await ChapterDescription.countDocuments(query);
    const descriptions = await ChapterDescription.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      descriptions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapter descriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const data = await request.json();
    const description = await ChapterDescription.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });
    await createAuditLog({
      contentType: 'ChapterDescription',
      contentId: description._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: description.toObject(),
    });
    return NextResponse.json(description, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: 'ID already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message || 'Failed to create chapter description' }, { status: 500 });
  }
}
