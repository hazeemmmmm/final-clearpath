import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference on initial load
    const savedTheme = localStorage.getItem('clearpath_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply class to html element for Tailwind global CSS targeting
    if (isDarkMode) {
      document.documentElement.classList.add('dark', 'tw-dark');
      document.body.classList.add('tw-bg-[#0a0b0d]', 'tw-text-white');
      document.body.classList.remove('tw-bg-slate-50', 'tw-text-slate-900');
      localStorage.setItem('clearpath_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark', 'tw-dark');
      document.body.classList.add('tw-bg-slate-50', 'tw-text-slate-900');
      document.body.classList.remove('tw-bg-[#0a0b0d]', 'tw-text-white');
      localStorage.setItem('clearpath_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
