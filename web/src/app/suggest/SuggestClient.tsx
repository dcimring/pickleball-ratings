"use client";

import { useState, useEffect, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { SuggestFeature } from '@/components/SuggestFeature';
import { submitFeatureRequest } from '../actions';

export function SuggestClient() {
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

  return (
    <SuggestFeature 
      formAction={formAction}
      formState={formState}
      nameInput={nameInput}
      onNameInputChange={setNameInput}
      nameSuggestions={nameSuggestions}
      loading={loading}
    />
  );
}
