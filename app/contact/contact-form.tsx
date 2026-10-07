'use client';

import { useActionState, useEffect } from 'react';
import { submitContactMessage } from '@/actions/contact.actions';
import { UserRole } from '@/types/user.type';

interface ContactFormProps {
  userRole: UserRole | 'Guest';
}

const initialState = {
  success: false,
  message: '',
  errors: undefined,
};

export default function ContactForm({ userRole }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitContactMessage,
    initialState,
  );

  const isGuest = userRole === 'Guest';
  const formTitle =
    userRole === 'Guest' || userRole === 'admin'
      ? 'Contact Developers'
      : 'Contact Support';

  useEffect(() => {
    if (state.success) {
      // In a real app, you'd trigger a toast here
      alert('Message sent successfully!');
      // Reset form could be handled here or via form ref
    } else if (state.message && !state.success && !state.errors) {
      alert(state.message);
    }
  }, [state]);

  return (
    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {formTitle}
      </h2>
      <form action={formAction} className="space-y-4">
        {isGuest && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-foreground"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-foreground"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.email && (
                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
              )}
            </div>
          </>
        )}

        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-sm font-medium text-foreground"
          >
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="e.g., General Inquiry or Bug Report"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {state.errors?.subject && (
            <p className="text-xs text-red-500">{state.errors.subject[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-sm font-medium text-foreground"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="w-full p-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all resize-none"
          ></textarea>
          {state.errors?.message && (
            <p className="text-xs text-red-500">{state.errors.message[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 mt-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send Message'}
        </button>

        {state.success && (
          <p className="text-sm text-green-500 mt-2">{state.message}</p>
        )}
      </form>
    </div>
  );
}
