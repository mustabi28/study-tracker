import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import StudyLog from '@/models/StudyLog';
import Revision from '@/models/Revision';
import Friendship from '@/models/Friendship';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is missing');
    return new Response('Webhook Secret is missing in environment variables', {
      status: 500
    });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON payload', { status: 400 });
  }

  const body = JSON.stringify(payload);

  // Create a new Svix instance with the secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Verification failed', {
      status: 400
    });
  }

  // Handle the webhook event
  await connectDB();
  const eventType = evt.type;

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, username: clerkUsername } = evt.data;
      const email = email_addresses?.[0]?.email_address || '';
      
      const existingUser = await User.findOne({ clerkId: id });
      if (!existingUser) {
        let username = clerkUsername || email.split('@')[0] || `user_${id.substring(5, 10)}`;
        username = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        let finalUsername = username;
        let count = 0;
        while (await User.findOne({ username: finalUsername })) {
          count++;
          finalUsername = `${username}_${count}`;
        }

        await User.create({
          clerkId: id,
          email,
          username: finalUsername,
          privacy: 'public',
          createdAt: new Date(),
        });
      }
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, username: clerkUsername } = evt.data;
      const email = email_addresses?.[0]?.email_address || '';
      
      let username = clerkUsername || email.split('@')[0] || 'user';
      username = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        existingUser.email = email;
        
        // Ensure username is unique if updated to a conflicting username
        let finalUsername = username;
        let count = 0;
        while (await User.findOne({ username: finalUsername, clerkId: { $ne: id } })) {
          count++;
          finalUsername = `${username}_${count}`;
        }
        existingUser.username = finalUsername;
        await existingUser.save();
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      const user = await User.findOne({ clerkId: id });
      if (user) {
        // Cascade delete all records associated with user
        await StudyLog.deleteMany({ userId: user._id });
        await Revision.deleteMany({ userId: user._id });
        await Friendship.deleteMany({ $or: [{ userId: user._id }, { friendId: user._id }] });
        await User.deleteOne({ _id: user._id });
      }
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error handling webhook DB operations:', error);
    return new Response('Database operation error', { status: 500 });
  }
}
