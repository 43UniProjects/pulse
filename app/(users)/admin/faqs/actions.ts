'use server';

import mongoose from 'mongoose';
import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { connectToDatabase } from '@/lib/db/connect';
import { Faq } from '@/lib/models/faq.model';

export type FaqActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

const faqContentSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, 'Question must be at least 3 characters.')
    .max(500, 'Question cannot exceed 500 characters.'),
  answer: z
    .string()
    .trim()
    .min(3, 'Answer must be at least 3 characters.')
    .max(5000, 'Answer cannot exceed 5000 characters.'),
});

async function requireAdminSession(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return Boolean(session?.user && session.user.role === 'admin');
}

export async function addFaq(
  prevState: FaqActionState | null,
  formData: FormData,
): Promise<FaqActionState> {
  if (!(await requireAdminSession())) {
    return {
      success: false,
      error: 'Unauthorized: Administrator access required.',
    };
  }

  const parsed = faqContentSchema.safeParse({
    question: formData.get('question')?.toString() ?? '',
    answer: formData.get('answer')?.toString() ?? '',
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message || 'Question and answer are required.',
    };
  }

  try {
    await connectToDatabase();
    await Faq.create(parsed.data);
    revalidatePath('/admin/faqs');
    revalidatePath('/support');
    return { success: true, message: 'FAQ added successfully.' };
  } catch (error: unknown) {
    console.error('[Action: addFaq]', error);
    return { success: false, error: 'Failed to add FAQ.' };
  }
}

export async function updateFaq(
  prevState: FaqActionState | null,
  formData: FormData,
): Promise<FaqActionState> {
  if (!(await requireAdminSession())) {
    return {
      success: false,
      error: 'Unauthorized: Administrator access required.',
    };
  }

  const id = formData.get('id')?.toString()?.trim() ?? '';
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: 'Invalid FAQ identifier.' };
  }

  const parsed = faqContentSchema.safeParse({
    question: formData.get('question')?.toString() ?? '',
    answer: formData.get('answer')?.toString() ?? '',
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ||
        'ID, question, and answer are required.',
    };
  }

  try {
    await connectToDatabase();
    const updated = await Faq.findByIdAndUpdate(id, parsed.data);
    if (!updated) {
      return { success: false, error: 'FAQ not found.' };
    }
    revalidatePath('/admin/faqs');
    revalidatePath('/support');
    return { success: true, message: 'FAQ updated successfully.' };
  } catch (error: unknown) {
    console.error('[Action: updateFaq]', error);
    return { success: false, error: 'Failed to update FAQ.' };
  }
}

export async function deleteFaq(id: string): Promise<FaqActionState> {
  if (!(await requireAdminSession())) {
    return {
      success: false,
      error: 'Unauthorized: Administrator access required.',
    };
  }

  const trimmedId = typeof id === 'string' ? id.trim() : '';
  if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
    return { success: false, error: 'Invalid FAQ identifier.' };
  }

  try {
    await connectToDatabase();
    const deleted = await Faq.findByIdAndDelete(trimmedId);
    if (!deleted) {
      return { success: false, error: 'FAQ not found.' };
    }
    revalidatePath('/admin/faqs');
    revalidatePath('/support');
    return { success: true, message: 'FAQ deleted successfully.' };
  } catch (error: unknown) {
    console.error('[Action: deleteFaq]', error);
    return { success: false, error: 'Failed to delete FAQ.' };
  }
}
