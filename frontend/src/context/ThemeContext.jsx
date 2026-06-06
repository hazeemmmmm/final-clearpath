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
    if (isDarkMode) {
      document.documentElement.classList.add('dark', 'tw-dark');
      document.body.classList.remove('tw-bg-slate-50', 'tw-bg-[#0a0b0d]', 'tw-text-slate-900');
      document.body.classList.add('tw-text-white', 'dark-mode');
      document.body.style.background = 'linear-gradient(to right, #363795, #005C97)';
      localStorage.setItem('clearpath_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark', 'tw-dark');
      document.body.classList.remove('tw-bg-[#0a0b0d]', 'tw-text-white', 'dark-mode');
      document.body.classList.add('tw-text-slate-900');
      document.body.style.background = '#FFFAF2';
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
