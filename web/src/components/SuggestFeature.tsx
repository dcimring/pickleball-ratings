"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, CheckCircle2, Zap, Star } from 'lucide-react';
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
    <div className="max-w-xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-left min-h-full bg-background">
      <div className="mb-16 space-y-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="text-primary font-sans font-bold tracking-[0.2em] text-[10px] uppercase">Community Roadmap</span>
        </div>
        <h1 className="text-6xl md:text-[7rem] font-display italic tracking-tighter text-foreground leading-[0.85]">
          Suggest a <br />
          Feature
        </h1>
        <p className="text-foreground/40 max-w-xl mx-auto font-medium text-lg text-balance">
          Have an idea to make DinkDash better? Let us know what tools or data you want to see next.
        </p>
      </div>

      <div className="bg-muted p-1 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-40 bg-secondary">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-12 h-12 text-primary/10 fill-primary/10" />
            </motion.div>
          </div>
        ) : formState.success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 py-20 text-center flex flex-col items-center justify-center bg-secondary"
          >
            <CheckCircle2 className="w-20 h-20 text-primary mb-8" />
            <h3 className="font-display italic text-4xl text-foreground mb-4 tracking-tighter">Dink Received!</h3>
            <p className="text-foreground/40 font-medium">Thanks for the suggestion. Redirecting you back...</p>
          </motion.div>
        ) : (
          <form action={formAction} className="flex-1 flex flex-col gap-1 bg-muted">
            <div className="bg-secondary p-10 space-y-8">
              {/* Honeypot */}
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              
              <div className="space-y-4 relative">
                <label className="block font-sans text-[10px] font-bold tracking-[0.4em] text-foreground/30 uppercase ml-1">Your Name</label>
                <input 
                  name="user_name"
                  required
                  value={nameInput}
                  onChange={(e) => onNameInputChange(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-background rounded-2xl p-6 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-sans text-foreground placeholder:text-foreground/20 font-medium text-lg"
                />
                
                {/* Autocomplete Suggestions */}
                <AnimatePresence>
                  {nameSuggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 left-0 right-0 top-full mt-2 bg-secondary rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl border border-muted"
                    >
                      {nameSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => onNameInputChange(name)}
                          className="w-full px-8 py-5 text-left hover:bg-muted text-foreground/60 hover:text-primary transition-colors font-sans text-sm font-bold border-b border-muted last:border-0"
                        >
                          {name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <label className="block font-sans text-[10px] font-bold tracking-[0.4em] text-foreground/30 uppercase ml-1">The Feature Idea</label>
                <textarea 
                  name="details"
                  required
                  placeholder="Describe the feature and how it helps players..."
                  className="w-full h-64 bg-background rounded-2xl p-6 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-sans text-foreground placeholder:text-foreground/20 resize-none font-medium text-lg"
                />
              </div>

              {formState.error && (
                <p className="text-destructive text-xs font-sans font-bold text-center">{formState.error}</p>
              )}
            </div>

            <div className="bg-secondary p-10 pt-0">
              <button 
                type="submit"
                className="w-full bg-primary hover:opacity-95 text-secondary font-sans font-bold py-6 rounded-2xl transition-all tracking-[0.2em] text-xs uppercase shadow-xl shadow-primary/10 flex items-center justify-center"
              >
                Submit Feature Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
