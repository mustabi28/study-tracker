import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import Friendship from '@/models/Friendship';

// PATCH: Accept a friend request
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (status !== 'accepted') {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
    }

    // A user can only accept requests sent TO them (where they are the friendId)
    const friendship = await Friendship.findOneAndUpdate(
      { _id: id, friendId: user._id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!friendship) {
      return NextResponse.json({ error: 'Pending friend request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Friend request accepted', friendship });
  } catch (error: unknown) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove friendship, cancel sent request, or reject received request
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // A user can delete a friendship only if they are one of the participants
    const deleted = await Friendship.findOneAndDelete({
      _id: id,
      $or: [{ userId: user._id }, { friendId: user._id }]
    });

    if (!deleted) {
      return NextResponse.json({ error: 'Friendship record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Friendship record removed' });
  } catch (error: unknown) {
    console.error('Error removing friendship:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
