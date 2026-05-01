'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-5 w-5 animate-pulse rounded-full bg-muted/50"></div>
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-all scale-100 rotate-0" />
      ) : (
        <Moon className="h-5 w-5 text-slate-500 transition-all scale-100 rotate-0" />
      )}
    </Button>
  );
}
