import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TajweedRule from '@/models/TajweedRule';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isVerifiedParam = searchParams.get('isVerified');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isVerifiedParam !== null && isVerifiedParam !== '') {
      query.isVerified = isVerifiedParam === 'true';
    }

    const sortObj: any = {};
    if (!isVerifiedParam) sortObj.isVerified = 1;
    sortObj[sortBy] = sortOrder;

    const total = await TajweedRule.countDocuments(query);
    const rules = await TajweedRule.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      rules,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tajweed rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const data = await request.json();
    const rule = await TajweedRule.create({
      ...data,
      createdBy: session.loginCode,
      createdByRole: session.role,
    });

    await createAuditLog({
      contentType: 'TajweedRule',
      contentId: rule._id.toString(),
      action: 'create',
      performedBy: session.loginCode,
      role: session.role,
      newData: rule.toObject(),
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create tajweed rule';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
