import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import StudyLog from '@/models/StudyLog';
import Revision from '@/models/Revision';

// GET: Fetch all study logs for the authenticated user
export async function GET() {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await StudyLog.find({ userId: user._id })
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json(logs);
  } catch (error: unknown) {
    console.error('Error fetching study logs:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new study log and auto-schedule +7 & +14 day revisions
export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { date, subject, chapter, lesson, minutesStudied, notes } = body;

    if (!date || !subject || !chapter || !lesson || !minutesStudied) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const logDate = new Date(date);

    // Create the study log
    const newLog = await StudyLog.create({
      userId: user._id,
      date: logDate,
      subject: subject.trim(),
      chapter: chapter.trim(),
      lesson: lesson.trim(),
      minutesStudied: Number(minutesStudied),
      notes: notes?.trim() || '',
    });

    // Calculate revision dates
    const revision7Date = new Date(logDate);
    revision7Date.setDate(revision7Date.getDate() + 7);

    const revision14Date = new Date(logDate);
    revision14Date.setDate(revision14Date.getDate() + 14);

    // Create the revision entries
    await Revision.create([
      {
        userId: user._id,
        studyLogId: newLog._id,
        dueDate: revision7Date,
        interval: 7,
        status: 'pending'
      },
      {
        userId: user._id,
        studyLogId: newLog._id,
        dueDate: revision14Date,
        interval: 14,
        status: 'pending'
      }
    ]);

    return NextResponse.json(newLog, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating study log:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
