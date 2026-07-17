import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import StudyLog from '@/models/StudyLog';
import StatsDashboard from '@/components/StatsDashboard';
import mongoose from 'mongoose';

export const metadata = {
  title: 'Detailed Statistics — Study Tracker',
  description: 'Analyze your study habits, streaks, and subject hour distribution.',
};

// Internal streak helper
async function getStudyStreak(userId: mongoose.Types.ObjectId): Promise<number> {
  const logs = await StudyLog.find({ userId }).select('date').sort({ date: -1 });
  if (logs.length === 0) return 0;

  const uniqueDates = new Set(
    logs.map(log => {
      const d = new Date(log.date);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    })
  );

  const localNow = new Date();
  const getUtcString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getUtcString(localNow);
  
  const yesterday = new Date(localNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getUtcString(yesterday);

  if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  const currentDate = uniqueDates.has(todayStr) ? new Date(localNow) : yesterday;

  while (true) {
    const dateStr = getUtcString(currentDate);
    if (uniqueDates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export default async function StatisticsPage() {
  await connectDB();
  const dbUser = await getOrCreateUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch all logs for the current user to analyze
  const logs = await StudyLog.find({ userId: dbUser._id }).sort({ date: -1, createdAt: -1 });
  const streak = await getStudyStreak(dbUser._id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E2124] tracking-tight">
          Performance Statistics
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          A deep dive into your study sessions, focus distribution, and consistency.
        </p>
      </div>

      <StatsDashboard 
        logs={JSON.parse(JSON.stringify(logs))} 
        streak={streak} 
      />
    </div>
  );
}
