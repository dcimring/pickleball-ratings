"use client";

import { useState, useEffect, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { SuggestFeature } from '@/components/SuggestFeature';
import { submitFeatureRequest } from '../actions';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function SuggestPage() {
  const router = useRouter();
  const { singles, doubles, loading } = useData();
  const [nameInput, setNameInput] = useState('');
  const [formState, formAction] = useFormState(submitFeatureRequest, {});

  const allUniqueNames = useMemo(() => {
    const names = new Set([...singles, ...doubles].map(p => p.player_name));
    return Array.from(names).sort();
  }, [singles, doubles]);

  const nameSuggestions = useMemo(() => {
    if (!nameInput.trim()) return [];
    return allUniqueNames
      .filter(n => n.toLowerCase().includes(nameInput.toLowerCase()))
      .slice(0, 5);
  }, [allUniqueNames, nameInput]);

  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.success, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-12 h-12 text-volt fill-volt" />
        </motion.div>
        <p className="mt-4 font-display text-volt tracking-widest animate-pulse">LOADING COURT DATA...</p>
      </div>
    );
  }

  return (
    <SuggestFeature 
      formAction={formAction}
      formState={formState}
      nameInput={nameInput}
      onNameInputChange={setNameInput}
      nameSuggestions={nameSuggestions}
    />
  );
}
