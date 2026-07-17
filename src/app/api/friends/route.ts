import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import User from '@/models/User';
import Friendship from '@/models/Friendship';

// GET: Fetch all friendships (accepted and pending) for the authenticated user
export async function GET() {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const friendships = await Friendship.find({
      $or: [{ userId: user._id }, { friendId: user._id }]
    })
    .populate('userId', 'username email privacy')
    .populate('friendId', 'username email privacy');

    return NextResponse.json(friendships);
  } catch (error: unknown) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Send a friend request by username
export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const targetUsername = username.trim().toLowerCase();

    // Prevent adding oneself
    if (targetUsername === user.username.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot add yourself as a friend' }, { status: 400 });
    }

    // Find the target user
    const targetUser = await User.findOne({ 
      username: { $regex: new RegExp(`^${targetUsername}$`, 'i') } 
    });

    if (!targetUser) {
      return NextResponse.json({ error: `User "${username}" not found` }, { status: 404 });
    }

    // Check if friendship record already exists in either direction
    const existingFriendship = await Friendship.findOne({
      $or: [
        { userId: user._id, friendId: targetUser._id },
        { userId: targetUser._id, friendId: user._id }
      ]
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'You are already friends with this user' }, { status: 400 });
      } else {
        // Status is pending
        if (existingFriendship.userId.toString() === user._id.toString()) {
          return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
        } else {
          // The other user sent a request first! Let's auto-accept it.
          existingFriendship.status = 'accepted';
          await existingFriendship.save();
          return NextResponse.json({ 
            success: true, 
            message: `You are now friends with ${targetUser.username}!`,
            friendship: existingFriendship 
          });
        }
      }
    }

    // Create a new pending friendship request
    const newFriendship = await Friendship.create({
      userId: user._id,
      friendId: targetUser._id,
      status: 'pending'
    });

    return NextResponse.json({ 
      success: true, 
      message: `Friend request sent to ${targetUser.username}`, 
      friendship: newFriendship 
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
