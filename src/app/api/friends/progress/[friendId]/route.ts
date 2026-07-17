import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import User from '@/models/User';
import Friendship from '@/models/Friendship';
import StudyLog from '@/models/StudyLog';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    await connectDB();
    const currentUser = await getOrCreateUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized', allowed: false }, { status: 401 });
    }

    const { friendId } = await params;

    // Fetch the target friend user
    const friend = await User.findById(friendId).select('username email privacy');
    if (!friend) {
      return NextResponse.json({ error: 'User not found', allowed: false }, { status: 404 });
    }

    // Self-access is always allowed
    if (friend._id.toString() === currentUser._id.toString()) {
      const logs = await StudyLog.find({ userId: friend._id }).sort({ date: -1 });
      return NextResponse.json({ allowed: true, username: friend.username, logs });
    }

    // 1. Private: Nobody can see
    if (friend.privacy === 'private') {
      return NextResponse.json({ 
        error: `"${friend.username}" has set their profile to private.`, 
        allowed: false 
      });
    }

    // Check friendship status
    const friendship = await Friendship.findOne({
      $or: [
        { userId: currentUser._id, friendId: friend._id },
        { userId: friend._id, friendId: currentUser._id }
      ]
    });

    const isAcceptedFriend = friendship && friendship.status === 'accepted';

    // 2. Friends-Only: Must be accepted friends
    if (friend.privacy === 'friends' && !isAcceptedFriend) {
      return NextResponse.json({ 
        error: `"${friend.username}" only shares progress with accepted friends.`, 
        allowed: false 
      });
    }

    // 3. Public: Anyone can see (or if accepted friends)
    const logs = await StudyLog.find({ userId: friend._id })
      .sort({ date: -1 })
      .select('date subject chapter lesson minutesStudied notes');

    return NextResponse.json({ 
      allowed: true, 
      username: friend.username,
      logs 
    });

  } catch (error: unknown) {
    console.error('Error fetching friend progress:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error', allowed: false }, { status: 500 });
  }
}
