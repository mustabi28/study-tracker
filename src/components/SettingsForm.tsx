'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Lock, 
  Globe, 
  Users, 
  EyeOff, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SettingsFormProps {
  initialUser: {
    username: string;
    email: string;
    privacy: 'public' | 'friends' | 'private';
  };
}

export default function SettingsForm({ initialUser }: SettingsFormProps) {
  const [username, setUsername] = useState(initialUser.username);
  const [privacy, setPrivacy] = useState(initialUser.privacy);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setFeedback({ text: '', type: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, privacy }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setFeedback({ text: data.message, type: 'success' });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({ text: err instanceof Error ? err.message : 'An error occurred', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-xl">
      {/* Feedback Alert */}
      {feedback.text && (
        <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-sm font-semibold ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Profile Settings Card */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-[#1E2124] tracking-tight border-b border-gray-100 pb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-[#C9A15A]" /> Profile Details
        </h2>

        {/* Email Read-Only */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            value={initialUser.email}
            disabled
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed font-medium"
          />
          <p className="text-[10px] text-gray-400 font-medium">Email login settings can be configured in your Clerk Account.</p>
        </div>

        {/* Username Editable */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#F5F3EF] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-[#1E2124] font-medium"
            placeholder="e.g. janesmith"
          />
          <p className="text-[10px] text-gray-400 font-medium">Use lowercase letters, numbers, and underscores only. Max 20 characters.</p>
        </div>
      </div>

      {/* Privacy Settings Card */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-[#1E2124] tracking-tight border-b border-gray-100 pb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#C9A15A]" /> Account Privacy
        </h2>

        {/* Privacy Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Privacy Mode</label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as 'public' | 'friends' | 'private')}
            className="w-full bg-[#F5F3EF] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-[#1E2124] font-medium cursor-pointer"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Explanatory Cards */}
        <div className="space-y-3 pt-2">
          {/* Public Explanation */}
          <div className={`p-4 rounded-xl border flex gap-3 items-start transition-all ${
            privacy === 'public' ? 'bg-[#C9A15A]/5 border-[#C9A15A]/30' : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <Globe className={`h-5 w-5 shrink-0 mt-0.5 ${privacy === 'public' ? 'text-[#C9A15A]' : 'text-gray-400'}`} />
            <div>
              <p className="text-xs font-bold text-[#1E2124]">Public Profile</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                Anyone can find your username and inspect your daily study logs. You are fully visible on the global and friends leaderboards.
              </p>
            </div>
          </div>

          {/* Friends Explanation */}
          <div className={`p-4 rounded-xl border flex gap-3 items-start transition-all ${
            privacy === 'friends' ? 'bg-[#C9A15A]/5 border-[#C9A15A]/30' : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <Users className={`h-5 w-5 shrink-0 mt-0.5 ${privacy === 'friends' ? 'text-[#C9A15A]' : 'text-gray-400'}`} />
            <div>
              <p className="text-xs font-bold text-[#1E2124]">Friends-Only Profile</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                Only users you have accepted as friends can view your study sessions and details. You still show up on the weekly leaderboard of accepted friends.
              </p>
            </div>
          </div>

          {/* Private Explanation */}
          <div className={`p-4 rounded-xl border flex gap-3 items-start transition-all ${
            privacy === 'private' ? 'bg-[#C9A15A]/5 border-[#C9A15A]/30' : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <EyeOff className={`h-5 w-5 shrink-0 mt-0.5 ${privacy === 'private' ? 'text-[#C9A15A]' : 'text-gray-400'}`} />
            <div>
              <p className="text-xs font-bold text-[#1E2124]">Private Profile</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                Your study logs are entirely hidden from all other users. You do not participate in or appear on any leaderboards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto bg-[#C9A15A] hover:bg-[#B88F48] disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-md shadow-[#C9A15A]/15 border border-[#C9A15A]/25 cursor-pointer text-center flex items-center justify-center gap-2"
      >
        {isLoading ? 'Saving Changes...' : 'Save All Settings'}
      </button>
    </form>
  );
}
