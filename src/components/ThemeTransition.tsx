'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function ThemeTransition() {
  const { theme, resolvedTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionClass, setTransitionClass] = useState<'dark-sweep' | 'light-sweep' | null>(null);
  const [prevTheme, setPrevTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Skip on initial mount
    if (prevTheme === undefined) {
      setPrevTheme(resolvedTheme);
      return;
    }

    // Check if theme actually changed
    const currentTheme = resolvedTheme || theme;
    if (currentTheme !== prevTheme && prevTheme !== undefined) {
      // Determine sweep direction
      const sweepClass = currentTheme === 'dark' ? 'dark-sweep' : 'light-sweep';
      
      setTransitionClass(sweepClass);
      setIsTransitioning(true);

      // Remove overlay after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionClass(null);
      }, 400); // Match animation duration + small buffer

      setPrevTheme(currentTheme);

      return () => clearTimeout(timer);
    }
  }, [theme, resolvedTheme, prevTheme]);

  if (!isTransitioning || !transitionClass) return null;

  return (
    <div 
      className={`theme-sweep-overlay ${transitionClass}`}
      aria-hidden="true"
    />
  );
}
