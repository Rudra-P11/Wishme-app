import dbConnect from '@/lib/db';
import Template from '@/models/Template';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }
    if (isPremium !== null && isPremium !== undefined) {
      query.isPremium = isPremium === 'true';
    }

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      Template.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments(query),
    ]);

    return Response.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/templates error:', error);
    return Response.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const template = await Template.create(body);

    return Response.json({ template }, { status: 201 });
  } catch (error) {
    console.error('POST /api/templates error:', error);
    return Response.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
