import dbConnect from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return Response.json({ users });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const { userId, updates } = await request.json();
    const allowed = ['role', 'isPremium'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }
    const user = await User.findByIdAndUpdate(userId, safeUpdates, { new: true }).lean();
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    return Response.json({ user });
  } catch (error) {
    console.error('PUT /api/admin/users error:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
