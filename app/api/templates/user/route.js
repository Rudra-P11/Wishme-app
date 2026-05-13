import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Template from '@/models/Template';

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || !session.user.isCreator) {
      return NextResponse.json({ error: 'Unauthorized. Must be a creator.' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    
    // Force community fields
    body.isCommunity = true;
    body.creatorId = session.user.id;
    body.creatorName = session.user.name;
    body.isActive = true;

    const template = await Template.create(body);

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating user template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
