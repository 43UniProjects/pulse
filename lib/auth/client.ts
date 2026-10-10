import { createAuthClient } from 'better-auth/react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { auth } from './config';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    }),
  ],
});
