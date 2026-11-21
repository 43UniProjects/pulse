import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { nextCookies } from 'better-auth/next-js';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/mail';

const SELF_REGISTER_ROLES = ['donor', 'hospital'] as const;

let client: unknown = {};
let db: unknown = {};

if (process.env.NEXT_PHASE !== 'phase-production-build') {
  await connectToDatabase();
  client = mongoose.connection.getClient();
  db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection not established');
  }
}

const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database: mongodbAdapter(db as any, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: client as any,
    usePlural: true,
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  trustedOrigins: [
    ...(process.env.NEXT_PUBLIC_APP_URL
      ? [process.env.NEXT_PUBLIC_APP_URL]
      : []),
    ...(!isProduction
      ? [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3002',
        ]
      : []),
  ],
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const requestedRole =
            typeof user.role === 'string' ? user.role : 'donor';
          if (
            !SELF_REGISTER_ROLES.includes(
              requestedRole as (typeof SELF_REGISTER_ROLES)[number],
            )
          ) {
            return false;
          }

          return {
            data: {
              ...user,
              role: requestedRole,
              isActive: false,
            },
          };
        },
      },
      update: {
        before: async (user, context) => {
          if (!context) {
            return { data: user };
          }

          // Block client-initiated role or activation tampering via Better Auth update endpoints
          const sanitized = { ...user };
          delete sanitized.role;
          delete sanitized.isActive;
          return { data: sanitized };
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'donor',
        validator: {
          input: z.enum(SELF_REGISTER_ROLES),
        },
      },
      isActive: {
        type: 'boolean',
        required: true,
        defaultValue: false,
        input: false,
      },
    },
  },
});
