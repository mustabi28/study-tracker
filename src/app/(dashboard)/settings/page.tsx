import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import { getOrCreateUser } from '@/lib/syncUser';
import SettingsForm from '@/components/SettingsForm';

export const metadata = {
  title: 'Profile Settings — Study Tracker',
  description: 'Manage your study tracker username, email login credentials, and account privacy options.',
};

export default async function SettingsPage() {
  await connectDB();
  const dbUser = await getOrCreateUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  const initialUser = {
    username: dbUser.username,
    email: dbUser.email,
    privacy: dbUser.privacy,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E2124] tracking-tight">
          Profile Settings
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Update your public profile handle and manage visibility permissions.
        </p>
      </div>

      <SettingsForm initialUser={initialUser} />
    </div>
  );
}
