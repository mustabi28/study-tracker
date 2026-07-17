import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function getOrCreateUser() {
  await connectDB();
  
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  let dbUser = await User.findOne({ clerkId: clerkUser.id });
  
  if (!dbUser) {
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    let username = clerkUser.username || '';
    
    if (!username) {
      const emailPrefix = email.split('@')[0] || 'user';
      username = emailPrefix;
    }
    
    // Sanitize username: lowercase, letters, numbers, and underscores only
    username = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (username.length < 3) {
      username = `user_${clerkUser.id.substring(5, 10)}`;
    }

    // Check for username collision
    let count = 0;
    let finalUsername = username;
    while (await User.findOne({ username: finalUsername })) {
      count++;
      finalUsername = `${username}_${count}`;
    }

    dbUser = await User.create({
      clerkId: clerkUser.id,
      email,
      username: finalUsername,
      privacy: 'public',
      createdAt: new Date()
    });
  }

  return dbUser;
}
