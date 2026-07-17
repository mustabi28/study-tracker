import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import Revision from '@/models/Revision';
import StudyLog from '@/models/StudyLog'; // Required to register StudyLog schema for populate

// GET: Fetch revisions
export async function GET(req: Request) {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dueTodayOnly = searchParams.get('dueToday') === 'true';

    const query: { userId: typeof user._id; status?: string; dueDate?: { $lte: Date } } = { userId: user._id };

    if (dueTodayOnly) {
      // Revisions due up to the end of today (including overdue ones)
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      query.status = 'pending';
      query.dueDate = { $lte: endOfToday };
    }

    const revisions = await Revision.find(query)
      .populate({
        path: 'studyLogId',
        model: StudyLog
      })
      .sort({ dueDate: 1, createdAt: -1 });

    return NextResponse.json(revisions);
  } catch (error: unknown) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update the status of a specific revision (done or skipped)
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { revisionId, status } = body;

    if (!revisionId || !['pending', 'done', 'skipped'].includes(status)) {
      return NextResponse.json({ error: 'Invalid revisionId or status' }, { status: 400 });
    }

    // Verify ownership and update
    const updatedRevision = await Revision.findOneAndUpdate(
      { _id: revisionId, userId: user._id },
      { status },
      { new: true }
    );

    if (!updatedRevision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRevision);
  } catch (error: unknown) {
    console.error('Error updating revision status:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
