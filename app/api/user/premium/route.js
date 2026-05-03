import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Toggle premium status (mock — no real payment)
    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    user.isPremium = !user.isPremium;
    await user.save();

    return Response.json({
      success: true,
      isPremium: user.isPremium,
      message: user.isPremium
        ? 'Upgraded to Pro successfully!'
        : 'Downgraded to Free.',
    });
  } catch (error) {
    console.error('POST /api/user/premium error:', error);
    return Response.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
