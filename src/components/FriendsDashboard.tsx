'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSubjectColor } from '@/lib/color';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Clock, 
  Trophy, 
  Calendar,
  BookOpen,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserDetail {
  _id: string;
  username: string;
  email: string;
  privacy: 'public' | 'friends' | 'private';
}

interface Friendship {
  _id: string;
  userId: UserDetail;
  friendId: UserDetail;
  status: 'pending' | 'accepted';
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  minutes: number;
}

interface StudyLogDetail {
  _id: string;
  subject: string;
  chapter: string;
  lesson: string;
  minutesStudied: number;
  date: string | Date;
  notes?: string;
}

interface FriendsDashboardProps {
  initialFriendships: Friendship[];
  currentUserId: string;
  leaderboard: LeaderboardEntry[];
}

export default function FriendsDashboard({ 
  initialFriendships, 
  currentUserId,
  leaderboard 
}: FriendsDashboardProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Viewing friend progress state
  const [selectedFriend, setSelectedFriend] = useState<UserDetail | null>(null);
  const [friendLogs, setFriendLogs] = useState<StudyLogDetail[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  const router = useRouter();

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setIsSending(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send friend request');
      }

      setMessage({ text: data.message, type: 'success' });
      setUsernameInput('');
      router.refresh();
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'An error occurred', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!res.ok) throw new Error('Failed to accept request');
      router.refresh();
    } catch {
      alert('Failed to accept friend request');
    }
  };

  const handleRemoveFriendship = async (friendshipId: string, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete friendship record');
      router.refresh();
    } catch {
      alert('Failed to remove record');
    }
  };

  const handleViewProgress = async (friend: UserDetail) => {
    setSelectedFriend(friend);
    setLogsLoading(true);
    setLogsError('');
    setFriendLogs([]);

    try {
      const res = await fetch(`/api/friends/progress/${friend._id}`);
      const data = await res.json();

      if (!data.allowed) {
        setLogsError(data.error || 'Access denied due to privacy settings.');
      } else {
        setFriendLogs(data.logs || []);
      }
    } catch {
      setLogsError('Failed to fetch user logs.');
    } finally {
      setLogsLoading(false);
    }
  };

  // Categorize friendships
  const incomingRequests: Friendship[] = [];
  const sentRequests: Friendship[] = [];
  const activeFriends: Friendship[] = [];

  initialFriendships.forEach((f) => {
    if (f.status === 'accepted') {
      activeFriends.push(f);
    } else {
      if (f.friendId._id === currentUserId) {
        incomingRequests.push(f);
      } else {
        sentRequests.push(f);
      }
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns: Friend Request and List */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Add Friend Form */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-[#1E2124] tracking-tight">Add a Friend</h2>
          <form onSubmit={handleSendRequest} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter username..."
              required
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-1 bg-[#F5F3EF] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A15A] text-[#1E2124] placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={isSending}
              className="bg-[#C9A15A] hover:bg-[#B88F48] disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-[#C9A15A]/15 flex items-center gap-1.5 cursor-pointer border border-[#C9A15A]/25 whitespace-nowrap"
            >
              {isSending ? 'Sending...' : <><UserPlus className="h-4 w-4" /> Send Invite</>}
            </button>
          </form>
          {message.text && (
            <div className={`p-3 text-xs rounded-xl font-medium border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {(incomingRequests.length > 0 || sentRequests.length > 0) && (
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#1E2124] tracking-tight border-b border-gray-100 pb-4">
              Pending Invites
            </h2>

            {/* Incoming Requests */}
            {incomingRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Incoming Requests</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {incomingRequests.map((f) => (
                    <div key={f._id} className="bg-[#F5F3EF] p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1E2124]">{f.userId.username}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(f._id)}
                          className="bg-[#C9A15A] hover:bg-[#B88F48] text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Accept request"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFriendship(f._id, 'Decline this friend request?')}
                          className="bg-transparent hover:bg-rose-500/10 border border-gray-300 hover:border-rose-500/30 text-gray-400 hover:text-rose-500 p-1.5 rounded-lg transition-all"
                          title="Decline request"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sent Invites</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sentRequests.map((f) => (
                    <div key={f._id} className="bg-[#F5F3EF]/60 p-4 rounded-xl border border-gray-200/60 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1E2124] opacity-75">{f.friendId.username}</span>
                      <button
                        onClick={() => handleRemoveFriendship(f._id, 'Cancel this friend request?')}
                        className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                        title="Cancel request"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Friends List */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-[#1E2124] tracking-tight">Active Friends</h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {activeFriends.length} friends
            </span>
          </div>

          {activeFriends.length === 0 ? (
            <div className="text-center py-12 bg-[#F5F3EF]/50 rounded-xl border border-dashed border-gray-200">
              <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#1E2124]">No friends added yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Search usernames above to connect, check progress, and compete on the weekly leaderboard!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeFriends.map((f) => {
                const friend = f.userId._id === currentUserId ? f.friendId : f.userId;
                return (
                  <div key={f._id} className="bg-[#1E2124] text-white p-5 rounded-2xl border border-[#2d3135] flex items-center justify-between shadow-md">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold tracking-wide">{friend.username}</h4>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                        <Lock className="h-3 w-3 text-gray-500" /> Privacy: {friend.privacy}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProgress(friend)}
                        className="bg-[#C9A15A]/10 hover:bg-[#C9A15A] border border-[#C9A15A]/20 hover:border-transparent text-[#C9A15A] hover:text-white p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
                        title="View progress log"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFriendship(f._id, `Remove "${friend.username}" from your friends list?`)}
                        className="bg-transparent hover:bg-rose-500/10 border border-gray-800 hover:border-rose-500/30 text-gray-400 hover:text-rose-500 p-2 rounded-xl transition-all"
                        title="Remove friend"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Weekly Leaderboard */}
      <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md space-y-6 self-start">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Weekly Leaderboard</h2>
            <p className="text-xs text-gray-400">Total study times this week (Monday-Sunday)</p>
          </div>
          <Trophy className="h-5 w-5 text-[#C9A15A]" />
        </div>

        <div className="space-y-3">
          {leaderboard.map((row, idx) => {
            const isCurrentUser = row.userId === currentUserId;
            const hrs = Math.floor(row.minutes / 60);
            const mins = row.minutes % 60;
            
            return (
              <div 
                key={row.userId}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isCurrentUser 
                    ? 'bg-[#C9A15A]/15 border-[#C9A15A]/30 text-white font-semibold' 
                    : 'bg-[#16181a] border-gray-800 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${
                    idx === 0 ? 'text-[#C9A15A]' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold truncate max-w-[130px]">
                    {row.username} {isCurrentUser && <span className="text-[10px] text-[#C9A15A] font-normal">(You)</span>}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400">
                  {hrs > 0 ? `${hrs}h ` : ''}{mins}m
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Friend Progress Modal Hook */}
      <AnimatePresence>
        {selectedFriend && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFriend(null)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="bg-[#1E2124] text-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#C9A15A]" />
                    <h2 className="text-xl font-bold tracking-wide">
                      {selectedFriend.username}&apos;s Progress
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedFriend(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {logsLoading && (
                    <div className="py-20 flex justify-center items-center gap-2 text-gray-400">
                      <Loader2 className="h-6 w-6 animate-spin text-[#C9A15A]" />
                      <span className="text-sm font-semibold">Loading logs...</span>
                    </div>
                  )}

                  {logsError && (
                    <div className="py-12 text-center text-rose-400 space-y-2">
                      <AlertCircle className="h-10 w-10 mx-auto opacity-75" />
                      <p className="text-sm font-semibold">Access Restrained</p>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                        {logsError}
                      </p>
                    </div>
                  )}

                  {!logsLoading && !logsError && (
                    <>
                      {friendLogs.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          <p className="font-semibold text-sm">No study logs registered yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs text-gray-400 border-b border-gray-800 pb-2">
                            <span>Total logs: {friendLogs.length}</span>
                            <span>Total hours: {Math.round(friendLogs.reduce((s, l) => s + l.minutesStudied, 0) / 60)}h</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {friendLogs.map((log) => {
                              const color = getSubjectColor(log.subject);
                              const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              });
                              
                              return (
                                <div 
                                  key={log._id}
                                  className={`bg-[#16181a] p-4 rounded-xl border-l-4 ${color.border} border-y border-r border-gray-800/40 relative flex flex-col justify-between`}
                                >
                                  <div>
                                    <div className="flex justify-between items-start mb-1">
                                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${color.bg} ${color.text} border ${color.border}/10`}>
                                        {log.subject}
                                      </span>
                                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {formattedDate}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-bold flex items-center gap-1.5 mt-1.5">
                                      <BookOpen className="h-3.5 w-3.5 text-[#C9A15A]" /> {log.chapter}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 pl-5">{log.lesson}</p>
                                    
                                    {log.notes && (
                                      <p className="text-[10px] text-gray-500 font-normal italic pl-5 mt-1 border-l border-gray-800 truncate">
                                        &ldquo;{log.notes}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-300 border-t border-gray-800/30 pt-2 mt-3">
                                    <Clock className="h-3.5 w-3.5 text-[#C9A15A]" />
                                    <span>{log.minutesStudied} minutes</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-end">
                  <button
                    onClick={() => setSelectedFriend(null)}
                    className="px-5 py-2 bg-transparent hover:bg-white/5 border border-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
