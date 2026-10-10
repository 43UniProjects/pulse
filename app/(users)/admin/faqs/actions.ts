'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db/connect';
import { Faq } from '@/lib/models/faq.model';

export type FaqActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function addFaq(
  prevState: FaqActionState | null,
  formData: FormData,
): Promise<FaqActionState> {
  try {
    await connectToDatabase();
    const question = formData.get('question')?.toString();
    const answer = formData.get('answer')?.toString();

    if (!question || !answer) {
      return { success: false, error: 'Question and answer are required.' };
    }

    await Faq.create({ question, answer });
    revalidatePath('/admin/faqs');
    return { success: true, message: 'FAQ added successfully.' };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to add FAQ.';
    return { success: false, error: errorMessage };
  }
}

export async function updateFaq(
  prevState: FaqActionState | null,
  formData: FormData,
): Promise<FaqActionState> {
  try {
    await connectToDatabase();
    const id = formData.get('id')?.toString();
    const question = formData.get('question')?.toString();
    const answer = formData.get('answer')?.toString();

    if (!id || !question || !answer) {
      return {
        success: false,
        error: 'ID, question, and answer are required.',
      };
    }

    await Faq.findByIdAndUpdate(id, { question, answer });
    revalidatePath('/admin/faqs');
    return { success: true, message: 'FAQ updated successfully.' };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update FAQ.';
    return { success: false, error: errorMessage };
  }
}

export async function deleteFaq(id: string): Promise<FaqActionState> {
  try {
    await connectToDatabase();
    await Faq.findByIdAndDelete(id);
    revalidatePath('/admin/faqs');
    return { success: true, message: 'FAQ deleted successfully.' };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete FAQ.';
    return { success: false, error: errorMessage };
  }
}
