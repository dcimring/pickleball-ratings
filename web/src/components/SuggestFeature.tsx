"use client";

import { useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { Spinner } from '@/components/Spinner';
import { SITE_NAME } from '@/lib/site-config';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[50px] rounded-md bg-primary text-primary-foreground font-display font-bold text-[15px] uppercase tracking-[0.16em] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 mt-1"
    >
      {pending ? 'Sending…' : 'Send suggestion'}
    </button>
  );
}

interface SuggestFeatureProps {
  formAction: (payload: FormData) => void;
  formState: { success?: boolean; error?: string };
  nameInput: string;
  onNameInputChange: (val: string) => void;
  onSelectSuggestion: (val: string) => void;
  nameSuggestions: string[];
  loading: boolean;
}

export function SuggestFeature({
  formAction,
  formState,
  nameInput,
  onNameInputChange,
  onSelectSuggestion,
  nameSuggestions,
  loading,
}: SuggestFeatureProps) {
  const fieldClass =
    'w-full bg-background rounded-md px-3 outline-none font-sans font-medium text-[15px] text-foreground focus:shadow-[inset_0_0_0_1px_oklch(var(--primary))] transition-shadow';

  return (
    <div className="pb-24 min-h-full bg-background">
      <PageHero
        eyebrow={['Roadmap', 'Built for Cayman players']}
        kicker="Tell us what to build"
        title={<>Suggest<br />a feature</>}
        lead={`What would make ${SITE_NAME} more useful on court, in the group chat, or the night before a tournament?`}
      />

      <div className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-xl md:mx-auto flex flex-col gap-3.5">
          <div className="bg-secondary rounded-lg p-4 md:p-6 min-h-[420px] flex flex-col">
            {loading ? (
              <Spinner />
            ) : formState.success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 py-16 text-center flex flex-col items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-14 h-14 text-primary" />
                <h2 className="font-display font-extrabold uppercase text-3xl">Got it</h2>
                <p className="text-muted-foreground text-sm">Thanks for the suggestion. Taking you back to the board.</p>
              </motion.div>
            ) : (
              <form action={formAction} className="flex-1 flex flex-col gap-4">
                {/* Honeypot */}
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="flex flex-col gap-1.5 relative">
                  <label htmlFor="user_name" className="kicker text-[13px]">Your name</label>
                  <input
                    id="user_name"
                    name="user_name"
                    required
                    value={nameInput}
                    onChange={(e) => onNameInputChange(e.target.value)}
                    placeholder="As it appears in the rankings"
                    autoComplete="off"
                    className={`${fieldClass} h-12`}
                  />
                  <span className="text-xs text-muted-foreground">We match it to a player so we can follow up.</span>

                  <AnimatePresence>
                    {nameSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute z-20 left-0 right-0 top-[76px] bg-muted rounded-md overflow-hidden shadow-outline shadow-2xl"
                      >
                        {nameSuggestions.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => onSelectSuggestion(name)}
                            className="w-full h-11 px-3 text-left hover:bg-secondary text-foreground font-sans font-medium text-sm shadow-hairline last:shadow-none transition-colors"
                          >
                            {name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="details" className="kicker text-[13px]">The idea</label>
                  <textarea
                    id="details"
                    name="details"
                    required
                    rows={7}
                    placeholder="Describe the feature and who it helps"
                    className={`${fieldClass} py-3 leading-relaxed resize-none`}
                  />
                </div>

                {formState.error && (
                  <p className="text-destructive text-sm font-semibold" role="alert">{formState.error}</p>
                )}

                <SubmitButton />
              </form>
            )}
          </div>
          <p className="flex items-start gap-2.5 text-xs md:text-[13px] text-muted-foreground leading-relaxed px-1">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            Suggestions go straight to the person who builds the site. Expect a reply, not a ticket number.
          </p>
        </div>
      </div>
    </div>
  );
}
