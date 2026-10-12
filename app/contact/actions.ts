'use server';

import { headers } from 'next/headers';
import { saveContactMessage } from './data';
import { contactSchema } from './schema';
import { auth } from '@/lib/auth/config';

export interface ContactActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function submitContactMessage(
  _prevState: ContactActionState | null,
  formData: FormData,
): Promise<ContactActionState> {
  const rawData = Object.fromEntries(formData.entries());

  // 1. Secure Session Retrieval via Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  // 2. Client Payload Validation
  const validation = contactSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    });
    return { fieldErrors, error: 'Please fix the errors in the form.' };
  }

  try {
    const contactPayload: Record<string, unknown> = {
      subject: validation.data.subject,
      message: validation.data.message,
      status: 'pending',
    };

    if (user) {
      // Authenticated User: Override form inputs with trusted session data
      contactPayload.userId = user.id;
      contactPayload.name = user.name || validation.data.name;
      contactPayload.email = user.email || validation.data.email;

      const userRole = (user as { role?: string }).role || 'donor';
      contactPayload.senderRole = userRole;

      // Target Audience Routing Map based on User Role
      const roleTargetMap: Record<string, string> = {
        admin: 'developer',
        donor: 'admin',
        hospital: 'admin',
      };

      contactPayload.targetAudience =
        roleTargetMap[userRole.toLowerCase()] || 'developer';
    } else {
      // Guest User: Use validated form data directly
      contactPayload.userId = null;
      contactPayload.name = validation.data.name;
      contactPayload.email = validation.data.email;
      contactPayload.senderRole = 'guest';
      contactPayload.targetAudience = validation.data.targetAudience;
    }

    // 3. Database Operation
    await saveContactMessage(contactPayload);

    return { success: true };
  } catch (error: unknown) {
    // Standardized Backend Error Logging
    console.error('[Action: submitContactMessage] Exception:', error);

    return {
      error:
        'An unexpected error occurred while sending your message. Please try again later.',
    };
  }
}
