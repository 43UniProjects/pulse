import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { nextCookies } from 'better-auth/next-js';
import mongoose from 'mongoose';
import { connectToDatabase } from '../db/connect';
import { sendVerificationEmail } from '../mail';

await connectToDatabase();

const client = mongoose.connection.getClient();
const db = mongoose.connection.db;

if (!db) {
  throw new Error('Database connection not established');
}

export const auth = betterAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database: mongodbAdapter(db as any, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: client as any,
    usePlural: true,
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set('callbackURL', '/login?verified=true');

      try {
        await sendVerificationEmail({
          to: user.email,
          name: user.name || 'there',
          url: verificationUrl.toString(),
        });
        console.log(`[Auth] Verification email sent to: ${user.email}`);
      } catch (error) {
        console.error('[Auth] Failed to send verification email:', error);
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'donor',
      },
      isActive: {
        type: 'boolean',
        required: true,
        defaultValue: false,
      },
    },
  },
});
