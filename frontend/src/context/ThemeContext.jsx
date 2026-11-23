import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeContext provides the global appearance state (Light vs Dark mode).
 * Demonstrates:
 * - React Context API (createContext, useContext)
 * - useState for theme state tracking
 * - useEffect for synchronizing with the browser DOM and localStorage persistence
 */
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 1. Initialize state from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('syncspace_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Default to light mode as requested in specification
    return 'light';
  });

  // 2. Synchronize the HTML class when theme state changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('syncspace_theme', theme);
  }, [theme]);

  // 3. Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
