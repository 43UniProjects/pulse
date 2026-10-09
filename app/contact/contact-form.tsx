'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitContactMessage } from './actions';
import { contactSchema } from './schema';
import { PreFillData } from './data';

interface ContactFormProps {
  user: PreFillData;
}

export default function ContactForm({ user }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitContactMessage,
    null,
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>(
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  const isGuest = user.role === 'guest';
  const formTitle =
    user.role === 'guest' || user.role === 'admin'
      ? 'Contact Developers'
      : 'Contact Support';

  useEffect(() => {
    if (state?.success) {
      toast.success('Message sent successfully!');
      formRef.current?.reset();
    } else if (state?.error && !state?.fieldErrors) {
      toast.error(state.error);
    }
  }, [state]);

  const handleClientValidation = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    const validation = contactSchema.safeParse(rawData);

    if (!validation.success) {
      e.preventDefault();
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      });

      setClientErrors(errors);
      toast.error('Please fix the errors in the form.');
    } else {
      setClientErrors({});
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {formTitle}
      </h2>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleClientValidation}
        className="space-y-4"
      >
        {/* Hidden fields to pass state to the Server Action */}
        <input type="hidden" name="userId" value={user._id || ''} />
        <input type="hidden" name="senderRole" value={user.role} />

        {/* If logged in, pass name and email silently. If guest, show the inputs. */}
        {!isGuest && (
          <>
            <input type="hidden" name="name" value={user.name} />
            <input type="hidden" name="email" value={user.email} />
          </>
        )}

        {isGuest && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {(clientErrors.name || state?.fieldErrors?.name) && (
                <p className="text-xs text-red-500">
                  {clientErrors.name?.[0] || state?.fieldErrors?.name?.[0]}
                </p>
              )}
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
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {(clientErrors.email || state?.fieldErrors?.email) && (
                <p className="text-xs text-red-500">
                  {clientErrors.email?.[0] || state?.fieldErrors?.email?.[0]}
                </p>
              )}
            </div>
          </>
        )}

        <div className="space-y-2">
          <label
            htmlFor="targetAudience"
            className="text-sm font-medium text-foreground"
          >
            Department
          </label>
          <select
            id="targetAudience"
            name="targetAudience"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          >
            <option value="">Select a department...</option>
            <option value="support">General Support</option>
            <option value="technical">Technical Assistance</option>
            <option value="billing">Partnerships & Billing</option>
          </select>
          {(clientErrors.targetAudience ||
            state?.fieldErrors?.targetAudience) && (
            <p className="text-xs text-red-500">
              {clientErrors.targetAudience?.[0] ||
                state?.fieldErrors?.targetAudience?.[0]}
            </p>
          )}
        </div>

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
            placeholder="e.g., General Inquiry or Bug Report"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {(clientErrors.subject || state?.fieldErrors?.subject) && (
            <p className="text-xs text-red-500">
              {clientErrors.subject?.[0] || state?.fieldErrors?.subject?.[0]}
            </p>
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
            className="w-full p-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all resize-none"
          ></textarea>
          {(clientErrors.message || state?.fieldErrors?.message) && (
            <p className="text-xs text-red-500">
              {clientErrors.message?.[0] || state?.fieldErrors?.message?.[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 mt-2 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}
