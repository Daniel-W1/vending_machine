import { useState, useCallback } from 'react';

type LoadingStates = {
  [key: string]: boolean;
};

export function useLoadingStates(initialStates: string[]) {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(
    initialStates.reduce((acc, state) => ({ ...acc, [state]: false }), {})
  );

  const setLoading = useCallback((state: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [state]: isLoading }));
  }, []);

  const isLoading = useCallback((state: string) => loadingStates[state], [loadingStates]);

  return { setLoading, isLoading };
}