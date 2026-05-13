import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: 'Invalid target user ID' }, { status: 400 });
    }

    if (session.user.id === targetUserId) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
    }

    await connectDB();

    const currentUser = await User.findById(session.user.id);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(session.user.id, {
        $pull: { following: targetUserId }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: session.user.id }
      });
      return NextResponse.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { following: targetUserId }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: session.user.id }
      });
      return NextResponse.json({ message: 'Followed successfully', isFollowing: true });
    }

  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
