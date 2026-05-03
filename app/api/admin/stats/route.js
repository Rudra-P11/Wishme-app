import dbConnect from '@/lib/db';
import Template from '@/models/Template';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const [totalTemplates, premiumTemplates, totalUsers, premiumUsers, recentTemplates] =
      await Promise.all([
        Template.countDocuments(),
        Template.countDocuments({ isPremium: true }),
        User.countDocuments(),
        User.countDocuments({ isPremium: true }),
        Template.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    return Response.json({
      totalTemplates,
      premiumTemplates,
      totalUsers,
      premiumUsers,
      recentTemplates,
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
