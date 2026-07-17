import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import Revision from '@/models/Revision';
import StudyLog from '@/models/StudyLog'; // Register model schema
import RevisionsList from '@/components/RevisionsList';

export const metadata = {
  title: 'Revision Calendar — Study Tracker',
  description: 'Manage and review all your scheduled retrospective study revisions.',
};

export default async function RevisionsPage() {
  await connectDB();
  const dbUser = await getOrCreateUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch all revisions for the logged-in user, populated with details
  const revisions = await Revision.find({ userId: dbUser._id })
    .populate({
      path: 'studyLogId',
      model: StudyLog
    })
    .sort({ dueDate: 1, createdAt: -1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E2124] tracking-tight">
          Revision Calendar
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Track and execute scheduled spaced repetition reviews on a +7 day and +14 day timeline.
        </p>
      </div>

      <RevisionsList initialRevisions={JSON.parse(JSON.stringify(revisions))} />
    </div>
  );
}
