"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, CheckCircle2 } from 'lucide-react';
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
    <div className="max-w-xl mx-auto px-6 pt-6 pb-20 text-left min-h-full">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageSquarePlus className="w-5 h-5 text-volt" />
          <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Roadmap</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-white uppercase">
          SUGGEST A <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">FEATURE</span>
        </h1>
        <p className="mt-4 text-ghost/60 font-sans text-lg text-balance">
          Have an idea to make DinkDash better? Let us know what tools or data you want to see next.
        </p>
      </div>

      <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden scroll-mt-20 min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-12 h-12 text-volt fill-volt" />
            </motion.div>
            <p className="mt-4 font-display text-volt tracking-widest animate-pulse text-[10px]">LOADING...</p>
          </div>
        ) : formState.success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center flex flex-col items-center"
          >
            <CheckCircle2 className="w-16 h-16 text-volt mb-4" />
            <h3 className="font-display text-2xl font-black text-white mb-2 tracking-tight">DINK RECEIVED!</h3>
            <p className="text-ghost/60 font-sans">Thanks for the suggestion. Redirecting you back...</p>
          </motion.div>
        ) : (
          <form action={formAction} className="space-y-6">
            {/* Honeypot */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            
            <div className="space-y-2 relative">
              <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase ml-1">Your Name</label>
              <input 
                name="user_name"
                required
                value={nameInput}
                onChange={(e) => onNameInputChange(e.target.value)}
                onFocus={(e) => {
                  if (window.innerWidth < 768) {
                    setTimeout(() => {
                      e.target.closest('.scroll-mt-20')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                placeholder="Enter your name"
                className="w-full bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20"
              />
              
              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {nameSuggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 left-0 right-0 top-full mt-2 bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
                  >
                    {nameSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onNameInputChange(name)}
                        className="w-full px-6 py-4 text-left hover:bg-white/5 text-ghost/60 hover:text-volt transition-colors font-sans text-sm border-b border-white/5 last:border-0"
                      >
                        {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase ml-1">The Feature Idea</label>
              <textarea 
                name="details"
                required
                onFocus={(e) => {
                  if (window.innerWidth < 768) {
                    setTimeout(() => {
                      e.target.closest('.scroll-mt-20')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                placeholder="Describe the feature and how it helps players..."
                className="w-full h-48 bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20 resize-none"
              />
            </div>

            {formState.error && (
              <p className="text-red-400 text-xs font-sans text-center">{formState.error}</p>
            )}

            <button 
              type="submit"
              className="w-full mt-6 bg-volt hover:bg-volt/90 text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm flex items-center justify-center"
            >
              SUBMIT FEATURE REQUEST
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
