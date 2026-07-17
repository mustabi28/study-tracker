import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import Friendship from '@/models/Friendship';
import User from '@/models/User';
import StudyLog from '@/models/StudyLog';
import FriendsDashboard from '@/components/FriendsDashboard';

export const metadata = {
  title: 'Friends & Leaderboards — Study Tracker',
  description: 'Connect with study partners, check revision logs, and compete on the weekly hours leaderboard.',
};

export default async function FriendsPage() {
  await connectDB();
  const dbUser = await getOrCreateUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  const userId = dbUser._id;

  // 1. FETCH FRIENDSHIPS
  // Populate both participants so we can easily show details on the client
  const friendships = await Friendship.find({
    $or: [{ userId }, { friendId: userId }]
  })
  .populate({ path: 'userId', model: User, select: 'username email privacy' })
  .populate({ path: 'friendId', model: User, select: 'username email privacy' });

  // 2. COMPUTE LEADERBOARD STANDINGS
  // Find all accepted friend IDs
  const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
  const acceptedFriendIds = acceptedFriendships.map(f => 
    f.userId._id.toString() === userId.toString() ? f.friendId._id : f.userId._id
  );

  const leaderboardIds = [userId, ...acceptedFriendIds];

  // Boundaries for current week (Monday-Sunday)
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Fetch all study logs for leaderboard participants this week
  const logsThisWeek = await StudyLog.find({
    userId: { $in: leaderboardIds },
    date: { $gte: startOfWeek, $lte: endOfWeek }
  });

  // Calculate minutes sum per user
  const minutesMap: { [uid: string]: number } = {};
  leaderboardIds.forEach(id => {
    minutesMap[id.toString()] = 0;
  });
  logsThisWeek.forEach(log => {
    const uidStr = log.userId.toString();
    if (minutesMap[uidStr] !== undefined) {
      minutesMap[uidStr] += log.minutesStudied;
    }
  });

  // Fetch usernames
  const participantUsers = await User.find({ _id: { $in: leaderboardIds } }).select('_id username');

  const leaderboard = participantUsers.map(u => ({
    userId: u._id.toString(),
    username: u.username,
    minutes: minutesMap[u._id.toString()] || 0
  })).sort((a, b) => b.minutes - a.minutes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E2124] tracking-tight">
          Social Hub
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Compete on weekly study hours with friends and view their progress logs.
        </p>
      </div>

      <FriendsDashboard 
        initialFriendships={JSON.parse(JSON.stringify(friendships))}
        currentUserId={userId.toString()}
        leaderboard={leaderboard}
      />
    </div>
  );
}
