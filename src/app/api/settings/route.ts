import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import User from '@/models/User';

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { username, privacy } = body;

    // Handle Username Update
    if (username !== undefined) {
      const sanitizedUsername = username.trim().toLowerCase();
      
      // Basic validations
      if (/[^a-z0-9_]/.test(sanitizedUsername)) {
        return NextResponse.json({ 
          error: 'Username can only contain lowercase letters, numbers, and underscores.' 
        }, { status: 400 });
      }

      if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
        return NextResponse.json({ 
          error: 'Username must be between 3 and 20 characters long.' 
        }, { status: 400 });
      }

      // Check if username is already taken by another user
      const existing = await User.findOne({ 
        username: sanitizedUsername, 
        clerkId: { $ne: user.clerkId } 
      });
      if (existing) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 });
      }

      user.username = sanitizedUsername;
    }

    // Handle Privacy Update
    if (privacy !== undefined) {
      if (!['public', 'friends', 'private'].includes(privacy)) {
        return NextResponse.json({ error: 'Invalid privacy setting.' }, { status: 400 });
      }
      user.privacy = privacy;
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile settings updated successfully.',
      user: {
        username: user.username,
        privacy: user.privacy
      }
    });

  } catch (error: unknown) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
