"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestFeatureProps {
  formAction: (payload: FormData) => void;
  formState: { success?: boolean; error?: string };
  nameInput: string;
  onNameInputChange: (val: string) => void;
  nameSuggestions: string[];
  loading: boolean;
}

export function SuggestFeature({
  formAction,
  formState,
  nameInput,
  onNameInputChange,
  nameSuggestions,
  loading,
}: SuggestFeatureProps) {
  return (
    <div className="max-w-xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-left min-h-full">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageSquarePlus className="w-5 h-5 text-primary" />
          <span className="text-primary font-display font-bold tracking-widest text-sm uppercase">Roadmap</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-foreground leading-[0.9] uppercase">
          SUGGEST A <br />
          <span className="text-primary">FEATURE</span>
        </h1>
        <p className="mt-6 text-muted-foreground font-sans text-lg text-balance">
          Have an idea to make DinkDash better? Let us know what tools or data you want to see next.
        </p>
      </div>

      <div className="bg-secondary/30 border border-border rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-12 h-12 text-primary fill-primary" />
            </motion.div>
            <p className="mt-4 font-display text-primary font-bold tracking-widest animate-pulse text-[10px]">LOADING...</p>
          </div>
        ) : formState.success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center flex flex-col items-center"
          >
            <CheckCircle2 className="w-16 h-16 text-primary mb-6" />
            <h3 className="font-display text-3xl font-bold text-foreground mb-4 tracking-tight uppercase">Dink Received!</h3>
            <p className="text-muted-foreground font-medium">Thanks for the suggestion. Redirecting you back...</p>
          </motion.div>
        ) : (
          <form action={formAction} className="space-y-8">
            {/* Honeypot */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            
            <div className="space-y-3 relative">
              <label className="block font-display text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase ml-1 opacity-50">Your Name</label>
              <input 
                name="user_name"
                required
                value={nameInput}
                onChange={(e) => onNameInputChange(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-background border border-border rounded-2xl p-5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-foreground placeholder:text-muted-foreground/30 font-medium"
              />
              
              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {nameSuggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 left-0 right-0 top-full mt-2 bg-secondary border border-border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
                  >
                    {nameSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onNameInputChange(name)}
                        className="w-full px-6 py-4 text-left hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors font-sans text-sm font-bold border-b border-border last:border-0"
                      >
                        {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <label className="block font-display text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase ml-1 opacity-50">The Feature Idea</label>
              <textarea 
                name="details"
                required
                placeholder="Describe the feature and how it helps players..."
                className="w-full h-56 bg-background border border-border rounded-2xl p-5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-foreground placeholder:text-muted-foreground/30 resize-none font-medium"
              />
            </div>


            {formState.error && (
              <p className="text-red-400 text-xs font-sans font-bold text-center">{formState.error}</p>
            )}

            <button 
              type="submit"
              className="w-full mt-8 bg-primary hover:opacity-90 text-primary-foreground font-display font-bold py-5 rounded-2xl transition-all tracking-[0.2em] text-sm flex items-center justify-center shadow-lg shadow-primary/20"
            >
              SUBMIT FEATURE REQUEST
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
