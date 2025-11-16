import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type OnboardingStep = 
  | 'welcome'
  | 'collection'
  | 'deck-builder'
  | 'battle-intro'
  | 'battle-controls'
  | 'attribute-selection'
  | 'battle-result'
  | 'completed';

interface OnboardingState {
  currentStep: OnboardingStep;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  stepsCompleted: OnboardingStep[];
}

const ONBOARDING_STORAGE_KEY = 'cavaleiros-onboarding-state';

export function useOnboarding() {
  const { user } = useAuth();
  
  const [state, setState] = useState<OnboardingState>(() => {
    if (!user) {
      return {
        currentStep: 'welcome',
        isActive: false,
        hasCompletedOnboarding: false,
        stepsCompleted: [],
      };
    }

    const stored = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}-${user.id}`);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      currentStep: 'welcome',
      isActive: true,
      hasCompletedOnboarding: false,
      stepsCompleted: [],
    };
  });

  // Persist state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `${ONBOARDING_STORAGE_KEY}-${user.id}`,
        JSON.stringify(state)
      );
    }
  }, [state, user]);

  const startOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 'welcome',
    }));
  }, []);

  const nextStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      stepsCompleted: [...new Set([...prev.stepsCompleted, prev.currentStep])],
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      hasCompletedOnboarding: true,
      currentStep: 'completed',
      stepsCompleted: [...new Set([...prev.stepsCompleted, prev.currentStep])],
    }));
  }, []);

  const skipOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      hasCompletedOnboarding: true,
      currentStep: 'completed',
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    if (user) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}-${user.id}`);
    }
    setState({
      currentStep: 'welcome',
      isActive: true,
      hasCompletedOnboarding: false,
      stepsCompleted: [],
    });
  }, [user]);

  return {
    ...state,
    startOnboarding,
    nextStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}