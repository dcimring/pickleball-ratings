"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { submitRemovalRequest } from '../actions';

const fieldClass =
  'w-full bg-background rounded-md px-3 outline-none font-sans font-medium text-[15px] text-foreground focus:shadow-[inset_0_0_0_1px_oklch(var(--primary))] transition-shadow';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[50px] rounded-md bg-primary text-primary-foreground font-display font-bold text-[15px] uppercase tracking-[0.16em] hover:opacity-90 transition-all disabled:opacity-60 mt-1"
    >
      {pending ? 'Sending…' : 'Send request'}
    </button>
  );
}

export function RemoveClient() {
  const [formState, formAction] = useActionState(submitRemovalRequest, {});

  return (
    <div className="pb-24 min-h-full bg-background">
      <PageHero
        eyebrow={['Privacy', 'Player profiles']}
        kicker="Your data"
        title={<>Remove<br />a profile</>}
        lead="Ask us to take down your player profile. Requests are reviewed by hand, and we may contact you to confirm it's yours."
      />

      <div className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-xl md:mx-auto flex flex-col gap-3.5">
          <div className="bg-secondary rounded-lg p-4 md:p-6">
            {formState.success ? (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="w-14 h-14 text-primary" />
                <h2 className="font-display font-extrabold uppercase text-3xl">Request received</h2>
                <p className="text-muted-foreground text-sm">We&apos;ll follow up using the contact details you gave.</p>
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-4">
                {/* Honeypot */}
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="player_name" className="kicker text-[13px]">Player name</label>
                  <input id="player_name" name="player_name" required maxLength={50} placeholder="As it appears in the rankings" autoComplete="off" className={`${fieldClass} h-12`} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact" className="kicker text-[13px]">Email or WhatsApp number</label>
                  <input id="contact" name="contact" required maxLength={120} placeholder="So we can confirm and reply" autoComplete="off" className={`${fieldClass} h-12`} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="note" className="kicker text-[13px]">Anything else (optional)</label>
                  <textarea id="note" name="note" rows={4} maxLength={500} className={`${fieldClass} py-3 leading-relaxed resize-none`} />
                </div>

                {formState.error && (
                  <p className="text-destructive text-sm font-semibold" role="alert">{formState.error}</p>
                )}

                <SubmitButton />
              </form>
            )}
          </div>
          <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed px-1">
            This removes your profile page from this site. Search engines can take a while to drop it, and your name may
            remain on the rankings board while pickleball.ky publishes it.
          </p>
        </div>
      </div>
    </div>
  );
}
