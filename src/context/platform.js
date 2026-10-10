import { createContext, useContext } from 'react';

export const PlatformContext = createContext(null);

export const usePlatform = () => {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within a PlatformProvider');
  return ctx;
};

export const useFeature = (featureId) => usePlatform().isFeatureAvailable(featureId);
