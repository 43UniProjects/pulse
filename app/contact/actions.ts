'use server';

import { saveContactMessage } from './data';
import { contactSchema } from './schema';

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
  const validation = contactSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};

    validation.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    });

    return {
      fieldErrors,
      error: 'Please fix the errors in the form.',
    };
  }

  try {
    const { userId, ...rest } = validation.data;

    await saveContactMessage({
      ...rest,
      userId: userId ? userId : null, // Mongoose requires null instead of empty string for ObjectIds
      status: 'pending',
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('[Action: submitContactMessage]', error);
    return { error: 'An unexpected error occurred while sending the message.' };
  }
}
