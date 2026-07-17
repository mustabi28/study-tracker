import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import StudyLog from '@/models/StudyLog';
import Revision from '@/models/Revision';

// PUT: Update a specific study log and its pending revisions
export async function PUT(
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
    const { date, subject, chapter, lesson, minutesStudied, notes } = body;

    // Check ownership
    const existingLog = await StudyLog.findOne({ _id: id, userId: user._id });
    if (!existingLog) {
      return NextResponse.json({ error: 'Study log not found' }, { status: 404 });
    }

    const oldDateStr = existingLog.date.toISOString().split('T')[0];
    const newDateStr = new Date(date).toISOString().split('T')[0];
    const dateChanged = oldDateStr !== newDateStr;

    // Update study log
    existingLog.date = new Date(date);
    existingLog.subject = subject.trim();
    existingLog.chapter = chapter.trim();
    existingLog.lesson = lesson.trim();
    existingLog.minutesStudied = Number(minutesStudied);
    existingLog.notes = notes?.trim() || '';
    
    await existingLog.save();

    // If date changed, update associated pending revisions
    if (dateChanged) {
      const newLogDate = new Date(date);
      
      const revision7Date = new Date(newLogDate);
      revision7Date.setDate(revision7Date.getDate() + 7);

      const revision14Date = new Date(newLogDate);
      revision14Date.setDate(revision14Date.getDate() + 14);

      // Update +7 day revision if pending
      await Revision.updateOne(
        { studyLogId: existingLog._id, interval: 7, status: 'pending' },
        { dueDate: revision7Date }
      );

      // Update +14 day revision if pending
      await Revision.updateOne(
        { studyLogId: existingLog._id, interval: 14, status: 'pending' },
        { dueDate: revision14Date }
      );
    }

    return NextResponse.json(existingLog);
  } catch (error: unknown) {
    console.error('Error updating study log:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a specific study log and all associated revisions
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

    // Check ownership and delete log
    const deletedLog = await StudyLog.findOneAndDelete({ _id: id, userId: user._id });
    if (!deletedLog) {
      return NextResponse.json({ error: 'Study log not found' }, { status: 404 });
    }

    // Delete associated revisions
    await Revision.deleteMany({ studyLogId: id });

    return NextResponse.json({ success: true, message: 'Study log and associated revisions deleted' });
  } catch (error: unknown) {
    console.error('Error deleting study log:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
