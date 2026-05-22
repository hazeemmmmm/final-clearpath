import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    // Check local storage for saved language
    return localStorage.getItem('clearpath_lang') || 'EN';
  });

  useEffect(() => {
    // Save to local storage whenever it changes
    localStorage.setItem('clearpath_lang', lang);
    
    // Optional: Add a class to body if you want layout changes (like RTL for Arabic)
    if (lang === 'AR') {
      document.body.classList.add('lang-ar');
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.classList.remove('lang-ar');
      document.body.setAttribute('dir', 'ltr');
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'EN' ? 'AR' : 'EN'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
