import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Template from '@/models/Template';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const user = await User.findById(id).select('name image isPremium isCreator followers following').lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch templates created by this user
    const templates = await Template.find({ creatorId: id, isCommunity: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      profile: {
        id: user._id.toString(),
        name: user.name,
        image: user.image,
        isPremium: user.isPremium,
        isCreator: user.isCreator,
        followerCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
      },
      templates
    });

  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
