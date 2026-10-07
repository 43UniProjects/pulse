'use server';

import { z } from 'zod';
import { connectToDatabase } from '@/lib/db/connect';
import { Contact } from '@/lib/models/contact.model';
import { getServerSession } from 'next-auth';

export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  subject: z
    .string()
    .min(3, { message: 'Subject must be at least 3 characters' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' }),
});

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitContactMessage(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawData = {
      name: formData.get('firstName') + ' ' + formData.get('lastName'),
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const session = await getServerSession();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contactData: any = {
      subject: rawData.subject,
      message: rawData.message,
      status: 'pending',
    };

    if (session && session.user) {
      // Authenticated User
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      contactData.userId = user.id || user._id;
      contactData.name = user.name || rawData.name;
      contactData.email = user.email || rawData.email;
      contactData.senderRole = user.role;

      // Target Audience Routing
      const roleTargetMap: Record<string, string> = {
        Admin: 'developer',
        Donor: 'admin',
        Hospital: 'admin',
      };

      contactData.targetAudience = roleTargetMap[user.role] || 'developer';

      // We don't validate name/email from form if logged in
      const validatedFields = ContactFormSchema.pick({
        subject: true,
        message: true,
      }).safeParse(contactData);

      if (!validatedFields.success) {
        return {
          success: false,
          message: 'Invalid fields provided.',
          errors: validatedFields.error.flatten().fieldErrors,
        };
      }
    } else {
      // Guest User
      const validatedFields = ContactFormSchema.safeParse({
        name:
          rawData.name.trim() === 'null null' || rawData.name.trim() === ' '
            ? ''
            : rawData.name.trim(), // simple check for empty names
        email: rawData.email,
        subject: rawData.subject,
        message: rawData.message,
      });

      if (!validatedFields.success) {
        return {
          success: false,
          message: 'Invalid fields provided.',
          errors: validatedFields.error.flatten().fieldErrors,
        };
      }

      contactData.userId = null;
      contactData.name = validatedFields.data.name;
      contactData.email = validatedFields.data.email;
      contactData.senderRole = 'Guest';
      contactData.targetAudience = 'developer';
    }

    await connectToDatabase();
    await Contact.create(contactData);

    return {
      success: true,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return {
      success: false,
      message: 'Failed to send message. Please try again later.',
    };
  }
}
