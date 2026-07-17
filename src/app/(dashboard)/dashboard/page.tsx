import { redirect } from 'next/navigation';
import Link from 'next/link';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import StudyLog from '@/models/StudyLog';
import Revision from '@/models/Revision';
import Friendship from '@/models/Friendship';
import User from '@/models/User';
import { getSubjectColor } from '@/lib/color';
import LogCard from '@/components/LogCard';
import RevisionCard from '@/components/RevisionCard';
import AddLogModal from '@/components/AddLogModal';
import WeeklyBarChart from '@/components/WeeklyBarChart';
import { 
  Clock, 
  Flame, 
  Trophy, 
  CalendarDays,
  UserPlus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// STREAK CALCULATION
async function getStudyStreak(userId: mongoose.Types.ObjectId): Promise<number> {
  const logs = await StudyLog.find({ userId }).select('date').sort({ date: -1 });
  if (logs.length === 0) return 0;

  // Track unique days studied in YYYY-MM-DD format
  const uniqueDates = new Set(
    logs.map(log => {
      const d = new Date(log.date);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    })
  );

  const localNow = new Date();
  
  // Start checks in UTC representation of local days
  const getUtcString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getUtcString(localNow);
  
  const yesterday = new Date(localNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getUtcString(yesterday);

  // If no log today AND no log yesterday, streak is 0
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

export default async function DashboardPage() {
  await connectDB();
  const dbUser = await getOrCreateUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  const userId = dbUser._id;

  // 1. DATE CALCULATION
  const now = new Date();
  
  // Start of current week (Monday)
  const currentDay = now.getDay();
  const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Today's boundaries
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 2. STATISTICS CALCULATIONS
  // Fetch logs this week
  const logsThisWeek = await StudyLog.find({
    userId,
    date: { $gte: startOfWeek, $lte: endOfWeek }
  });
  const minutesThisWeek = logsThisWeek.reduce((sum, log) => sum + log.minutesStudied, 0);

  // Fetch logs this month
  const logsThisMonth = await StudyLog.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  const minutesThisMonth = logsThisMonth.reduce((sum, log) => sum + log.minutesStudied, 0);

  // Fetch streak
  const streak = await getStudyStreak(userId);

  // Fetch rank among friends
  const friendships = await Friendship.find({
    status: 'accepted',
    $or: [{ userId }, { friendId: userId }]
  });

  const friendIds = friendships.map(f => 
    f.userId.toString() === userId.toString() ? f.friendId : f.userId
  );
  
  const allLeaderboardIds = [userId, ...friendIds];

  // Fetch all logs this week for leaderboard
  const allLogsThisWeek = await StudyLog.find({
    userId: { $in: allLeaderboardIds },
    date: { $gte: startOfWeek, $lte: endOfWeek }
  });

  const minutesMap: { [uid: string]: number } = {};
  allLeaderboardIds.forEach(id => {
    minutesMap[id.toString()] = 0;
  });
  allLogsThisWeek.forEach(log => {
    const uid = log.userId.toString();
    if (minutesMap[uid] !== undefined) {
      minutesMap[uid] += log.minutesStudied;
    }
  });

  const leaderboardUsers = await User.find({ _id: { $in: allLeaderboardIds } }).select('_id username');
  
  const leaderboard = leaderboardUsers.map(u => ({
    userId: u._id.toString(),
    username: u.username,
    minutes: minutesMap[u._id.toString()] || 0
  })).sort((a, b) => b.minutes - a.minutes);

  const userRankIndex = leaderboard.findIndex(r => r.userId === userId.toString());
  const rank = userRankIndex === -1 ? 1 : userRankIndex + 1;

  // 3. TODAY'S LOGS
  const todaysLogs = await StudyLog.find({
    userId,
    date: { $gte: startOfToday, $lte: endOfToday }
  }).sort({ createdAt: -1 });

  // 4. REVISIONS DUE TODAY
  const revisionsDue = await Revision.find({
    userId,
    status: 'pending',
    dueDate: { $lte: endOfToday }
  }).populate({
    path: 'studyLogId',
    model: StudyLog
  }).sort({ dueDate: 1 });

  // 5. CHART DATA (Weekly subject hours)
  const subjectMap: { [subject: string]: number } = {};
  logsThisWeek.forEach(log => {
    const hrs = log.minutesStudied / 60;
    subjectMap[log.subject] = (subjectMap[log.subject] || 0) + hrs;
  });

  const chartData = Object.entries(subjectMap).map(([subject, hrs]) => ({
    subject,
    hours: parseFloat(hrs.toFixed(1)),
    fill: getSubjectColor(subject).hex
  }));

  return (
    <div className="space-y-8">
      {/* Top Welcome / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E2124] tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Welcome back, <span className="text-[#C9A15A] font-semibold">{dbUser.username}</span>! Here is your revision progress.
          </p>
        </div>
        <AddLogModal />
      </div>

      {/* Top Row: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Time This Week */}
        <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md flex items-center gap-4 hover:border-gray-800 transition-all">
          <div className="p-3 bg-[#C9A15A]/10 border border-[#C9A15A]/25 text-[#C9A15A] rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">This Week</p>
            <h3 className="text-2xl font-bold tracking-tight mt-0.5">
              {Math.floor(minutesThisWeek / 60)}h {minutesThisWeek % 60}m
            </h3>
          </div>
        </div>

        {/* Card 2: Time This Month */}
        <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md flex items-center gap-4 hover:border-gray-800 transition-all">
          <div className="p-3 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-xl">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">This Month</p>
            <h3 className="text-2xl font-bold tracking-tight mt-0.5">
              {Math.floor(minutesThisMonth / 60)}h {minutesThisMonth % 60}m
            </h3>
          </div>
        </div>

        {/* Card 3: Streak */}
        <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md flex items-center gap-4 hover:border-gray-800 transition-all">
          <div className="p-3 bg-orange-500/10 border border-orange-500/25 text-orange-500 rounded-xl">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Day Streak</p>
            <h3 className="text-2xl font-bold tracking-tight mt-0.5">
              {streak} {streak === 1 ? 'day' : 'days'}
            </h3>
          </div>
        </div>

        {/* Card 4: Friends Leaderboard Rank */}
        <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md flex items-center gap-4 hover:border-gray-800 transition-all">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Friend Rank</p>
            <h3 className="text-2xl font-bold tracking-tight mt-0.5">
              #{rank} <span className="text-xs font-normal text-gray-400">of {allLeaderboardIds.length}</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Dashboard Main): Logs list + chart */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Logs Card Grid */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1E2124] tracking-tight">
                Today&apos;s Study Sessions
              </h2>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {todaysLogs.length} logs
              </span>
            </div>

            {todaysLogs.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#F5F3EF]/50 rounded-xl border border-dashed border-gray-200">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#1E2124]">No logs entered today yet</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Keep your focus sharp! Use the button above to record your studied subjects.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {todaysLogs.map((log) => (
                  <LogCard key={log._id.toString()} log={JSON.parse(JSON.stringify(log))} />
                ))}
              </div>
            )}
          </div>

          {/* Weekly Bar Chart */}
          <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Weekly Subject Focus</h2>
                <p className="text-xs text-gray-400">Total hours spent on each subject this week</p>
              </div>
              <TrendingUp className="h-5 w-5 text-[#C9A15A]" />
            </div>
            <WeeklyBarChart data={chartData} />
          </div>

        </div>

        {/* Right Column: Revisions Panel & Leaderboard Preview */}
        <div className="space-y-8">
          
          {/* Revisions Due Panel */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#1E2124] tracking-tight">Revisions Due Today</h2>
                <p className="text-xs text-gray-500">Spaced repetition schedules due now</p>
              </div>
              <span className="bg-[#C9A15A]/10 text-[#C9A15A] text-xs font-bold px-2.5 py-1 rounded-full border border-[#C9A15A]/20">
                {revisionsDue.length} Due
              </span>
            </div>

            {revisionsDue.length === 0 ? (
              <div className="text-center py-8 bg-emerald-500/5 rounded-xl border border-dashed border-emerald-500/20 text-emerald-600 px-4">
                <p className="text-sm font-bold">All caught up!</p>
                <p className="text-xs text-emerald-600/80 mt-1">
                  You have no pending revisions due for today. Great work!
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {revisionsDue.map((rev) => (
                  <RevisionCard key={rev._id.toString()} revision={JSON.parse(JSON.stringify(rev))} />
                ))}
              </div>
            )}
            
            <Link 
              href="/revisions" 
              className="text-xs font-bold text-[#C9A15A] hover:text-[#B88F48] flex items-center justify-center gap-1 mt-2 transition-colors border-t border-gray-100 pt-3"
            >
              View Full Revision Calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Leaderboard Preview (Top 3-5) */}
          <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Leaderboard Preview</h2>
                <p className="text-xs text-gray-400">Top students by study hours this week</p>
              </div>
              <Trophy className="h-5 w-5 text-[#C9A15A]" />
            </div>

            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((row, idx) => {
                const isCurrentUser = row.userId === userId.toString();
                const hrs = Math.floor(row.minutes / 60);
                const mins = row.minutes % 60;
                
                return (
                  <div 
                    key={row.userId}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isCurrentUser 
                        ? 'bg-[#C9A15A]/15 border-[#C9A15A]/30 text-white' 
                        : 'bg-[#16181a] border-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black ${
                        idx === 0 ? 'text-[#C9A15A]' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold truncate max-w-[100px]">
                        {row.username} {isCurrentUser && <span className="text-[10px] text-[#C9A15A] font-normal">(You)</span>}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">
                      {hrs > 0 ? `${hrs}h ` : ''}{mins}m
                    </span>
                  </div>
                );
              })}

              {leaderboard.length <= 1 && (
                <div className="text-center py-6 px-2 bg-[#16181a] border border-dashed border-gray-800 rounded-xl">
                  <UserPlus className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-semibold">Studying alone?</p>
                  <Link 
                    href="/friends"
                    className="text-xs font-bold text-[#C9A15A] hover:text-[#B88F48] mt-1.5 inline-block underline"
                  >
                    Add friends to start competing
                  </Link>
                </div>
              )}
            </div>

            {leaderboard.length > 1 && (
              <Link 
                href="/friends" 
                className="text-xs font-bold text-[#C9A15A] hover:text-[#B88F48] flex items-center justify-center gap-1 mt-2 transition-colors border-t border-gray-800 pt-3"
              >
                View Full Standings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
