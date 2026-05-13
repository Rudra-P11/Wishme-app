import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isCreator = true;
    await user.save();

    return NextResponse.json({ success: true, message: 'Upgraded to creator' });
  } catch (error) {
    console.error('Error upgrading creator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
