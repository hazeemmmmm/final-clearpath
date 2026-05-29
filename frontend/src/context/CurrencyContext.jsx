import React, { createContext, useState, useEffect } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // Try to load saved currency from localStorage or default to 'USD'
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('appCurrency') || 'EGP';
  });

  // Example fixed exchange rate (for demonstration purposes)
  // In a real app, this might be fetched from an API
  const exchangeRate = 50; // 1 USD = 50 EGP

  const toggleCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('appCurrency', newCurrency);
  };

  const convertPrice = (priceInEgp) => {
    if (!priceInEgp) return 0;
    if (currency === 'EGP') {
      return priceInEgp;
    }
    // Convert to USD
    return parseFloat((priceInEgp / exchangeRate).toFixed(2));
  };

  const formatPrice = (priceInEgp) => {
    const converted = convertPrice(priceInEgp);
    return currency === 'EGP' ? `${converted} EGP` : `$${converted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convertPrice, formatPrice, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};
