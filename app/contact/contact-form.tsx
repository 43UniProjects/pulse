'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  Loader2,
  User,
  Mail,
  Building,
  Tag,
  Send,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { submitContactMessage } from '@/app/contact/actions';
import { contactSchema } from '@/app/contact/schema';
import { PreFillData } from '@/app/contact/data';

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
  const lastStateRef = useRef(state);

  const isGuest = user.role === 'guest';
  const formTitle =
    user.role === 'guest' || user.role === 'admin'
      ? 'Contact Developers'
      : 'Contact Support';

  useEffect(() => {
    if (state === lastStateRef.current) return;
    lastStateRef.current = state;

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          {formTitle}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Send us your message and our team will get back to you promptly.
        </p>
      </div>

      {/* Authenticated user indicator badge */}
      {!isGuest && (
        <div className="bg-secondary/50 border border-border rounded-lg p-3.5 mb-5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary shrink-0" />
            <span>
              Signed in as{' '}
              <strong className="text-foreground">{user.name}</strong> (
              {user.email})
            </span>
          </div>
          <span className="capitalize font-mono text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
            {user.role}
          </span>
        </div>
      )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-foreground block"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-70 pointer-events-none" />
              </div>
              {(clientErrors.name || state?.fieldErrors?.name) && (
                <p className="text-xs text-red-500">
                  {clientErrors.name?.[0] || state?.fieldErrors?.name?.[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-foreground block"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-70 pointer-events-none" />
              </div>
              {(clientErrors.email || state?.fieldErrors?.email) && (
                <p className="text-xs text-red-500">
                  {clientErrors.email?.[0] || state?.fieldErrors?.email?.[0]}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="targetAudience"
            className="text-xs font-medium text-foreground block"
          >
            Department <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="targetAudience"
              name="targetAudience"
              defaultValue=""
              className="w-full h-10 pl-9 pr-9 appearance-none rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all cursor-pointer"
            >
              <option value="" disabled>
                Select a department...
              </option>
              <option value="support">General Support</option>
              <option value="technical">Technical Assistance</option>
              <option value="billing">Partnerships & Billing</option>
            </select>
            <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-70 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3 opacity-70 pointer-events-none" />
          </div>
          {(clientErrors.targetAudience ||
            state?.fieldErrors?.targetAudience) && (
            <p className="text-xs text-red-500">
              {clientErrors.targetAudience?.[0] ||
                state?.fieldErrors?.targetAudience?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="subject"
            className="text-xs font-medium text-foreground block"
          >
            Subject <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="e.g. General Inquiry or Hospital Integration"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            />
            <Tag className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-70 pointer-events-none" />
          </div>
          {(clientErrors.subject || state?.fieldErrors?.subject) && (
            <p className="text-xs text-red-500">
              {clientErrors.subject?.[0] || state?.fieldErrors?.subject?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="message"
            className="text-xs font-medium text-foreground block"
          >
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Write your message here in detail..."
            className="w-full p-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all resize-none"
          />
          {(clientErrors.message || state?.fieldErrors?.message) && (
            <p className="text-xs text-red-500">
              {clientErrors.message?.[0] || state?.fieldErrors?.message?.[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 mt-2 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
