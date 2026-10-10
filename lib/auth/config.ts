import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import mongoose from 'mongoose';
import { connectToDatabase } from '../db/connect';
import { USER_ROLE } from '@/types/user.type';
import { nextCookies } from 'better-auth/next-js';

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
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: Replace with Resend/Nodemailer in production
      console.log(
        `\n📧 [PULSE DEV EMAIL] Verification required for ${user.email}`,
      );
      console.log(`🔗 Click here to verify: ${url}\n`);
    },
  },
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: USER_ROLE[1], // 'donor'
      },
      isActive: {
        type: 'boolean',
        required: true,
        defaultValue: false,
      },
    },
  },
});
