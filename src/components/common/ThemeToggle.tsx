import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-200/70 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300/80 dark:hover:bg-stone-700 transition-all font-semibold text-xs shadow-xs"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="hidden xs:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden xs:inline">Light</span>
        </>
      )}
    </button>
  );
};
